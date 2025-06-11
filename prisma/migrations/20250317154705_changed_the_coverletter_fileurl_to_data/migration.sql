/*
  Warnings:

  - You are about to drop the column `fileUrl` on the `cover_letter` table. All the data in the column will be lost.
  - Added the required column `data` to the `cover_letter` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cover_letter" DROP COLUMN "fileUrl",
ADD COLUMN     "data" TEXT NOT NULL;
