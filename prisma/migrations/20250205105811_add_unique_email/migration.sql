-- CreateEnum
CREATE TYPE "OAuthProvider" AS ENUM ('GOOGLE', 'KAKAO', 'NAVER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "provider" "OAuthProvider" NOT NULL,
    "account_id" VARCHAR(15) NOT NULL,
    "nickname" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_account_id_key" ON "User"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_nickname_tag_key" ON "User"("nickname", "tag");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_deleted_at_key" ON "User"("email", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "User_account_id_deleted_at_key" ON "User"("account_id", "deleted_at");
