import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../db.js";
import { listResponseSchema, listingDtoSchema, toDto } from "../data/listings.js";

const csv = (s?: string) =>
  s
    ?.split(",")
    .map((v) => v.trim())
    .filter(Boolean);

const listQuery = z.object({
  vertical: z.string().optional().default("cars"),
  make: z.string().optional(),
  model: z.string().optional(),
  bodyType: z.string().optional(), // comma-separated allowed
  fuel: z.string().optional(), // comma-separated allowed
  transmission: z.string().optional(),
  driveType: z.string().optional(),
  state: z.string().optional(),
  sellerType: z.enum(["dealer", "private"]).optional(),
  condition: z.enum(["new", "used", "demo"]).optional(),
  priceMin: z.coerce.number().int().nonnegative().optional(),
  priceMax: z.coerce.number().int().nonnegative().optional(),
  yearMin: z.coerce.number().int().optional(),
  yearMax: z.coerce.number().int().optional(),
  kmMax: z.coerce.number().int().nonnegative().optional(),
  specialOffer: z.coerce.boolean().optional(),
  tradeIn: z.coerce.boolean().optional(),
  keyword: z.string().optional(),
  excludeId: z.string().optional(),
  sort: z
    .enum(["featured", "price_asc", "price_desc", "year_desc", "km_asc", "newest"])
    .optional()
    .default("featured"),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const ORDER: Record<string, Prisma.ListingOrderByWithRelationInput[]> = {
  featured: [{ specialOffer: "desc" }, { createdAt: "desc" }],
  price_asc: [{ price: "asc" }],
  price_desc: [{ price: "desc" }],
  year_desc: [{ year: "desc" }],
  km_asc: [{ odometer: "asc" }],
  newest: [{ createdAt: "desc" }],
};

const facetsResponse = z.object({
  makes: z.array(z.object({ value: z.string(), count: z.number() })),
  bodyTypes: z.array(z.object({ value: z.string(), count: z.number() })),
  fuels: z.array(z.object({ value: z.string(), count: z.number() })),
  states: z.array(z.object({ value: z.string(), count: z.number() })),
  priceRange: z.object({ min: z.number(), max: z.number() }),
  yearRange: z.object({ min: z.number(), max: z.number() }),
  total: z.number(),
});

export const listingsRoutes: FastifyPluginAsyncZod = async (app) => {
  // ── List + filter + sort + paginate ──────────────────────────────────────
  app.get(
    "/listings",
    { schema: { querystring: listQuery, response: { 200: listResponseSchema } } },
    async (req) => {
      const q = req.query;

      const where: Prisma.ListingWhereInput = {
        vertical: q.vertical,
        ...(q.make && { make: { equals: q.make, mode: "insensitive" } }),
        ...(q.model && { model: { equals: q.model, mode: "insensitive" } }),
        ...(csv(q.bodyType) && { bodyType: { in: csv(q.bodyType), mode: "insensitive" } }),
        ...(csv(q.fuel) && { fuel: { in: csv(q.fuel), mode: "insensitive" } }),
        ...(q.transmission && { transmission: { equals: q.transmission, mode: "insensitive" } }),
        ...(q.driveType && { driveType: { equals: q.driveType, mode: "insensitive" } }),
        ...(q.state && { state: q.state.toUpperCase() }),
        ...(q.sellerType && { sellerType: q.sellerType.toUpperCase() as Prisma.EnumSellerTypeFilter }),
        ...(q.condition && { condition: q.condition.toUpperCase() as Prisma.EnumConditionFilter }),
        ...(q.specialOffer && { specialOffer: true }),
        ...(q.tradeIn && { tradeInEligible: true }),
        ...(q.excludeId && { NOT: { id: q.excludeId } }),
        ...((q.priceMin != null || q.priceMax != null) && {
          price: { ...(q.priceMin != null && { gte: q.priceMin }), ...(q.priceMax != null && { lte: q.priceMax }) },
        }),
        ...((q.yearMin != null || q.yearMax != null) && {
          year: { ...(q.yearMin != null && { gte: q.yearMin }), ...(q.yearMax != null && { lte: q.yearMax }) },
        }),
        ...(q.kmMax != null && { odometer: { lte: q.kmMax } }),
        ...(q.keyword && {
          OR: [
            { make: { contains: q.keyword, mode: "insensitive" } },
            { model: { contains: q.keyword, mode: "insensitive" } },
            { variant: { contains: q.keyword, mode: "insensitive" } },
            { description: { contains: q.keyword, mode: "insensitive" } },
          ],
        }),
      };

      const [total, items] = await Promise.all([
        prisma.listing.count({ where }),
        prisma.listing.findMany({
          where,
          orderBy: ORDER[q.sort],
          skip: (q.page - 1) * q.limit,
          take: q.limit,
        }),
      ]);

      return {
        items: items.map(toDto),
        total,
        page: q.page,
        pageSize: q.limit,
        totalPages: Math.max(1, Math.ceil(total / q.limit)),
      };
    },
  );

  // ── Facets for the filter sidebar ────────────────────────────────────────
  app.get(
    "/listings/facets",
    { schema: { querystring: z.object({ vertical: z.string().default("cars") }), response: { 200: facetsResponse } } },
    async (req) => {
      const where = { vertical: req.query.vertical };
      const group = (by: "make" | "bodyType" | "fuel" | "state") =>
        prisma.listing.groupBy({ by: [by], where, _count: { _all: true }, orderBy: { _count: { id: "desc" } } });

      const [makes, bodyTypes, fuels, states, agg, total] = await Promise.all([
        group("make"),
        group("bodyType"),
        group("fuel"),
        group("state"),
        prisma.listing.aggregate({ where, _min: { price: true, year: true }, _max: { price: true, year: true } }),
        prisma.listing.count({ where }),
      ]);

      const map = (rows: { _count: { _all: number } }[], key: string) =>
        rows
          .map((r) => ({ value: (r as Record<string, unknown>)[key] as string, count: r._count._all }))
          .sort((a, b) => a.value.localeCompare(b.value));

      return {
        makes: map(makes, "make"),
        bodyTypes: map(bodyTypes, "bodyType"),
        fuels: map(fuels, "fuel"),
        states: map(states, "state"),
        priceRange: { min: agg._min.price ?? 0, max: agg._max.price ?? 0 },
        yearRange: { min: agg._min.year ?? 2000, max: agg._max.year ?? new Date().getFullYear() },
        total,
      };
    },
  );

  // ── Single listing by id or slug ─────────────────────────────────────────
  app.get(
    "/listings/:idOrSlug",
    {
      schema: {
        params: z.object({ idOrSlug: z.string() }),
        response: { 200: listingDtoSchema, 404: z.object({ message: z.string() }) },
      },
    },
    async (req, reply) => {
      const { idOrSlug } = req.params;
      const listing = await prisma.listing.findFirst({
        where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
      });
      if (!listing) return reply.notFound(`Listing ${idOrSlug} not found`);
      return toDto(listing);
    },
  );
};
