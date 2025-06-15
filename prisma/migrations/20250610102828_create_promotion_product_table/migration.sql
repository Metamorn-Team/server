-- CreateTable
CREATE TABLE "Promotion" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" SMALLINT NOT NULL,
    "description" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL,
    "ended_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotion_product" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "promotion_id" UUID NOT NULL,
    "discountRate" DOUBLE PRECISION,

    CONSTRAINT "promotion_product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "promotion_product_product_id_idx" ON "promotion_product"("product_id");

-- CreateIndex
CREATE INDEX "promotion_product_promotion_id_idx" ON "promotion_product"("promotion_id");
