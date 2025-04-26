-- CreateTable
CREATE TABLE "user_owned_item" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "acquired_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_owned_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_owned_item_user_id_idx" ON "user_owned_item"("user_id");

-- CreateIndex
CREATE INDEX "user_owned_item_item_id_idx" ON "user_owned_item"("item_id");
