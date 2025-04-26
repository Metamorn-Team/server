/*
  Warnings:

  - The `grade` column on the `item` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "item" DROP COLUMN "grade",
ADD COLUMN     "grade" SMALLINT;
