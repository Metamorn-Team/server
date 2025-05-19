/*
  Warnings:

  - You are about to drop the column `is_bundle` on the `product` table. All the data in the column will be lost.
  - You are about to drop the `product_item` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `item_id` on table `product` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "product" DROP COLUMN "is_bundle",
ALTER COLUMN "item_id" SET NOT NULL;

-- DropTable
DROP TABLE "product_item";
