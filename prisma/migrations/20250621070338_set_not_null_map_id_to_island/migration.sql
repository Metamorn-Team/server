/*
  Warnings:

  - Made the column `mapId` on table `island` required. This step will fail if there are existing NULL values in that column.

*/

-- Set mapId to not null
UPDATE "island" SET "mapId" = (SELECT "id" FROM "map" LIMIT 1);

-- AlterTable
ALTER TABLE "island" ALTER COLUMN "mapId" SET NOT NULL;

