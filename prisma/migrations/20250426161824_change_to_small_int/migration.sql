/*
  Warnings:

  - Changed the type of `type` on the `gold_transaction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `purchase` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "gold_transaction" DROP COLUMN "type",
ADD COLUMN     "type" SMALLINT NOT NULL;

-- AlterTable
ALTER TABLE "purchase" DROP COLUMN "status",
ADD COLUMN     "status" SMALLINT NOT NULL;
