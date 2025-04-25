-- DropForeignKey
ALTER TABLE "chat_message" DROP CONSTRAINT "chat_message_sender_id_fkey";

-- DropForeignKey
ALTER TABLE "friend_request" DROP CONSTRAINT "friend_request_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "friend_request" DROP CONSTRAINT "friend_request_senderId_fkey";

-- DropForeignKey
ALTER TABLE "island_join" DROP CONSTRAINT "island_join_island_id_fkey";

-- DropForeignKey
ALTER TABLE "island_join" DROP CONSTRAINT "island_join_user_id_fkey";

-- DropForeignKey
ALTER TABLE "product" DROP CONSTRAINT "product_category_id_fkey";

-- CreateTable
CREATE TABLE "purchase" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "goldAmount" INTEGER NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "purchased_at" TIMESTAMP(3) NOT NULL,
    "refunded_at" TIMESTAMP(3),

    CONSTRAINT "purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gold_transaction" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "amount" INTEGER NOT NULL,
    "balance" INTEGER NOT NULL,
    "reference_id" UUID NOT NULL,
    "processed_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gold_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "purchase_user_id_idx" ON "purchase"("user_id");

-- CreateIndex
CREATE INDEX "purchase_product_id_idx" ON "purchase"("product_id");

-- CreateIndex
CREATE INDEX "gold_transaction_reference_id_idx" ON "gold_transaction"("reference_id");

-- CreateIndex
CREATE INDEX "gold_transaction_user_id_idx" ON "gold_transaction"("user_id");

-- CreateIndex
CREATE INDEX "chat_message_sender_id_idx" ON "chat_message"("sender_id");

-- CreateIndex
CREATE INDEX "island_join_island_id_idx" ON "island_join"("island_id");

-- CreateIndex
CREATE INDEX "island_join_user_id_idx" ON "island_join"("user_id");

-- CreateIndex
CREATE INDEX "product_category_id_idx" ON "product"("category_id");
