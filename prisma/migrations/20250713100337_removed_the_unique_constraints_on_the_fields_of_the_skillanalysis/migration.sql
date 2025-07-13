/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `skillanalysis` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "skillanalysis_feedback_key";

-- DropIndex
DROP INDEX "skillanalysis_match_percentage_key";

-- DropIndex
DROP INDEX "skillanalysis_matching_skills_key";

-- DropIndex
DROP INDEX "skillanalysis_missing_skills_key";

-- CreateIndex
CREATE UNIQUE INDEX "skillanalysis_id_key" ON "skillanalysis"("id");
