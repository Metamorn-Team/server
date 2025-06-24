/*
  Warnings:

  - A unique constraint covering the columns `[key]` on the table `map` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "map_key_key" ON "map"("key");
