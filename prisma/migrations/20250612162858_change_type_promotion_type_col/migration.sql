/*
  Warnings:

  - Changed the type of `type` on the `promotion` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "promotion" DROP COLUMN "type",
ADD COLUMN     "type" SMALLINT NOT NULL;
