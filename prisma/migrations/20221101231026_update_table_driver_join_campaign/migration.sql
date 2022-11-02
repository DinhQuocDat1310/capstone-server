/*
  Warnings:

  - You are about to drop the column `isJoined` on the `DriverJoinCampaign` table. All the data in the column will be lost.
  - Added the required column `updateDate` to the `DriverJoinCampaign` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StatusDriverJoin" AS ENUM ('JOIN', 'APPROVE', 'CANCEL');

-- AlterTable
ALTER TABLE "DriverJoinCampaign" DROP COLUMN "isJoined",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "status" "StatusDriverJoin" NOT NULL DEFAULT 'JOIN',
ADD COLUMN     "updateDate" TIMESTAMP(3) NOT NULL;
