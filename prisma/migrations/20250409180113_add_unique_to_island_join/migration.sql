/*
  Warnings:

  - A unique constraint covering the columns `[user_id,island_id,left_at]` on the table `island_join` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "island_join_user_id_island_id_left_at_key" ON "island_join"("user_id", "island_id", "left_at");
