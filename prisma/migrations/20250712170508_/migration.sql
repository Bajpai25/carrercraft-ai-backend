/*
  Warnings:

  - A unique constraint covering the columns `[match_percentage]` on the table `skillanalysis` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[matching_skills]` on the table `skillanalysis` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[missing_skills]` on the table `skillanalysis` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[feedback]` on the table `skillanalysis` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "skillanalysis_jobId_key";

-- DropIndex
DROP INDEX "skillanalysis_resumeId_key";

-- DropIndex
DROP INDEX "skillanalysis_userId_key";

-- CreateIndex
CREATE UNIQUE INDEX "skillanalysis_match_percentage_key" ON "skillanalysis"("match_percentage");

-- CreateIndex
CREATE UNIQUE INDEX "skillanalysis_matching_skills_key" ON "skillanalysis"("matching_skills");

-- CreateIndex
CREATE UNIQUE INDEX "skillanalysis_missing_skills_key" ON "skillanalysis"("missing_skills");

-- CreateIndex
CREATE UNIQUE INDEX "skillanalysis_feedback_key" ON "skillanalysis"("feedback");
