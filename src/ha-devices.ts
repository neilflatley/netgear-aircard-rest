const device = (json: any) => ({
  identifiers: [json.general.IMEI],
  name: json.general.deviceName,
  manufacturer: json.general.manufacturer,
  model: json.general.model,
  serial_number: json.general.FSN,
  hw_version: json.general.HWversion,
  sw_version: `${json.general.FWversion} ${json.general.PRIversion} ${json.general.buildDate}`,
  configuration_url: `http://${json.router.gatewayIP}`,
});

export default (json: any) => ({
  connected: {
    unique_id: "netgear_aircard_connected",
    object_id: "netgear_aircard_connected",
    state_topic: "netgear_aircard/attribute",
    value_template: "{{ value_json.wwan.connection }}",
    availability: {
      topic: "netgear_aircard/attribute",
      value_template: "{{ value_json.power.PMState }}",
      payload_available: "Online",
    },
    json_attributes_topic: "netgear_aircard/attribute",
    json_attributes_template: "{{ value_json.wwan | tojson }}",
    icon: "mdi:router-network-wireless",
    device: device(json),
  },
  data_usage: {
    unique_id: "netgear_aircard_data_usage",
    object_id: "netgear_aircard_data_usage",
    state_topic: "netgear_aircard/attribute",
    value_template: "{{ value_json.wwan.dataUsage.generic.dataTransferred }}",
    device_class: "data_size",
    unit_of_measurement: "B",
    device: device(json),
  },
});
