/*
  Warnings:

  - You are about to drop the column `discountRate` on the `promotion_product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "promotion_product" DROP COLUMN "discountRate",
ADD COLUMN     "discount_rate" DOUBLE PRECISION;
