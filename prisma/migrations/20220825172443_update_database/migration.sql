/*
  Warnings:

  - You are about to drop the column `slogan` on the `Brand` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `BusinessLicense` table. All the data in the column will be lost.
  - You are about to drop the column `localtion` on the `BusinessLicense` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[licenseId]` on the table `BusinessLicense` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `licenseId` to the `BusinessLicense` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "VerifyStatus" AS ENUM ('ACCEPT', 'BANNED', 'REQUEST_TO_CHANGE', 'PENDING');

-- AlterTable
ALTER TABLE "Brand" DROP COLUMN "slogan",
ADD COLUMN     "address" TEXT;

-- AlterTable
ALTER TABLE "BusinessLicense" DROP COLUMN "city",
DROP COLUMN "localtion",
ADD COLUMN     "licenseId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "IdentityCard" ALTER COLUMN "dob" DROP NOT NULL,
ALTER COLUMN "createDate" DROP NOT NULL,
ALTER COLUMN "city" DROP NOT NULL;

-- CreateTable
CREATE TABLE "VerifyBrand" (
    "id" TEXT NOT NULL,
    "status" "VerifyStatus" DEFAULT 'PENDING',
    "detail" TEXT,
    "createDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,
    "brandId" TEXT,
    "managerId" TEXT,

    CONSTRAINT "VerifyBrand_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BusinessLicense_licenseId_key" ON "BusinessLicense"("licenseId");

-- AddForeignKey
ALTER TABLE "VerifyBrand" ADD CONSTRAINT "VerifyBrand_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerifyBrand" ADD CONSTRAINT "VerifyBrand_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Manager"("id") ON DELETE SET NULL ON UPDATE CASCADE;
