/*
  Warnings:

  - You are about to drop the `skill_analysis` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "skill_analysis";

-- CreateTable
CREATE TABLE "skillanalysis" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "match_percentage" TEXT NOT NULL,
    "matching_skills" TEXT[],
    "missing_skills" TEXT[],
    "feedback" TEXT NOT NULL,

    CONSTRAINT "skillanalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "skillanalysis_userId_key" ON "skillanalysis"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "skillanalysis_jobId_key" ON "skillanalysis"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "skillanalysis_resumeId_key" ON "skillanalysis"("resumeId");
