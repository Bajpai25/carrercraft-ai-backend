-- CreateTable
CREATE TABLE "cold_email" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "data" TEXT,
    "fileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cold_email_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "cold_email" ADD CONSTRAINT "cold_email_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
