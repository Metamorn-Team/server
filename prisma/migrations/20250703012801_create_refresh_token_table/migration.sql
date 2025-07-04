-- CreateTable
CREATE TABLE "refresh_token" (
    "token" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "device_id" UUID NOT NULL,
    "browser" VARCHAR(100),
    "model" VARCHAR(100) NOT NULL,
    "os" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "last_used_at" TIMESTAMP(3) NOT NULL,
    "expired_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refresh_token_pkey" PRIMARY KEY ("user_id","device_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "refresh_token_token_key" ON "refresh_token"("token");
