import type { FastifyCorsOptions } from "@fastify/cors";

// Convert a user-facing pattern like "https://*.vercel.app" into a RegExp.
// Everything except `*` is escaped, and `*` becomes `[^/]*` so it matches a
// single URL segment (no path traversal).
function toOriginMatcher(pattern: string): string | RegExp {
  if (!pattern.includes("*")) return pattern;
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[^/]*");
  return new RegExp(`^${escaped}$`);
}

export function buildCorsOptions(raw: string[]): FastifyCorsOptions {
  const matchers = raw.map(toOriginMatcher);

  return {
    credentials: true,
    origin(origin, cb) {
      // Same-origin / server-to-server / curl requests: no Origin header.
      if (!origin) return cb(null, true);

      for (const m of matchers) {
        if (typeof m === "string" ? m === origin : m.test(origin)) {
          return cb(null, true);
        }
      }
      cb(new Error(`CORS: origin ${origin} is not allowed`), false);
    },
  };
}
