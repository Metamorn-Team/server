/*
  Warnings:

  - Made the column `max_members` on table `island` required. This step will fail if there are existing NULL values in that column.

*/
UPDATE "island" SET max_members = 5 WHERE max_members IS NULL;

-- AlterTable
ALTER TABLE "island" ALTER COLUMN "max_members" SET NOT NULL;
