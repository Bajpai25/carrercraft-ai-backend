/*
  Warnings:

  - You are about to drop the column `jobId` on the `ats_result` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ats_result" DROP CONSTRAINT "ats_result_jobId_fkey";

-- DropForeignKey
ALTER TABLE "ats_result_skill" DROP CONSTRAINT "ats_result_skill_atsResultId_fkey";

-- AlterTable
ALTER TABLE "ats_result" DROP COLUMN "jobId",
ADD COLUMN     "Issues" TEXT,
ADD COLUMN     "atsResultData" JSONB,
ADD COLUMN     "missingSkills" TEXT[],
ADD COLUMN     "suggestions" TEXT;
