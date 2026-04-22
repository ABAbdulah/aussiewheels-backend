import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { listings, listingSchema } from "../data/listings.js";

const listQuery = z.object({
  vertical: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  priceMin: z.coerce.number().int().nonnegative().optional(),
  priceMax: z.coerce.number().int().nonnegative().optional(),
  q: z.string().optional(),
});

const listResponse = z.object({
  items: z.array(listingSchema),
  total: z.number().int(),
});

export const listingsRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/listings",
    {
      schema: {
        querystring: listQuery,
        response: { 200: listResponse },
      },
    },
    async (req) => {
      const { vertical, limit, priceMin, priceMax, q } = req.query;
      const qLower = q?.toLowerCase();

      const filtered = listings.filter((l) => {
        if (vertical && l.vertical !== vertical) return false;
        if (priceMin != null && l.price < priceMin) return false;
        if (priceMax != null && l.price > priceMax) return false;
        if (qLower && !l.title.toLowerCase().includes(qLower)) return false;
        return true;
      });

      return {
        items: filtered.slice(0, limit),
        total: filtered.length,
      };
    },
  );

  app.get(
    "/listings/:id",
    {
      schema: {
        params: z.object({ id: z.string() }),
        response: { 200: listingSchema, 404: z.object({ message: z.string() }) },
      },
    },
    async (req, reply) => {
      const listing = listings.find((l) => l.id === req.params.id);
      if (!listing) return reply.notFound(`Listing ${req.params.id} not found`);
      return listing;
    },
  );
};
