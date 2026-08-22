-- AlterEnum
ALTER TYPE "LeadSource" ADD VALUE 'VOICE_CALL';

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "consentGiven" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "message" TEXT;

-- AlterTable
ALTER TABLE "Visitor" ADD COLUMN     "isRegistered" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ADD COLUMN     "passwordHash" TEXT;
