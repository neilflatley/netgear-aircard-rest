import { MqttClient, connectAsync } from "mqtt";
import devices from "./ha-devices.js";

class Mqtt {
  client?: MqttClient;
  count = 0;
  status: any;

  init = async () => {
    if (!this.client) {
      const client = process.env.MQTT_HOST
        ? await connectAsync(process.env.MQTT_HOST)
        : undefined;

      if (client) this.client = client;
    }
    return this;
  };

  discovery = async (json = this.status) => {
    for (const [component, sensors] of Object.entries(devices(json))) {
      for (const [, device] of Object.entries(sensors)) {
        await this.client?.publishAsync(
          `homeassistant/${component}/${device.unique_id}/config`,
          JSON.stringify(device)
        );
      }
    }
  };

  publish = async (message: string, topic = "netgear_aircard/attribute") => {
    await this.client?.publishAsync(topic, message);
    this.count++;
    if (this.count % 10 > 0) await this.discovery();
  };
}

export default Mqtt;
