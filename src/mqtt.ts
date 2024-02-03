import { MqttClient, connectAsync } from "mqtt";
import devices from "./ha-devices.js";
import { NetgearStatus } from "./netgear.js";

export class Mqtt {
  client?: MqttClient;
  count = 0;
  host = process.env.MQTT_HOST;
  status: any;
  sms?: ISmsController;

  init = async (status: NetgearStatus, sms: ISmsController) => {
    this.status = status;
    this.sms = sms;
    if (!this.client && this.host) {
      const client = await connectAsync(this.host);

      if (client) {
        this.client = client;
        console.log(`[mqtt] connected client ${this.host}`);
        this.birth();
      }
    }
    return this;
  };

  birth = () => {
    if (!this.client || !this.sms) return;
    this.discovery();
    this.client.on("end", () => {
      this.client = undefined;
    });
    // subscribe to ha birth message and republish discovery messages
    this.client.subscribe([`homeassistant/status`]);
    this.client.on("message", (t, payload) => {
      if (t === `homeassistant/status`) {
        console.log(
          `[mqtt] received payload '${payload}' from homeassistant/status`
        );
        if (payload.toString() === "online") this.discovery();
      }
    });
    // publish ha status topics
    this.client.publish(`netgear_aircard/sms/recipient`, this.sms.to);
    this.client.publish(`netgear_aircard/sms/message`, this.sms.msg);
    // subscribe to ha device command topics
    this.client.subscribe([
      `netgear_aircard/command`,
      `netgear_aircard/sms/recipient`,
      `netgear_aircard/sms/message`,
    ]);
    this.client.on("message", (t, payload) => {
      if (this.sms) {
        if (t === `netgear_aircard/sms/recipient`) {
          console.log(
            `[mqtt] received payload '${payload}' from homeassistant/sms/recipient`
          );
          this.sms.to = payload.toString();
        }
        if (t === `netgear_aircard/sms/message`) {
          console.log(
            `[mqtt] received payload '${payload}' from homeassistant/sms/message`
          );
          this.sms.msg = payload.toString();
        }
        if (t === `netgear_aircard/command`) {
          if (payload.toString() === "send_sms") this.sms.sendSms();
          if (payload.toString() === "restart") this.sms.reboot();
        }
      }
    });
  };

  discovery = async (json = this.status) => {
    let count = 0;
    for (const [component, sensors] of Object.entries(devices(json) || {})) {
      for (const device of sensors) {
        await this.client?.publishAsync(
          `homeassistant/${component}/netgear_aircard/${device.unique_id}/config`,
          JSON.stringify(device)
        );
        count++;
      }
    }
    if (count) console.log(`[mqtt] published ${count} discovery messages`);
    setTimeout(() => {
      this.publish(JSON.stringify(json));
    }, 5000);
  };

  publish = async (message: string, topic = "netgear_aircard/attribute") => {
    if (this.client) {
      await this.client.publishAsync(topic, message);
      // if (this.count % 10 === 0) await this.discovery();
      console.log(
        `[mqtt] published ${++this.count} status messages since startup`
      );
    }
  };
}

export const mqtt = new Mqtt();
