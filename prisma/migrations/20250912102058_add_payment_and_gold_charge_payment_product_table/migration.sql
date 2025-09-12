-- CreateTable
CREATE TABLE "gold_charge_product" (
    "id" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "currency" VARCHAR(10) NOT NULL,

    CONSTRAINT "gold_charge_product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "payment_product_id" UUID NOT NULL,
    "type" SMALLINT NOT NULL,
    "amount" INTEGER NOT NULL,
    "method" SMALLINT NOT NULL,
    "currency" VARCHAR(10) NOT NULL,
    "status" SMALLINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payment_user_id_idx" ON "payment"("user_id");
