/*
  Warnings:

  - You are about to drop the column `category_id` on the `product` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "product_category_id_idx";

-- AlterTable
ALTER TABLE "product" DROP COLUMN "category_id",
ADD COLUMN     "productCategoryId" UUID;
