/*
  Warnings:

  - You are about to drop the column `image` on the `BusinessLicense` table. All the data in the column will be lost.
  - You are about to drop the column `licenseId` on the `BusinessLicense` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `BusinessLicense` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[idLicense]` on the table `BusinessLicense` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `idLicense` to the `BusinessLicense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageBusiness` to the `BusinessLicense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `typeBusiness` to the `BusinessLicense` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "BusinessLicense_licenseId_key";

-- AlterTable
ALTER TABLE "BusinessLicense" DROP COLUMN "image",
DROP COLUMN "licenseId",
DROP COLUMN "type",
ADD COLUMN     "idLicense" TEXT NOT NULL,
ADD COLUMN     "imageBusiness" TEXT NOT NULL,
ADD COLUMN     "typeBusiness" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "BusinessLicense_idLicense_key" ON "BusinessLicense"("idLicense");
