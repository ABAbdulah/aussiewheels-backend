const num = (v: string | undefined, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

export const config = {
  port: num(process.env.PORT, 4000),
  host: process.env.HOST ?? "0.0.0.0",
  logLevel: process.env.LOG_LEVEL ?? "info",
  nodeEnv: process.env.NODE_ENV ?? "development",
  corsOrigin: (process.env.CORS_ORIGIN ?? "http://localhost:3000").split(",").map((s) => s.trim()),
} as const;

export const isProd = config.nodeEnv === "production";
