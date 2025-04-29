-- AlterTable
ALTER TABLE "gold_transaction" ALTER COLUMN "reference_id" SET DEFAULT ARRAY[]::UUID[];
