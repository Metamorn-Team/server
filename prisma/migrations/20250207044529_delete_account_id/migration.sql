/*
  Warnings:

  - You are about to drop the column `account_id` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_account_id_deleted_at_key";

-- DropIndex
DROP INDEX "User_account_id_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "account_id";
