/*
  Warnings:

  - You are about to drop the column `type` on the `payment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "payment" DROP COLUMN "type",
ALTER COLUMN "method" SET DATA TYPE VARCHAR(50);
