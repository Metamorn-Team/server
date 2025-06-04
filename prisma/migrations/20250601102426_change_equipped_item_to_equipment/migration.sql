/*
  Warnings:

  - You are about to drop the `equipped_item` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "equipped_item";

-- CreateTable
CREATE TABLE "equipment" (
    "user_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "slot" SMALLINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_pkey" PRIMARY KEY ("user_id","slot")
);

-- CreateIndex
CREATE INDEX "equipment_item_id_idx" ON "equipment"("item_id");
