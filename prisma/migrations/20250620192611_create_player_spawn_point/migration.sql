-- CreateTable
CREATE TABLE "player_spawn_point" (
    "id" UUID NOT NULL,
    "map_id" UUID NOT NULL,
    "x" SMALLINT NOT NULL,
    "y" SMALLINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "player_spawn_point_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "player_spawn_point_map_id_idx" ON "player_spawn_point"("map_id");
