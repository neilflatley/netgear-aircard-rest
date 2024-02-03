import { MqttClient, connectAsync } from "mqtt";
import devices from "./ha-devices.js";

export class Mqtt {
  client?: MqttClient;
  count = 0;
  host = process.env.MQTT_HOST;
  status: any;

  init = async (status: any) => {
    this.status = status;
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
    this.discovery();
    this.client?.on("end", () => {
      this.client = undefined;
    });
    // subscribe to ha birth message and republish discovery messages
    this.client?.subscribe(`homeassistant/status`);
    this.client?.on("message", (t, payload) => {
      if (t === `homeassistant/status`) {
        console.log(
          `[mqtt] received payload '${payload}' from homeassistant/status`
        );
        if (payload.toString() === "online") this.discovery();
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
