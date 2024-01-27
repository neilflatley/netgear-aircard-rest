import { MqttClient, connectAsync } from "mqtt";
import devices from "./ha-devices.js";

class Mqtt {
  client?: MqttClient;
  count = 0;
  host = process.env.MQTT_HOST;
  status: any;

  init = async (status: any) => {
    if (!this.client && this.host) {
      const client = await connectAsync(this.host);

      if (client) {
        this.client = client;
        console.log(`[mqtt] connected client ${this.host}`);
        this.status = status;
      }
    }
    return this;
  };

  discovery = async (json = this.status) => {
    let count = 0;
    for (const [component, sensors] of Object.entries(devices(json) || {})) {
      for (const device of sensors) {
        await this.client?.publishAsync(
          `homeassistant/${component}/${device.unique_id}/config`,
          JSON.stringify(device)
        );
        count++;
      }
    }
    if (count) console.log(`[mqtt] published ${count} discovery messages`)
  };

  publish = async (message: string, topic = "netgear_aircard/attribute") => {
    if (this.client) {
      await this.client.publishAsync(topic, message);
      if (this.count % 10 === 0) await this.discovery();
      this.count++;
    }
    console.log(`[mqtt] published ${this.count} status messages`)
  };
}

export default Mqtt;
