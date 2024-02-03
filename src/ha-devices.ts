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
              name: "Connectivity",
              unique_id: "netgear_aircard_connected",
              object_id: "netgear_aircard_connected",
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
              value_template: "{{ value_json.power.battChargeSource }}",
              payload_on: "Charger",
              payload_off: "Battery",
              device_class: "battery_charging",
            },
            {
              name: "Unread SMS",
              unique_id: "netgear_aircard_unread_sms",
              object_id: "netgear_aircard_unread_sms",
              value_template: "{{ value_json.sms.unreadMsgs > 0 }}",
              availability: {
                topic: "netgear_aircard/attribute",
                value_template: "{{ value_json.sms.ready }}",
                payload_available: true,
              },
              json_attributes_topic: "netgear_aircard/attribute",
              json_attributes_template: "{{ value_json.sms | tojson }}",
            },
          ],
          button: [
            {
              name: "Restart",
              unique_id: "netgear_aircard_restart",
              object_id: "netgear_aircard_restart",
              availability: {
                topic: "netgear_aircard/attribute",
                value_template: "{{ value_json.power.PMState }}",
                payload_available: "Online",
              },
              command_topic: "netgear_aircard/command",
              payload_press: "restart",
              device_class: "restart",
              entity_category: "config",
            },
            {
              name: "Send SMS",
              unique_id: "netgear_aircard_send_sms",
              object_id: "netgear_aircard_send_sms",
              availability: {
                topic: "netgear_aircard/attribute",
                value_template: "{{ value_json.sms.sendEnabled }}",
                payload_available: true,
              },
              command_topic: "netgear_aircard/command",
              payload_press: "send_sms",
              icon: "mdi:message-question",
            },
          ],
          sensor: [
            {
              name: "Battery",
              unique_id: "netgear_aircard_battery_charge",
              object_id: "netgear_aircard_battery_charge",
              state_class: "measurement",
              value_template: "{{ value_json.power.battChargeLevel }}",
              device_class: "battery",
              unit_of_measurement: "%",
            },
            {
              name: "Connected clients",
              unique_id: "netgear_aircard_connected_clients",
              object_id: "netgear_aircard_connected_clients",
              state_class: "measurement",
              value_template: "{{ value_json.wifi.clientCount | int }}",
              icon: "mdi:wifi-star",
              json_attributes_topic: "netgear_aircard/attribute",
              json_attributes_template: "{{ value_json.wifi | tojson }}",
            },
            {
              name: "Connection text",
              unique_id: "netgear_aircard_connection_text",
              object_id: "netgear_aircard_connection_text",
              value_template: "{{ value_json.wwan.connectionText }}",
              icon: "mdi:signal-variant",
            },
            {
              name: "Data used",
              unique_id: "netgear_aircard_data_usage",
              object_id: "netgear_aircard_data_usage",
              state_class: "total_increasing",
              value_template:
                "{{ value_json.wwan.dataUsage.generic.dataTransferred }}",
              device_class: "data_size",
              unit_of_measurement: "B",
            },
            {
              name: "Data used (GiB)",
              unique_id: "netgear_aircard_data_usage_gb",
              object_id: "netgear_aircard_data_usage_gb",
              state_class: "total_increasing",
              value_template:
                "{{ (value_json.wwan.dataUsage.generic.dataTransferred / 1073741824) | round(3) }}",
              device_class: "data_size",
              unit_of_measurement: "GiB",
            },
            {
              name: "Network",
              unique_id: "netgear_aircard_connected_network",
              object_id: "netgear_aircard_connected_network",
              value_template: "{{ value_json.wwan.registerNetworkDisplay }}",
              icon: "mdi:signal-variant",
            },
            {
              name: "Router",
              unique_id: "netgear_aircard_router",
              object_id: "netgear_aircard_router",
              value_template: "{{ value_json.router.gatewayIP }}",
              icon: "mdi:router-wireless-settings",
              json_attributes_topic: "netgear_aircard/attribute",
              json_attributes_template: "{{ value_json.router | tojson }}",
            },
            {
              name: "RSSI",
              unique_id: "netgear_aircard_signal_strength",
              object_id: "netgear_aircard_signal_strength",
              state_class: "measurement",
              value_template: "{{ value_json.wwan.signalStrength.rssi }}",
              device_class: "signal_strength",
              unit_of_measurement: "dBm",
            },
            {
              name: "Service type",
              unique_id: "netgear_aircard_service_type",
              object_id: "netgear_aircard_service_type",
              value_template: "{{ value_json.wwan.currentPSserviceType }}",
              icon: "mdi:radio-tower",
            },
            {
              name: "Signal",
              unique_id: "netgear_aircard_signal",
              object_id: "netgear_aircard_signal",
              state_class: "measurement",
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
              value_template:
                "{{ (as_timestamp(now()) | round(0) - value_json.wwan.sessDuration) | as_datetime }}",
              device_class: "timestamp",
              icon: "mdi:clock",
            },
            {
              name: "WAN IP",
              unique_id: "netgear_aircard_wan_ip",
              object_id: "netgear_aircard_wan_ip",
              value_template: "{{ value_json.wwan.IP }}",
              icon: "mdi:ip",
            },
            {
              name: "WWAN band",
              unique_id: "netgear_aircard_wwan_band",
              object_id: "netgear_aircard_wwan_band",
              value_template: "{{ value_json.wwanadv.curBand }}",
              icon: "mdi:radio-tower",
              json_attributes_topic: "netgear_aircard/attribute",
              json_attributes_template: "{{ value_json.wwanadv | tojson }}",
            },
          ],
          text: [
            {
              name: "SMS message",
              unique_id: "netgear_aircard_sms_message",
              object_id: "netgear_aircard_sms_message",
              command_topic: "netgear_aircard/sms/message",
              icon: "mdi:message-text",
            },
            {
              name: "SMS recipient",
              unique_id: "netgear_aircard_sms_recipient",
              object_id: "netgear_aircard_sms_recipient",
              command_topic: "netgear_aircard/sms/recipient",
              icon: "mdi:message-question",
            },
          ],
        }).map(([component, devices]) => [
          component,
          devices.map<Sensor>((d: any) => {
            if (!d.device) d.device = device(json);
            if (!d.state_topic && !['button','text'].includes(component))
              d.state_topic = "netgear_aircard/attribute";
            return d;
          }),
        ])
      );
