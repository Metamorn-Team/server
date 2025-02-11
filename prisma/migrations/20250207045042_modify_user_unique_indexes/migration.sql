/*
  Warnings:

  - A unique constraint covering the columns `[tag,deleted_at]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "User_email_key";

-- DropIndex
DROP INDEX "User_nickname_tag_key";

-- CreateIndex
CREATE UNIQUE INDEX "User_tag_deleted_at_key" ON "User"("tag", "deleted_at");
