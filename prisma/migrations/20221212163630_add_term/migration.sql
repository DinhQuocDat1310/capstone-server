/*
  Warnings:

  - You are about to drop the `Policies` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TypePolicyTerm" AS ENUM ('POLICY', 'TERM');

-- DropTable
DROP TABLE "Policies";

-- CreateTable
CREATE TABLE "PoliciesTerm" (
    "id" TEXT NOT NULL,
    "type" "TypePolicyTerm" NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ENABLE',

    CONSTRAINT "PoliciesTerm_pkey" PRIMARY KEY ("id")
);
