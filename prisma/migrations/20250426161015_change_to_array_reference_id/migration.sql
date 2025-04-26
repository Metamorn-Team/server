/*
  Warnings:

  - The `reference_id` column on the `gold_transaction` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropIndex
DROP INDEX "gold_transaction_reference_id_idx";

-- AlterTable
ALTER TABLE "gold_transaction" DROP COLUMN "reference_id",
ADD COLUMN     "reference_id" UUID[];
