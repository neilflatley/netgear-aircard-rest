const device = (json: any) => ({
  identifiers: [json.general.IMEI],
  name: json.general.deviceName,
  manufacturer: json.general.manufacturer,
  model: json.general.model,
  // serial_number: json.general.FSN,
  hw_version: json.general.HWversion,
  sw_version: `${json.general.FWversion} ${json.general.buildDate}`,
  configuration_url: `http://${json.router.gatewayIP}`,
});

type Sensor = {
  unique_id: string;
  object_id: string;
  state_topic: string;
  value_template: string;
  device_class: string;
  availability: {
    topic: string;
    value_template: string;
    payload_available: string;
  };
  json_attributes_topic: string;
  json_attributes_template: string;
  icon: string;
  device: Device;
};

type Device = {
  identifiers: string[];
  name: string;
  manufacturer: string;
  model: string;
  hw_version: string;
  sw_version: string;
  configuration_url: string;
};

export default (json: any) =>
  !json?.general
    ? undefined
    : Object.fromEntries(
        Object.entries({
          binary_sensor: [
            {
              unique_id: "netgear_aircard_connected",
              object_id: "netgear_aircard_connected",
              state_topic: "netgear_aircard/attribute",
              value_template: "{{ value_json.wwan.connection }}",
              payload_on: "Connected",
              payload_off: "Disconnected",
              device_class: "connectivity",
              availability: {
                topic: "netgear_aircard/attribute",
                value_template: "{{ value_json.power.PMState }}",
                payload_available: "Online",
              },
              json_attributes_topic: "netgear_aircard/attribute",
              json_attributes_template: "{{ value_json.wwan | tojson }}",
              icon: "mdi:router-network-wireless",
            },
            {
              name: "Charging",
              unique_id: "netgear_aircard_charging",
              object_id: "netgear_aircard_charging",
              state_topic: "netgear_aircard/attribute",
              value_template: "{{ value_json.power.battChargeSource }}",
              payload_on: "Charger",
              payload_off: "Battery",
              device_class: "battery_charging",
            },
          ],
          sensor: [
            {
              name: "Battery",
              unique_id: "netgear_aircard_battery_charge",
              object_id: "netgear_aircard_battery_charge",
              state_topic: "netgear_aircard/attribute",
              value_template: "{{ value_json.power.battChargeLevel }}",
              device_class: "battery",
              unit_of_measurement: "%",
            },
            {
              name: "Connected clients",
              unique_id: "netgear_aircard_connected_clients",
              object_id: "netgear_aircard_connected_clients",
              state_topic: "netgear_aircard/attribute",
              value_template: "{{ value_json.wifi.clientCount | int }}",
              icon: "mdi:wifi-star",
              json_attributes_topic: "netgear_aircard/attribute",
              json_attributes_template: "{{ value_json.wifi | tojson }}",
            },
            {
              name: "Connection text",
              unique_id: "netgear_aircard_connection_text",
              object_id: "netgear_aircard_connection_text",
              state_topic: "netgear_aircard/attribute",
              value_template: "{{ value_json.wwan.connectionText }}",
              icon: "mdi:signal-variant",
            },
            {
              name: "Data used",
              unique_id: "netgear_aircard_data_usage",
              object_id: "netgear_aircard_data_usage",
              state_topic: "netgear_aircard/attribute",
              value_template:
                "{{ value_json.wwan.dataUsage.generic.dataTransferred }}",
              device_class: "data_size",
              unit_of_measurement: "B",
            },
            {
              name: "Data used (GiB)",
              unique_id: "netgear_aircard_data_usage_gb",
              object_id: "netgear_aircard_data_usage_gb",
              state_topic: "netgear_aircard/attribute",
              value_template:
                "{{ (value_json.wwan.dataUsage.generic.dataTransferred / 1073741824) | round(3) }}",
              device_class: "data_size",
              unit_of_measurement: "GiB",
            },
            {
              name: "Network",
              unique_id: "netgear_aircard_connected_network",
              object_id: "netgear_aircard_connected_network",
              state_topic: "netgear_aircard/attribute",
              value_template: "{{ value_json.wwan.registerNetworkDisplay }}",
              icon: "mdi:signal-variant",
            },
            {
              name: "Router",
              unique_id: "netgear_aircard_router",
              object_id: "netgear_aircard_router",
              state_topic: "netgear_aircard/attribute",
              value_template: "{{ value_json.router.gatewayIP }}",
              icon: "mdi:router-wireless-settings",
              json_attributes_topic: "netgear_aircard/attribute",
              json_attributes_template: "{{ value_json.router | tojson }}",
            },
            {
              name: "RSSI",
              unique_id: "netgear_aircard_signal_strength",
              object_id: "netgear_aircard_signal_strength",
              state_topic: "netgear_aircard/attribute",
              value_template: "{{ value_json.wwan.signalStrength.rssi }}",
              device_class: "signal_strength",
              unit_of_measurement: "dBm",
            },
            {
              name: "Service type",
              unique_id: "netgear_aircard_service_type",
              object_id: "netgear_aircard_service_type",
              state_topic: "netgear_aircard/attribute",
              value_template: "{{ value_json.wwan.currentPSserviceType }}",
              icon: "mdi:radio-tower",
            },
            {
              name: "Signal",
              unique_id: "netgear_aircard_signal",
              object_id: "netgear_aircard_signal",
              state_topic: "netgear_aircard/attribute",
              value_template: "{{ value_json.wwan.signalStrength.bars }}",
              icon: "mdi:signal",
              json_attributes_topic: "netgear_aircard/attribute",
              json_attributes_template:
                "{{ value_json.wwan.signalStrength | tojson }}",
            },
            {
              name: "Started",
              unique_id: "netgear_aircard_started",
              object_id: "netgear_aircard_started",
              state_topic: "netgear_aircard/attribute",
              value_template:
                "{{ (as_timestamp(now()) | round(0) - value_json.wwan.sessDuration) | as_datetime }}",
              device_class: "timestamp",
              icon: "mdi:clock",
            },
            {
              name: "Uptime",
              unique_id: "netgear_aircard_uptime",
              object_id: "netgear_aircard_uptime",
              state_topic: "netgear_aircard/attribute",
              value_template:
                "{{ (as_timestamp(now()) - value_json.wwan.sessDuration) | as_datetime | as_local | relative_time }}",
              icon: "mdi:checkbox-marked-circle-outline",
            },
            {
              name: "WAN IP",
              unique_id: "netgear_aircard_wan_ip",
              object_id: "netgear_aircard_wan_ip",
              state_topic: "netgear_aircard/attribute",
              value_template: "{{ value_json.wwan.IP }}",
              icon: "mdi:ip",
            },
            {
              name: "WWAN band",
              unique_id: "netgear_aircard_wwan_band",
              object_id: "netgear_aircard_wwan_band",
              state_topic: "netgear_aircard/attribute",
              value_template: "{{ value_json.wwanadv.curBand }}",
              icon: "mdi:radio-tower",
              json_attributes_topic: "netgear_aircard/attribute",
              json_attributes_template: "{{ value_json.wwanadv | tojson }}",
            },
          ],
        }).map(([component, devices]) => [
          component,
          devices.map<Sensor>((d: any) => {
            d.device = device(json);
            return d;
          }),
        ])
      );
