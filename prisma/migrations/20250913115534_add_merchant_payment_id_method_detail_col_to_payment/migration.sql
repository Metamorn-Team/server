/*
  Warnings:

  - A unique constraint covering the columns `[merchant_payment_id]` on the table `payment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `merchant_payment_id` to the `payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "payment" ADD COLUMN     "merchant_payment_id" UUID NOT NULL,
ADD COLUMN     "method_detail" VARCHAR(100),
ADD COLUMN     "status" VARCHAR(30) NOT NULL,
ALTER COLUMN "currency" SET DATA TYPE VARCHAR(30);

-- CreateIndex
CREATE UNIQUE INDEX "payment_merchant_payment_id_key" ON "payment"("merchant_payment_id");
