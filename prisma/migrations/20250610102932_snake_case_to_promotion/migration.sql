/*
  Warnings:

  - You are about to drop the `Promotion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Promotion";

-- CreateTable
CREATE TABLE "promotion" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" SMALLINT NOT NULL,
    "description" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL,
    "ended_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promotion_pkey" PRIMARY KEY ("id")
);
