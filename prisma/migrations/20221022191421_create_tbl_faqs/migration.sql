-- CreateTable
CREATE TABLE "FAQs" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "FAQs_pkey" PRIMARY KEY ("id")
);
