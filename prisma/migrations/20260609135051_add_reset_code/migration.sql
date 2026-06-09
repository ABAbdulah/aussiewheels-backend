-- AlterTable
ALTER TABLE "User" ADD COLUMN     "resetCodeExpiry" TIMESTAMP(3),
ADD COLUMN     "resetCodeHash" TEXT;
