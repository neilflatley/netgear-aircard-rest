import { MqttClient, connectAsync } from "mqtt";
import devices from "./ha-devices.js";
import { NetgearStatus } from "./models/netgear.js";

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
    // subscribe to ha device command topics
    this.client.subscribe([`homeassistant/status`, `netgear_aircard/command`]);

    this.client.on("message", async (t, buffer) => {
      const payload = buffer.toString();
      console.log(`[mqtt] received payload '${payload}' from ${t}`);

      if (t === `homeassistant/status` && payload === "online")
        this.discovery();

      if (t === `netgear_aircard/command`) {
        if (!this.sms) return;
        const cmd = payload.split("=")[0];
        const value = payload.split("=")?.[1];

        if (cmd === "set_msg") {
          this.sms.msg = value;
          await this.publish(this.sms.msg, `netgear_aircard/sms/message`);
        }
        if (cmd === "set_to") {
          this.sms.to = value;
          await this.publish(this.sms.to, `netgear_aircard/sms/recipient`);
        }
        if (cmd === "send_sms")
          this.sms.sendSms({ message: this.sms.msg, recipient: this.sms.to });
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
          `homeassistant/${component}/${device.unique_id.replace(
            "netgear_aircard_",
            "netgear_aircard/"
          )}/config`
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
