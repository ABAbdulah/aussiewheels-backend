import crypto from "node:crypto";

// Minimal signed token (HMAC-SHA256) — no external JWT dependency. Fine for a
// demo; swap for a battle-tested JWT lib + rotation before production.
const SECRET = process.env.AUTH_SECRET ?? "dev-secret-change-me";
const b64 = (s: string) => Buffer.from(s).toString("base64url");

export function signToken(payload: Record<string, unknown>): string {
  const body = b64(JSON.stringify({ ...payload, iat: Date.now() }));
  const sig = crypto.createHmac("sha256", SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyToken(token: string): Record<string, unknown> | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = crypto.createHmac("sha256", SECRET).update(body).digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString());
  } catch {
    return null;
  }
}
