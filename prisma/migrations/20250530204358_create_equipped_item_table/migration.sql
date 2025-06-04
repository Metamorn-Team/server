-- CreateTable
CREATE TABLE "equipped_item" (
    "user_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "slot" SMALLINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipped_item_pkey" PRIMARY KEY ("user_id","slot")
);

-- CreateIndex
CREATE INDEX "equipped_item_item_id_idx" ON "equipped_item"("item_id");
