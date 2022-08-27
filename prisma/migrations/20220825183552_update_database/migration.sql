/*
  Warnings:

  - You are about to drop the column `imageBusiness` on the `BusinessLicense` table. All the data in the column will be lost.
  - Added the required column `imageLicense` to the `BusinessLicense` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BusinessLicense" DROP COLUMN "imageBusiness",
ADD COLUMN     "imageLicense" TEXT NOT NULL;
