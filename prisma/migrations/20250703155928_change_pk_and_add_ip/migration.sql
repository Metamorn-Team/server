/*
  Warnings:

  - The primary key for the `refresh_token` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `id` to the `refresh_token` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ip` to the `refresh_token` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "refresh_token" DROP CONSTRAINT "refresh_token_pkey",
ADD COLUMN     "id" UUID NOT NULL,
ADD COLUMN     "ip" VARCHAR(20) NOT NULL,
ADD CONSTRAINT "refresh_token_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "refresh_token_user_id_idx" ON "refresh_token"("user_id");
