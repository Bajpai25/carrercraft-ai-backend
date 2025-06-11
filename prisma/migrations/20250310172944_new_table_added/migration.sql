/*
  Warnings:

  - You are about to drop the column `skills` on the `job` table. All the data in the column will be lost.
  - You are about to drop the `ATSresult` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Coverletter` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Resume` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Skill` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ATSresultToSkill` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_JobToSkill` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ResumeToSkill` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ATSresult" DROP CONSTRAINT "ATSresult_jobId_fkey";

-- DropForeignKey
ALTER TABLE "ATSresult" DROP CONSTRAINT "ATSresult_resumeId_fkey";

-- DropForeignKey
ALTER TABLE "ATSresult" DROP CONSTRAINT "ATSresult_userId_fkey";

-- DropForeignKey
ALTER TABLE "Coverletter" DROP CONSTRAINT "Coverletter_userId_fkey";

-- DropForeignKey
ALTER TABLE "Resume" DROP CONSTRAINT "Resume_userId_fkey";

-- DropForeignKey
ALTER TABLE "_ATSresultToSkill" DROP CONSTRAINT "_ATSresultToSkill_A_fkey";

-- DropForeignKey
ALTER TABLE "_ATSresultToSkill" DROP CONSTRAINT "_ATSresultToSkill_B_fkey";

-- DropForeignKey
ALTER TABLE "_JobToSkill" DROP CONSTRAINT "_JobToSkill_A_fkey";

-- DropForeignKey
ALTER TABLE "_JobToSkill" DROP CONSTRAINT "_JobToSkill_B_fkey";

-- DropForeignKey
ALTER TABLE "_ResumeToSkill" DROP CONSTRAINT "_ResumeToSkill_A_fkey";

-- DropForeignKey
ALTER TABLE "_ResumeToSkill" DROP CONSTRAINT "_ResumeToSkill_B_fkey";

-- DropForeignKey
ALTER TABLE "job" DROP CONSTRAINT "job_userId_fkey";

-- AlterTable
ALTER TABLE "job" DROP COLUMN "skills";

-- DropTable
DROP TABLE "ATSresult";

-- DropTable
DROP TABLE "Coverletter";

-- DropTable
DROP TABLE "Resume";

-- DropTable
DROP TABLE "Skill";

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "_ATSresultToSkill";

-- DropTable
DROP TABLE "_JobToSkill";

-- DropTable
DROP TABLE "_ResumeToSkill";

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resume" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cover_letter" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cover_letter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ats_result" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ats_result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_skill" (
    "jobId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "job_skill_pkey" PRIMARY KEY ("jobId","skillId")
);

-- CreateTable
CREATE TABLE "resume_skill" (
    "resumeId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "resume_skill_pkey" PRIMARY KEY ("resumeId","skillId")
);

-- CreateTable
CREATE TABLE "ats_result_skill" (
    "atsResultId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "ats_result_skill_pkey" PRIMARY KEY ("atsResultId","skillId")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "skill_name_key" ON "skill"("name");

-- AddForeignKey
ALTER TABLE "job" ADD CONSTRAINT "job_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume" ADD CONSTRAINT "resume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cover_letter" ADD CONSTRAINT "cover_letter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ats_result" ADD CONSTRAINT "ats_result_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resume"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ats_result" ADD CONSTRAINT "ats_result_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ats_result" ADD CONSTRAINT "ats_result_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_skill" ADD CONSTRAINT "job_skill_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_skill" ADD CONSTRAINT "job_skill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_skill" ADD CONSTRAINT "resume_skill_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resume"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_skill" ADD CONSTRAINT "resume_skill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ats_result_skill" ADD CONSTRAINT "ats_result_skill_atsResultId_fkey" FOREIGN KEY ("atsResultId") REFERENCES "ats_result"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ats_result_skill" ADD CONSTRAINT "ats_result_skill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
