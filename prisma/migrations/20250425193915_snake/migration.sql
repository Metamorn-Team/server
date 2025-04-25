/*
  Warnings:

  - You are about to drop the column `itemId` on the `product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "product" DROP COLUMN "itemId",
ADD COLUMN     "item_id" UUID;
