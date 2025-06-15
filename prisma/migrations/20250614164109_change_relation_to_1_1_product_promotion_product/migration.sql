/*
  Warnings:

  - A unique constraint covering the columns `[product_id]` on the table `promotion_product` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "promotion_product_product_id_key" ON "promotion_product"("product_id");
