# AussieWheels — Backend

Node.js API shared between web ([../aussiewheels](../aussiewheels)) and the future React Native
mobile app.

## Stack

- **Fastify 5** (low overhead, native TypeScript support)
- **TypeScript** with ESM
- **Zod** + `fastify-type-provider-zod` for schema validation and typed request/response
- **@fastify/cors**, **@fastify/sensible**
- In-memory listings data for MVP; Prisma + PostgreSQL to be added once persistence is needed.

## Scripts

```bash
npm run dev        # tsx watch on src/server.ts
npm run build      # tsc -> dist/
npm run start      # node dist/server.js
npm run typecheck  # tsc --noEmit
```

## Endpoints (v1)

| Method | Path                    | Description                          |
|--------|-------------------------|--------------------------------------|
| GET    | `/health`               | Health check                         |
| GET    | `/api/v1/listings`      | List with `?vertical=&limit=&priceMin=&priceMax=&q=` |
| GET    | `/api/v1/listings/:id`  | Single listing                       |

## Environment

Copy `.env.example` to `.env`.

| Var           | Default                     |
|---------------|-----------------------------|
| `PORT`        | `4000`                      |
| `HOST`        | `0.0.0.0`                   |
| `LOG_LEVEL`   | `info`                      |
| `CORS_ORIGIN` | `http://localhost:3000`     |
