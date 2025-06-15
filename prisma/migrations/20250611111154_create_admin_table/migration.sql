-- CreateTable
CREATE TABLE "Admin" (
    "id" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "password" VARCHAR(20) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");
