-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'DRIVER', 'BRAND', 'MANAGER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('INIT', 'NEW', 'PENDING', 'UPDATE', 'BANNED', 'VERIFIED');

-- CreateEnum
CREATE TYPE "CarColor" AS ENUM ('WHITE', 'BLACK', 'SILVER_GRAY', 'RED', 'BLUE', 'BROWN_BEIGE', 'GREEN', 'YELLOW_GOLD');

-- CreateEnum
CREATE TYPE "CarMake" AS ENUM ('TOYOTA', 'KIA', 'HYUNDAI', 'MAZDA', 'FORD', 'HONDA', 'MITSUBISHI', 'VINFAST', 'MERCEDES', 'AUDI');

-- CreateEnum
CREATE TYPE "AssignBy" AS ENUM ('ADMIN', 'SYSTEM');

-- CreateEnum
CREATE TYPE "VerifyAccountStatus" AS ENUM ('NEW', 'ACCEPT', 'BANNED', 'EXPIRED', 'UPDATE', 'PENDING');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT,
    "phoneNumber" TEXT,
    "fullname" TEXT,
    "address" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "role" "Role" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'INIT',
    "idCitizen" TEXT,
    "imageCitizenFront" TEXT,
    "imageCitizenBack" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "brandName" TEXT NOT NULL,
    "logo" TEXT,
    "idLicenseBusiness" TEXT,
    "ownerLicenseBusiness" TEXT,
    "typeBusiness" TEXT,
    "imageLicenseBusiness" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Driver" (
    "id" TEXT NOT NULL,
    "licensePlate" TEXT,
    "make" "CarMake",
    "color" "CarColor",
    "model" TEXT,
    "year" TEXT,
    "imageCarFront" TEXT,
    "imageCarBack" TEXT,
    "idBank" TEXT,
    "ownerBank" TEXT,
    "nameBank" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Manager" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Manager_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerifyAccount" (
    "id" TEXT NOT NULL,
    "status" "VerifyAccountStatus" NOT NULL DEFAULT 'NEW',
    "detail" TEXT,
    "createDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,
    "expiredDate" TIMESTAMP(3),
    "assignBy" "AssignBy",
    "brandId" TEXT,
    "driverId" TEXT,
    "managerId" TEXT,

    CONSTRAINT "VerifyAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_idCitizen_key" ON "User"("idCitizen");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_brandName_key" ON "Brand"("brandName");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_idLicenseBusiness_key" ON "Brand"("idLicenseBusiness");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_userId_key" ON "Brand"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_idBank_key" ON "Driver"("idBank");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_userId_key" ON "Driver"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Manager_userId_key" ON "Manager"("userId");

-- AddForeignKey
ALTER TABLE "Brand" ADD CONSTRAINT "Brand_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Manager" ADD CONSTRAINT "Manager_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerifyAccount" ADD CONSTRAINT "VerifyAccount_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerifyAccount" ADD CONSTRAINT "VerifyAccount_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerifyAccount" ADD CONSTRAINT "VerifyAccount_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Manager"("id") ON DELETE SET NULL ON UPDATE CASCADE;
