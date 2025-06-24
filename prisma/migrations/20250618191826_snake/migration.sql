/*
  Warnings:

  - You are about to drop the column `respawnTime` on the `spawn_object` table. All the data in the column will be lost.
  - You are about to drop the column `gridX` on the `spawn_zone` table. All the data in the column will be lost.
  - You are about to drop the column `gridY` on the `spawn_zone` table. All the data in the column will be lost.
  - Added the required column `respawn_time` to the `spawn_object` table without a default value. This is not possible if the table is not empty.
  - Added the required column `grid_x` to the `spawn_zone` table without a default value. This is not possible if the table is not empty.
  - Added the required column `grid_y` to the `spawn_zone` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "spawn_object" DROP COLUMN "respawnTime",
ADD COLUMN     "respawn_time" SMALLINT NOT NULL;

-- AlterTable
ALTER TABLE "spawn_zone" DROP COLUMN "gridX",
DROP COLUMN "gridY",
ADD COLUMN     "grid_x" SMALLINT NOT NULL,
ADD COLUMN     "grid_y" SMALLINT NOT NULL;
