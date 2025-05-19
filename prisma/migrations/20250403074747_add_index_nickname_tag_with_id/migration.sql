-- CreateIndex
CREATE INDEX "User_nickname_id_idx" ON "User"("nickname", "id");

-- CreateIndex
CREATE INDEX "User_tag_id_idx" ON "User"("tag", "id");
