-- AlterTable
ALTER TABLE "cover_letter" ALTER COLUMN "data" DROP NOT NULL;

-- AlterTable
ALTER TABLE "resume" ADD COLUMN     "resume_data" JSONB;
