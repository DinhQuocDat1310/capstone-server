-- AlterTable
ALTER TABLE "Campaign" ALTER COLUMN "dateOpenRegister" DROP NOT NULL,
ALTER COLUMN "dateWrapSticket" DROP NOT NULL,
ALTER COLUMN "endRegisterDate" DROP NOT NULL,
ALTER COLUMN "startRegisterDate" DROP NOT NULL;
