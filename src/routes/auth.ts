import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../db.js";
import { signToken, verifyToken } from "../auth/token.js";
import { sendOtpEmail } from "../email.js";

const userDto = z.object({ id: z.string(), name: z.string(), email: z.string() });
const authResponse = z.object({ token: z.string(), user: userDto });
const errorResponse = z.object({ message: z.string() });

const signupBody = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters").max(200),
});

const loginBody = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export const authRoutes: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/auth/signup",
    { schema: { body: signupBody, response: { 201: authResponse, 409: errorResponse } } },
    async (req, reply) => {
      const { name, email, password } = req.body;
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return reply.code(409).send({ message: "An account with this email already exists" });

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({ data: { name, email, passwordHash } });
      reply.code(201);
      return { token: signToken({ sub: user.id }), user: { id: user.id, name: user.name, email: user.email } };
    },
  );

  app.post(
    "/auth/login",
    { schema: { body: loginBody, response: { 200: authResponse, 401: errorResponse } } },
    async (req, reply) => {
      const { email, password } = req.body;
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return reply.code(401).send({ message: "Incorrect email or password" });
      }
      return { token: signToken({ sub: user.id }), user: { id: user.id, name: user.name, email: user.email } };
    },
  );

  app.post(
    "/auth/forgot-password",
    {
      schema: {
        body: z.object({ email: z.string().trim().toLowerCase().email() }),
        response: { 200: z.object({ message: z.string() }) },
      },
    },
    async (req) => {
      const { email } = req.body;
      const user = await prisma.user.findUnique({ where: { email } });
      // Always respond the same way to avoid leaking which emails exist.
      const generic = { message: "If an account exists for that email, a reset code has been sent." };
      if (!user) return generic;

      const code = crypto.randomInt(100000, 1000000).toString();
      const resetCodeHash = await bcrypt.hash(code, 10);
      const resetCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // valid 10 min server-side
      await prisma.user.update({ where: { id: user.id }, data: { resetCodeHash, resetCodeExpiry } });
      try {
        await sendOtpEmail(email, code, user.name);
      } catch (err) {
        // Don't fail the request if the email provider errors — log it so it's
        // visible in the host logs (e.g. Railway) for debugging.
        req.log.error({ err }, "Failed to send password reset email");
      }
      return generic;
    },
  );

  app.post(
    "/auth/reset-password",
    {
      schema: {
        body: z.object({
          email: z.string().trim().toLowerCase().email(),
          code: z.string().trim().length(6, "Enter the 6-digit code"),
          password: z.string().min(6, "Password must be at least 6 characters").max(200),
        }),
        response: { 200: authResponse, 400: errorResponse },
      },
    },
    async (req, reply) => {
      const { email, code, password } = req.body;
      const user = await prisma.user.findUnique({ where: { email } });
      const invalid = () => reply.code(400).send({ message: "Invalid or expired reset code" });

      if (!user || !user.resetCodeHash || !user.resetCodeExpiry) return invalid();
      if (user.resetCodeExpiry.getTime() < Date.now()) return invalid();
      if (!(await bcrypt.compare(code, user.resetCodeHash))) return invalid();

      const passwordHash = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash, resetCodeHash: null, resetCodeExpiry: null },
      });
      return { token: signToken({ sub: user.id }), user: { id: user.id, name: user.name, email: user.email } };
    },
  );

  app.get(
    "/auth/me",
    { schema: { response: { 200: userDto, 401: errorResponse } } },
    async (req, reply) => {
      const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
      const payload = token ? verifyToken(token) : null;
      if (!payload?.sub) return reply.code(401).send({ message: "Not authenticated" });
      const user = await prisma.user.findUnique({ where: { id: String(payload.sub) } });
      if (!user) return reply.code(401).send({ message: "Not authenticated" });
      return { id: user.id, name: user.name, email: user.email };
    },
  );
};
