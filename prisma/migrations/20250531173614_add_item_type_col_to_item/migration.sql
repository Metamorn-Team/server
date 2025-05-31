/*
  Warnings:

  - You are about to drop the column `productType` on the `product` table. All the data in the column will be lost.
  - Added the required column `product_type` to the `product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "item" ADD COLUMN     "item_type" SMALLINT NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "product"
ADD COLUMN "product_type" SMALLINT;

-- Set Data
UPDATE "product"
SET "product_type" = "productType";

-- Set NOT NULL
ALTER TABLE "product"
ALTER COLUMN "product_type" SET NOT NULL;


-- Drop col
ALTER TABLE "product"
DROP COLUMN "productType";