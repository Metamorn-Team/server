-- CreateTable
CREATE TABLE "Island" (
    "id" UUID NOT NULL,
    "tag" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Island_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IslandJoin" (
    "id" UUID NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL,
    "left_at" TIMESTAMP(3) NOT NULL,
    "island_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,

    CONSTRAINT "IslandJoin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" UUID NOT NULL,
    "sender_id" UUID NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "context_id" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "IslandJoin" ADD CONSTRAINT "IslandJoin_island_id_fkey" FOREIGN KEY ("island_id") REFERENCES "Island"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IslandJoin" ADD CONSTRAINT "IslandJoin_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
