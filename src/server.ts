import Fastify from "fastify";
import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { config } from "./config.js";
import { buildCorsOptions } from "./cors.js";
import { loggerOptions } from "./logger.js";
import { listingsRoutes } from "./routes/listings.js";

export async function buildApp() {
  const app = Fastify({
    logger: loggerOptions,
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(sensible);
  await app.register(cors, buildCorsOptions(config.corsOrigin));

  app.get("/health", async () => ({ status: "ok", service: "aussiewheels-backend" }));

  await app.register(listingsRoutes, { prefix: "/api/v1" });

  return app;
}

async function start() {
  const app = await buildApp();
  try {
    await app.listen({ port: config.port, host: config.host });
  } catch (err) {
    if (err instanceof Error && "code" in err && err.code === "EADDRINUSE") {
      app.log.error(
        `Port ${config.port} is already in use. Stop the existing process or set PORT=<other> in .env`,
      );
    } else {
      app.log.error(err);
    }
    process.exit(1);
  }
}

start();
