-- CreateTable
CREATE TABLE "SkillAnalysis" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "match_percentage" TEXT NOT NULL,
    "matching_skills" TEXT[],
    "missing_skills" TEXT[],
    "feedback" TEXT NOT NULL,

    CONSTRAINT "SkillAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SkillAnalysis_userId_key" ON "SkillAnalysis"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SkillAnalysis_jobId_key" ON "SkillAnalysis"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "SkillAnalysis_resumeId_key" ON "SkillAnalysis"("resumeId");
