/*
  Warnings:

  - Added the required column `fileUrl` to the `cover_letter` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cover_letter" ADD COLUMN     "fileUrl" TEXT NOT NULL;
