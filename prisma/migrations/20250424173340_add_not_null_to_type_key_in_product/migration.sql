/*
  Warnings:

  - Made the column `key` on table `product` required. This step will fail if there are existing NULL values in that column.
  - Made the column `type` on table `product` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "product" ALTER COLUMN "key" SET NOT NULL,
ALTER COLUMN "type" SET NOT NULL;
