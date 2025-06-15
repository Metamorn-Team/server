/*
  Warnings:

  - The primary key for the `promotion_product` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `promotion_product` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "promotion_product_product_id_idx";

-- AlterTable
ALTER TABLE "promotion_product" DROP CONSTRAINT "promotion_product_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "promotion_product_pkey" PRIMARY KEY ("product_id", "promotion_id");
