-- CreateEnum
CREATE TYPE "StatusOrder" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "DescriptionType" AS ENUM ('ADD_AMOUNT', 'WIDTHDRAW_AMOUNT');

-- CreateTable
CREATE TABLE "IWallet" (
    "id" TEXT NOT NULL,
    "totalAmount" TEXT,
    "updateDate" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "IWallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderTransaction" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createDate" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "statusOrder" "StatusOrder" NOT NULL,
    "descriptionType" "DescriptionType" NOT NULL,
    "iWalletId" TEXT NOT NULL,

    CONSTRAINT "OrderTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IWallet_userId_key" ON "IWallet"("userId");

-- AddForeignKey
ALTER TABLE "IWallet" ADD CONSTRAINT "IWallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderTransaction" ADD CONSTRAINT "OrderTransaction_iWalletId_fkey" FOREIGN KEY ("iWalletId") REFERENCES "IWallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
