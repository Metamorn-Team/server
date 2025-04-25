/*
  Warnings:

  - You are about to drop the column `isBundle` on the `product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "product" DROP COLUMN "isBundle",
ADD COLUMN     "is_bundle" BOOLEAN NOT NULL DEFAULT false;
