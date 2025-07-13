/*
  Warnings:

  - You are about to drop the `SkillAnalysis` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "SkillAnalysis";

-- CreateTable
CREATE TABLE "skill_analysis" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "match_percentage" TEXT NOT NULL,
    "matching_skills" TEXT[],
    "missing_skills" TEXT[],
    "feedback" TEXT NOT NULL,

    CONSTRAINT "skill_analysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "skill_analysis_userId_key" ON "skill_analysis"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "skill_analysis_jobId_key" ON "skill_analysis"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "skill_analysis_resumeId_key" ON "skill_analysis"("resumeId");
