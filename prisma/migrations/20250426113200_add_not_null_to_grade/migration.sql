/*
  Warnings:

  - Made the column `grade` on table `item` required. This step will fail if there are existing NULL values in that column.

*/
UPDATE "item" SET grade = 0 WHERE grade IS NULL;

-- AlterTable
ALTER TABLE "item" ALTER COLUMN "grade" SET NOT NULL;
