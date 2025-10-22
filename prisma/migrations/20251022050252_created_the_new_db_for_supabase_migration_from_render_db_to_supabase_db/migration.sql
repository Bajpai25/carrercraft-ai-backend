/*
  Warnings:

  - Made the column `Issues` on table `ats_result` required. This step will fail if there are existing NULL values in that column.
  - Made the column `atsResultData` on table `ats_result` required. This step will fail if there are existing NULL values in that column.
  - Made the column `suggestions` on table `ats_result` required. This step will fail if there are existing NULL values in that column.
  - Made the column `data` on table `cold_email` required. This step will fail if there are existing NULL values in that column.
  - Made the column `fileUrl` on table `cold_email` required. This step will fail if there are existing NULL values in that column.
  - Made the column `data` on table `cover_letter` required. This step will fail if there are existing NULL values in that column.
  - Made the column `company` on table `job` required. This step will fail if there are existing NULL values in that column.
  - Made the column `description` on table `job` required. This step will fail if there are existing NULL values in that column.
  - Made the column `location` on table `job` required. This step will fail if there are existing NULL values in that column.
  - Made the column `resume_data` on table `resume` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ats_result" ALTER COLUMN "Issues" SET NOT NULL,
ALTER COLUMN "atsResultData" SET NOT NULL,
ALTER COLUMN "suggestions" SET NOT NULL;

-- AlterTable
ALTER TABLE "cold_email" ALTER COLUMN "data" SET NOT NULL,
ALTER COLUMN "fileUrl" SET NOT NULL;

-- AlterTable
ALTER TABLE "cover_letter" ALTER COLUMN "data" SET NOT NULL;

-- AlterTable
ALTER TABLE "job" ALTER COLUMN "company" SET NOT NULL,
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "location" SET NOT NULL;

-- AlterTable
ALTER TABLE "resume" ALTER COLUMN "resume_data" SET NOT NULL;
