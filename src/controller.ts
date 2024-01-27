import { to } from "await-to-js";
import request from "request";
import util from "util";
import Mqtt from "./mqtt";

const post = util.promisify(request.post);
const get = util.promisify(request.get);

class NetgearController {
  private jar = request.jar(); // Cookie jar
  private get = (arg: Parameters<typeof get>[0]) => to(get(arg));
  private post = (arg: Parameters<typeof post>[0]) => to(post(arg));

  mqtt = new Mqtt();

  private host = "netgear.aircard";
  private password = "MyPassword";
  private routerUri = `http://${this.host}`;

  get status_uri() {
    return `${this.routerUri}/api/model.json?internalapi=1`;
  }
  get config_uri() {
    return `${this.routerUri}/Forms/config`;
  }

  status = null; // Status doc
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
    const { mqtt, status, user_role } = this;

    if (user_role === "Admin" && !mqtt.client) await mqtt.init();
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
