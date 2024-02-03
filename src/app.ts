import Fastify, { FastifyInstance } from "fastify";
import NetgearController from "./controller.js";

const netgear = await NetgearController.discovery();

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
    netgear.publish();

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
    netgear.publish();

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

server.post<{ Body: { reboot: "ok" } }>(
  "/reboot",
  {
    schema: {
      body: {
        type: "object",
        required: ["reboot"],
        properties: {
          reboot: { type: "string" },
        },
      },
    },
  },
  async (request, reply) => {
    try {
      if (request.body.reboot === "ok") {
        console.log("going to reboot the router now");
        await netgear.reboot();
        reply.type("application/json").code(200);
        return { reboot: "ok" };
      } else {
        netgear.publish();
        return;
      }
    } catch (error) {
      console.log(error);

      reply.type("application/json").code(500);
      return { reboot: "error", error };
    }
  }
);

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
