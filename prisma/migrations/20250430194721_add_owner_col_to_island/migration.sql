-- AlterTable
ALTER TABLE "island" ADD COLUMN     "ownerId" UUID,
ADD COLUMN     "userId" UUID;

-- CreateIndex
CREATE INDEX "island_userId_idx" ON "island"("userId");
