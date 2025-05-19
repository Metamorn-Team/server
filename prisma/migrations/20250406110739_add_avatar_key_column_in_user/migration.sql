/*
  Warnings:

  - You are about to drop the `FriendRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "FriendRequest";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "user" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "provider" "OAuthProvider" NOT NULL,
    "nickname" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "avatarKey" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "friend_request" (
    "id" UUID NOT NULL,
    "senderId" UUID NOT NULL,
    "receiverId" UUID NOT NULL,
    "status" "FriendRequestStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "friend_request_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_nickname_id_idx" ON "user"("nickname", "id");

-- CreateIndex
CREATE INDEX "user_tag_id_idx" ON "user"("tag", "id");

-- CreateIndex
CREATE UNIQUE INDEX "user_tag_deleted_at_key" ON "user"("tag", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_deleted_at_key" ON "user"("email", "deleted_at");

-- CreateIndex
CREATE INDEX "friend_request_senderId_idx" ON "friend_request"("senderId");

-- CreateIndex
CREATE INDEX "friend_request_receiverId_idx" ON "friend_request"("receiverId");

-- CreateIndex
CREATE INDEX "friend_request_status_idx" ON "friend_request"("status");

-- CreateIndex
CREATE UNIQUE INDEX "friend_request_senderId_receiverId_key" ON "friend_request"("senderId", "receiverId");
