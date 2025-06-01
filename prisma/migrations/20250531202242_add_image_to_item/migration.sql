/*
  Warnings:

  - Added the required column `image` to the `item` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "item" ADD COLUMN "image" TEXT;

-- Product에서 같은 이름의 상품 이미지 가져오기, 현재 단일 상품 뿐
UPDATE "item"
SET "image" = "product"."cover_image"
FROM "product"
WHERE "product"."name" = "item"."name";

ALTER TABLE "item"
ALTER COLUMN "image" SET NOT NULL;