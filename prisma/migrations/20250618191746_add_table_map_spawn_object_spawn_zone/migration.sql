-- AlterTable
ALTER TABLE "island" ADD COLUMN     "mapId" UUID;

-- CreateTable
CREATE TABLE "map" (
    "id" UUID NOT NULL,
    "key" VARCHAR(50) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" VARCHAR(200) NOT NULL,
    "image" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "map_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spawn_object" (
    "id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "type" SMALLINT NOT NULL,
    "respawnTime" SMALLINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "spawn_object_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spawn_zone" (
    "id" UUID NOT NULL,
    "gridX" SMALLINT NOT NULL,
    "gridY" SMALLINT NOT NULL,
    "map_id" UUID NOT NULL,
    "spawn_object_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "spawn_zone_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "spawn_zone_spawn_object_id_idx" ON "spawn_zone"("spawn_object_id");

-- CreateIndex
CREATE INDEX "spawn_zone_map_id_idx" ON "spawn_zone"("map_id");

-- CreateIndex
CREATE INDEX "island_mapId_idx" ON "island"("mapId");
