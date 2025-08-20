-- CreateTable
CREATE TABLE "private_island" (
    "id" UUID NOT NULL,
    "map_id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,
    "url_path" VARCHAR(50) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "max_members" SMALLINT NOT NULL,
    "password" VARCHAR(50),
    "description" VARCHAR(200),
    "cover_image" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "private_island_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "private_island_url_path_key" ON "private_island"("url_path");

-- CreateIndex
CREATE INDEX "private_island_url_path_idx" ON "private_island"("url_path");
