import { to } from "await-to-js";
import NetgearRouter from "netgear";
import request from "request";
import util from "util";
import { mqtt } from "./mqtt";
import { NetgearStatus } from "./models/netgear";
import { sleep } from "./util";

const post = util.promisify(request.post);
const get = util.promisify(request.get);

// note: options can be passed in here. See login options.
const router = new NetgearRouter();

class NetgearController implements ISmsController {
  static discovery = async () => {
    let netgear = new NetgearController();
    try {
      // discover a netgear router, including IP address. The discovered address will override previous settings
      const discovered = await router.discover();
      if (discovered) {
        netgear = new NetgearController(discovered.host);
        console.log(discovered);
        await sleep(3000);
        await netgear.login();
        netgear.publish();
      }
    } catch (err: any) {
      console.log(`Discovery error: ${err} ${err.stack}`);
    } finally {
      return netgear;
    }
  };

  private jar = request.jar(); // Cookie jar
  private get = (arg: Parameters<typeof get>[0]) => to(get(arg));
  private post = (arg: Parameters<typeof post>[0]) => to(post(arg));

  private host = "netgear.aircard";
  private password = "MyPassword";
  private routerUri = `http://${this.host}`;

  private message?: string;
  private recipient?: string;

  get msg() {
    return typeof this.message === "string"
      ? this.message
      : this.status.sms.sendMsg?.[0].text || "";
  }
  set msg(value: string) {
    this.message = value;
  }

  get to() {
    return typeof this.recipient === "string"
      ? this.recipient
      : this.status.sms.sendMsg?.[0].receiver || "";
  }
  set to(value: string) {
    this.recipient = value;
  }

  get status_uri() {
    return `${this.routerUri}/api/model.json?internalapi=1`;
  }
  get config_uri() {
    return `${this.routerUri}/Forms/config`;
  }
  get send_sms_uri() {
    return `${this.routerUri}/Forms/smsSendMsg`;
  }

  status!: NetgearStatus; // Status doc
  token = null; // Token to connect to router
  user_role = null;

  constructor(
    host = process.env.NETGEAR_HOST,
    password = process.env.NETGEAR_PASSWORD
  ) {
    if (password) this.password = password;
    this.host = host || this.host;
    this.routerUri = `http://${this.host}`;
    console.log(`Connecting to ${this.routerUri}`);
  }

  publish = async () => {
    // requires process.env.MQTT_HOST set otherwise this safely does nothing
    const { status, user_role } = this;

    if (user_role === "Admin" && !mqtt.client) await mqtt.init(status, this);
    if (mqtt.client) await mqtt.publish(JSON.stringify(status));
  };

  refresh = async () => {
    const [err, res] = await this.get({
      url: this.status_uri,
      json: true,
      jar: this.jar,
    });
    if (err) throw err;

    const body: any = res.body;
    this.token = body.session.secToken;
    this.user_role = body.session.userRole;
    console.log("Connected as", this.user_role);
    console.log("4G status:", body.wwan.connection);
    // console.log(this.jar);
    this.status = body;
    return body;
  };

  login = async () => {
    if (!this.status) await this.refresh();
    if (!this.status)
      throw new Error(`Guest token not returned - Cannot continue with login`);

    const [err, res] = await this.post({
      url: this.config_uri,
      jar: this.jar,
      form: {
        token: this.token,
        "session.password": this.password,
      },
    });
    if (err) throw err;
    console.log(`${res.statusCode} ${res.statusMessage}`);
    if (res.statusCode > 200 && res.statusCode < 400) await this.refresh(); // Refetch the status json as Admin
    // console.log(this.jar);
  };

  reboot = async () => {
    if (this.user_role !== "Admin") {
      await this.login();
    }
    if (this.user_role !== "Admin") {
      throw new Error(
        `Cannot reboot router unless user_role is Admin - user_role: ${this.user_role}`
      );
    } else {
      const [err, res] = await this.post({
        url: this.config_uri,
        jar: this.jar,
        form: { token: this.token, "general.shutdown": "restart" },
      });
      if (err) throw err;
      if (res.statusCode > 200 && res.statusCode < 400)
        console.log("Restarting router...");
    }
  };

  readSms = async () => {
    if (this.user_role !== "Admin") {
      await this.login();
    }
    if (this.user_role !== "Admin") {
      throw new Error(
        `Cannot read sms unless user_role is Admin - user_role: ${this.user_role}`
      );
    } else {
      return this.status?.sms;
    }
  };

  sendSms = async ({
    message = this.message,
    recipient = this.recipient,
  }: {
    message?: string;
    recipient?: string;
  } = {}) => {
    console.log(`[sms] send ${recipient} "${message}"`);
    if (this.user_role !== "Admin") {
      await this.login();
    }
    if (this.user_role !== "Admin") {
      throw new Error(
        `Cannot send sms unless user_role is Admin - user_role: ${this.user_role}`
      );
    } else if (!message || !recipient) {
      throw new Error(`Cannot send sms required input(s) missing`);
    } else {
      const [err, res] = await this.post({
        url: this.send_sms_uri,
        jar: this.jar,
        form: {
          token: this.token,
          action: "send",
          "sms.sendMsg.clientId": "netgear_aircard_rest",
          "sms.sendMsg.receiver": recipient,
          "sms.sendMsg.text": message,
        },
      });
      if (err) throw err;
      if (res.statusCode > 200 && res.statusCode < 400)
        console.log(
          `[sms] send ${res.statusCode} ${res.statusMessage} ${res.headers?.location}`
        );
    }
  };

  script = async () => {
    request(
      {
        method: "GET",
        url: this.status_uri,
        jar: this.jar,
      },
      (err, resp, body) => {
        if (err) throw new Error(err);

        let json = JSON.parse(body);
        this.token = json.session.secToken;
        this.user_role = json.session.userRole;
        console.log("4G status:", json.wwan.connection);
        if (this.user_role == "Guest") {
          request.post(
            {
              url: this.config_uri,
              jar: this.jar,
              form: {
                token: this.token,
                "session.password": this.password,
              },
            },
            (err, resp, body) => {
              if (err) throw new Error(err);
              console.log(this.jar);

              request(
                {
                  method: "GET",
                  url: this.status_uri,
                  jar: this.jar,
                },
                (err, resp, body) => {
                  if (err) throw new Error(err);

                  let json = JSON.parse(body);
                  this.token = json.session.secToken;
                  this.user_role = json.session.userRole;

                  console.log(this.jar);
                  console.log("Connected as", this.user_role);
                  if (this.user_role == "Admin") {
                    this.status = json;
                    request.post(
                      {
                        url: this.config_uri,
                        jar: this.jar,
                        form: {
                          token: this.token,
                          "general.shutdown": "restart",
                        },
                      },
                      function (err, resp, body) {
                        if (err) throw new Error(err);
                        console.log("Restarting...");
                      }
                    );
                  }
                }
              );
            }
          );
        }
      }
    );
  };
}

export default NetgearController;
