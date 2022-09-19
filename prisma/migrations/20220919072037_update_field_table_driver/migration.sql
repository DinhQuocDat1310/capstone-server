/*
  Warnings:

  - You are about to drop the column `color` on the `Driver` table. All the data in the column will be lost.
  - You are about to drop the column `idBank` on the `Driver` table. All the data in the column will be lost.
  - You are about to drop the column `licensePlate` on the `Driver` table. All the data in the column will be lost.
  - You are about to drop the column `make` on the `Driver` table. All the data in the column will be lost.
  - You are about to drop the column `model` on the `Driver` table. All the data in the column will be lost.
  - You are about to drop the column `nameBank` on the `Driver` table. All the data in the column will be lost.
  - You are about to drop the column `ownerBank` on the `Driver` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `Driver` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[idCar]` on the table `Driver` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[bankAccountNumber]` on the table `Driver` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Driver_idBank_key";

-- AlterTable
ALTER TABLE "Driver" DROP COLUMN "color",
DROP COLUMN "idBank",
DROP COLUMN "licensePlate",
DROP COLUMN "make",
DROP COLUMN "model",
DROP COLUMN "nameBank",
DROP COLUMN "ownerBank",
DROP COLUMN "year",
ADD COLUMN     "bankAccountNumber" TEXT,
ADD COLUMN     "bankAccountOwner" TEXT,
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "idCar" TEXT,
ADD COLUMN     "imageCarLeft" TEXT,
ADD COLUMN     "imageCarRight" TEXT;

-- DropEnum
DROP TYPE "CarColor";

-- DropEnum
DROP TYPE "CarMake";

-- CreateIndex
CREATE UNIQUE INDEX "Driver_idCar_key" ON "Driver"("idCar");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_bankAccountNumber_key" ON "Driver"("bankAccountNumber");
