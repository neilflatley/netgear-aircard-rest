import Fastify, { FastifyInstance } from "fastify";
import NetgearRouter from "netgear";
import NetgearController from "./controller.js";
import Mqtt from "./mqtt.js";

// note: options can be passed in here. See login options.
const router = new NetgearRouter();

// discover a netgear router, including IP address and SOAP port. The discovered address and SOAP port will override previous settings
let discoveredHost = undefined;

const mqtt = new Mqtt();

router
  .discover()
  .then((discovered) => {
    discoveredHost = discovered.host;
    netgear = new NetgearController(discovered.host);
    console.log(discovered);
  })
  .catch((error) => console.log(error));

let netgear = new NetgearController();

const server: FastifyInstance = Fastify({
  logger: false,
});

server.get("/ping", async (request, reply) => {
  reply.type("application/json").code(200);
  return { pong: "ok" };
});

server.get("/info", async (request, reply) => {
  try {
    await netgear.refresh();

    if (!mqtt.client) await mqtt.init(netgear.status);
    if (mqtt.client) await mqtt.publish(JSON.stringify(netgear.status));

    reply.type("application/json").code(200);
    return netgear.status;
  } catch (error) {
    console.log(error);

    reply.type("application/json").code(500);
    return { error };
  }
});

server.get("/login", async (request, reply) => {
  try {
    await netgear.login();

    reply.type("application/json").code(200);
    return netgear.status;
  } catch (error) {
    console.log(error);

    reply.type("application/json").code(500);
    return { login: "error", error };
  }
});

server.get("/reboot", async (request, reply) => {
  try {
    console.log("going to reboot the router now");
    await netgear.reboot();
    reply.type("application/json").code(200);
    return { reboot: "ok" };
  } catch (error) {
    console.log(error);

    reply.type("application/json").code(500);
    return { reboot: "error", error };
  }
});

const start = async () => {
  try {
    await server.listen({ port: 3000, host: "0.0.0.0" });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

await start();

process.on("exit", (code) => {
  server.log.info(`Server restarting. Code:${code}`);
});

// this is the signal that nodemon uses
process.once("SIGUSR2", () => {
  server.log.info("Server restarting");
  process.kill(process.pid, "SIGUSR2");
});
