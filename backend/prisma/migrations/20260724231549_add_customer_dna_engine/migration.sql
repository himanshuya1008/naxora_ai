-- CreateEnum
CREATE TYPE "LeadGrade" AS ENUM ('A_PLUS', 'A', 'B_PLUS', 'B', 'C', 'D');

-- CreateEnum
CREATE TYPE "CustomerPersonality" AS ENUM ('DECISION_MAKER', 'TECHNICAL_BUYER', 'BUSINESS_BUYER', 'RESEARCHER', 'EXPLORER', 'STUDENT', 'ENTERPRISE_BUYER');

-- CreateEnum
CREATE TYPE "BudgetLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "RecommendationAction" AS ENUM ('DEMO', 'PRICING', 'CASE_STUDY', 'ENTERPRISE_PLAN', 'FOLLOW_UP_CALL', 'SCHEDULE_MEETING', 'FREE_TRIAL');

-- CreateTable
CREATE TABLE "customer_dna" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "interestScore" INTEGER NOT NULL,
    "trustScore" INTEGER NOT NULL,
    "engagementScore" INTEGER NOT NULL,
    "buyingProbability" INTEGER NOT NULL,
    "leadGrade" "LeadGrade" NOT NULL,
    "intentLevel" "IntentLevel" NOT NULL,
    "personality" "CustomerPersonality" NOT NULL,
    "communicationStyle" "CommunicationStyle" NOT NULL,
    "preferredLanguage" TEXT NOT NULL DEFAULT 'en',
    "budgetLevel" "BudgetLevel",
    "companySize" "CompanySize",
    "industry" TEXT,
    "painPoints" TEXT[],
    "productsInterested" TEXT[],
    "objections" TEXT[],
    "recommendations" "RecommendationAction"[],
    "nextBestAction" "RecommendationAction" NOT NULL,
    "conversationSummary" TEXT,
    "confidence" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_dna_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "customer_dna_organizationId_customerId_idx" ON "customer_dna"("organizationId", "customerId");

-- CreateIndex
CREATE INDEX "customer_dna_organizationId_sessionId_idx" ON "customer_dna"("organizationId", "sessionId");

-- CreateIndex
CREATE INDEX "customer_dna_organizationId_leadGrade_idx" ON "customer_dna"("organizationId", "leadGrade");

-- AddForeignKey
ALTER TABLE "customer_dna" ADD CONSTRAINT "customer_dna_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
