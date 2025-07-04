/*
  Warnings:

  - The primary key for the `refresh_token` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `device_id` on the `refresh_token` table. All the data in the column will be lost.
  - Added the required column `session_id` to the `refresh_token` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "refresh_token" DROP CONSTRAINT "refresh_token_pkey",
DROP COLUMN "device_id",
ADD COLUMN     "session_id" UUID NOT NULL,
ADD CONSTRAINT "refresh_token_pkey" PRIMARY KEY ("user_id", "session_id");
