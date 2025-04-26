/*
  Warnings:

  - You are about to drop the column `grade` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `key` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "product" DROP COLUMN "grade",
DROP COLUMN "key",
DROP COLUMN "type";
