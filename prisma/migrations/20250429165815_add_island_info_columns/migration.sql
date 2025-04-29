/*
  Warnings:

  - You are about to drop the column `tags` on the `island` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "island" DROP COLUMN "tags",
ADD COLUMN     "cover_image" TEXT,
ADD COLUMN     "description" VARCHAR(200),
ADD COLUMN     "max_members" SMALLINT,
ADD COLUMN     "name" VARCHAR(50);
