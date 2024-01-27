import { MqttClient, connectAsync } from "mqtt";
import devices from "./ha-devices.js";

class Mqtt {
  count = 0;

  init = async (json: any) => {
    const client = process.env.MQTT_HOST
      ? await connectAsync(process.env.MQTT_HOST)
      : undefined;

    if (client) this.client = client;
    //   client?.on("connect", () => {

    for (const [key, device] of Object.entries(devices(json))) {
      await client?.publishAsync(
        `homeassistant/sensor/${key}/config`,
        JSON.stringify(device)
      );
    }
    //   });
  };

  publish = async (message: string, topic = "netgear_aircard/attribute") => {
    this.count++;
  };
}

export default Mqtt;
