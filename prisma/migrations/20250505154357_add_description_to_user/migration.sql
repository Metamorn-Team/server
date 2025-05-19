/*
  Warnings:

  - You are about to drop the column `userId` on the `island` table. All the data in the column will be lost.
  - You are about to drop the `Tag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "island_userId_idx";

-- AlterTable
ALTER TABLE "island" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "description" VARCHAR;

-- DropTable
DROP TABLE "Tag";

-- CreateTable
CREATE TABLE "tag" (
    "id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "island_ownerId_idx" ON "island"("ownerId");
