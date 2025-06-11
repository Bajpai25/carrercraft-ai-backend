/*
  Warnings:

  - You are about to drop the column `company` on the `job` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `job` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `job` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "job" DROP COLUMN "company",
DROP COLUMN "description",
DROP COLUMN "location";
