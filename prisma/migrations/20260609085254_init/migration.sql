-- CreateEnum
CREATE TYPE "PriceIndicator" AS ENUM ('GREAT', 'GOOD', 'FAIR', 'HIGH');

-- CreateEnum
CREATE TYPE "Condition" AS ENUM ('NEW', 'USED', 'DEMO');

-- CreateEnum
CREATE TYPE "SellerType" AS ENUM ('DEALER', 'PRIVATE');

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "vertical" TEXT NOT NULL DEFAULT 'cars',
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "variant" TEXT,
    "year" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "driveawayPrice" INTEGER,
    "priceIndicator" "PriceIndicator",
    "odometer" INTEGER NOT NULL,
    "transmission" TEXT NOT NULL,
    "fuel" TEXT NOT NULL,
    "bodyType" TEXT NOT NULL,
    "driveType" TEXT,
    "doors" INTEGER,
    "seats" INTEGER,
    "colour" TEXT,
    "engine" TEXT,
    "cylinders" INTEGER,
    "powerKw" INTEGER,
    "condition" "Condition" NOT NULL DEFAULT 'USED',
    "sellerType" "SellerType" NOT NULL DEFAULT 'DEALER',
    "sellerName" TEXT,
    "suburb" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "features" TEXT[],
    "images" TEXT[],
    "vin" TEXT,
    "rego" TEXT,
    "warrantyMonths" INTEGER,
    "warrantyKm" INTEGER,
    "evRangeKm" INTEGER,
    "specialOffer" BOOLEAN NOT NULL DEFAULT false,
    "tradeInEligible" BOOLEAN NOT NULL DEFAULT false,
    "reviewScore" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Listing_slug_key" ON "Listing"("slug");

-- CreateIndex
CREATE INDEX "Listing_vertical_make_model_idx" ON "Listing"("vertical", "make", "model");

-- CreateIndex
CREATE INDEX "Listing_price_idx" ON "Listing"("price");

-- CreateIndex
CREATE INDEX "Listing_year_idx" ON "Listing"("year");

-- CreateIndex
CREATE INDEX "Listing_state_idx" ON "Listing"("state");
