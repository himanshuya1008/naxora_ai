-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "companySize" "CompanySize",
ADD COLUMN     "decisionMaker" BOOLEAN,
ADD COLUMN     "leadScore" INTEGER,
ADD COLUMN     "phone" TEXT;
