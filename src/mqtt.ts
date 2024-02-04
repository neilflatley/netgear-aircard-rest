import { MqttClient, connectAsync } from "mqtt";
import devices from "./ha-devices.js";
import { NetgearStatus } from "./netgear.js";

export class Mqtt {
  client?: MqttClient;
  count = 0;
  host = process.env.MQTT_HOST;
  status: any;
  sms!: ISmsController;

  init = async (status: NetgearStatus, sms: ISmsController) => {
    this.status = status;
    this.sms = sms;
    if (!this.client && this.host) {
      const client = await connectAsync(this.host);

      if (client) {
        this.client = client;
        console.log(`[mqtt] connected client ${this.host}`);
        await this.discovery();
        this.birth();
      }
    }
    return this;
  };

  birth = () => {
    if (!this.client || !this.sms) return;
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
    // subscribe to ha device command topics
    this.client.subscribe([`netgear_aircard/command`]);
    this.client.on("message", (t, buffer) => {
      if (!this.sms) return;
      console.log(`[mqtt] received payload '${buffer}' from ${t}`);
      const payload = buffer.toString();
      const cmd = payload.split("=")[0];
      const value = payload.split("=")?.[1];

      if (t === `netgear_aircard/command`) {
        if (cmd === "set_msg") this.sms.msg = value;
        if (cmd === "set_to") this.sms.to = value;
        if (cmd === "send_sms") this.sms.sendSms();
        if (cmd === "restart") this.sms.reboot();
      }
    });
  };

  discovery = async (json = this.status) => {
    // publish ha status topics
    await this.publish(this.sms.to, `netgear_aircard/sms/recipient`);
    await this.publish(this.sms.msg, `netgear_aircard/sms/message`);

    // publish mqtt discovery devices
    let count = 0;
    for (const [component, sensors] of Object.entries(devices(json) || {})) {
      for (const device of sensors) {
        await this.publish(
          JSON.stringify(device),
          `homeassistant/${component}/${device.unique_id.replace('netgear_aircard_', 'netgear_aircard/')}/config`
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
      if (topic === "netgear_aircard/attribute")
        console.log(
          `[mqtt] published ${++this.count} status messages since startup`
        );
    }
  };
}

export const mqtt = new Mqtt();
