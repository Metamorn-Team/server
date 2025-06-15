/*
  Warnings:

  - The primary key for the `promotion_product` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `id` to the `promotion_product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "promotion_product" DROP CONSTRAINT "promotion_product_pkey",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "promotion_product_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "promotion_product_product_id_idx" ON "promotion_product"("product_id");
