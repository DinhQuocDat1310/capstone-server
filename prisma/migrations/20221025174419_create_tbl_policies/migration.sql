-- CreateTable
CREATE TABLE "Policies" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ENABLE',

    CONSTRAINT "Policies_pkey" PRIMARY KEY ("id")
);
