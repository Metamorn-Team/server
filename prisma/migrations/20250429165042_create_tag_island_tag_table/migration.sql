-- AlterTable
ALTER TABLE "island" ADD COLUMN     "tags" TEXT[];

-- CreateTable
CREATE TABLE "island_tag" (
    "islandId" UUID NOT NULL,
    "tagId" UUID NOT NULL,

    CONSTRAINT "island_tag_pkey" PRIMARY KEY ("islandId","tagId")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "island_tag_tagId_idx" ON "island_tag"("tagId");
