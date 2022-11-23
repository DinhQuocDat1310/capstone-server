-- AlterTable
ALTER TABLE "PaymentDebit" ADD COLUMN     "isValid" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "price" DROP NOT NULL;
