import type { FastifyServerOptions } from "fastify";
import { config, isProd } from "./config.js";

export const loggerOptions: FastifyServerOptions["logger"] = isProd
  ? { level: config.logLevel }
  : {
      level: config.logLevel,
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:HH:MM:ss.l",
          ignore: "pid,hostname",
          singleLine: false,
        },
      },
    };
