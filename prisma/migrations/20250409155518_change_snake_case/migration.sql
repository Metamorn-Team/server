/*
  Warnings:

  - You are about to drop the `ChatMessage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Island` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IslandJoin` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ChatMessage" DROP CONSTRAINT "ChatMessage_sender_id_fkey";

-- DropForeignKey
ALTER TABLE "IslandJoin" DROP CONSTRAINT "IslandJoin_island_id_fkey";

-- DropForeignKey
ALTER TABLE "IslandJoin" DROP CONSTRAINT "IslandJoin_user_id_fkey";

-- DropTable
DROP TABLE "ChatMessage";

-- DropTable
DROP TABLE "Island";

-- DropTable
DROP TABLE "IslandJoin";

-- CreateTable
CREATE TABLE "island" (
    "id" UUID NOT NULL,
    "tag" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "island_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "island_join" (
    "id" UUID NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL,
    "left_at" TIMESTAMP(3) NOT NULL,
    "island_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,

    CONSTRAINT "island_join_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_message" (
    "id" UUID NOT NULL,
    "sender_id" UUID NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "context_id" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_message_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "island_join" ADD CONSTRAINT "island_join_island_id_fkey" FOREIGN KEY ("island_id") REFERENCES "island"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "island_join" ADD CONSTRAINT "island_join_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_message" ADD CONSTRAINT "chat_message_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
