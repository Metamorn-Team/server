/*
  Warnings:

  - Added the required column `max_hp` to the `spawn_object` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "spawn_object" ADD COLUMN     "max_hp" SMALLINT NOT NULL;
