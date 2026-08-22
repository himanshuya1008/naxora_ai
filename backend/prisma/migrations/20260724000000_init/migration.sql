-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "OrganizationPlan" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('OWNER', 'ADMIN', 'SALES_REP', 'VIEWER');

-- CreateEnum
CREATE TYPE "ApiKeyType" AS ENUM ('TRACKING_PUBLIC', 'SERVER');

-- CreateEnum
CREATE TYPE "DecisionStage" AS ENUM ('AWARENESS', 'CONSIDERATION', 'DECISION');

-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('DESKTOP', 'MOBILE', 'TABLET', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "BehaviorEventType" AS ENUM ('PAGE_VIEW', 'SCROLL_DEPTH', 'CLICK', 'DOWNLOAD', 'SEARCH', 'PRICING_VIEW', 'ENTERPRISE_VIEW', 'FAQ_VIEW', 'CASE_STUDY_VIEW', 'PRODUCT_VIEW', 'FORM_SUBMIT', 'VIDEO_PLAY', 'SERVICE_VIEW', 'DEMO_REQUEST');

-- CreateEnum
CREATE TYPE "IntentLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH');

-- CreateEnum
CREATE TYPE "SensitivityLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "KnowledgeLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'EXPERT');

-- CreateEnum
CREATE TYPE "DecisionSpeed" AS ENUM ('SLOW', 'MODERATE', 'FAST');

-- CreateEnum
CREATE TYPE "CommunicationStyle" AS ENUM ('ANALYTICAL', 'DRIVER', 'EXPRESSIVE', 'AMIABLE');

-- CreateEnum
CREATE TYPE "CompanySize" AS ENUM ('SOLO', 'SMALL', 'MID_MARKET', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('ACTIVE', 'ENDED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "ConversationChannel" AS ENUM ('VOICE', 'CHAT');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('VISITOR', 'AI', 'SYSTEM');

-- CreateEnum
CREATE TYPE "ObjectionType" AS ENUM ('PRICE', 'TRUST', 'TIMING', 'COMPETITOR', 'FEATURE_GAP', 'AUTHORITY', 'OTHER');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('AI_CONVERSATION', 'BOOK_DEMO_FORM', 'CONTACT_FORM');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "plan" "OrganizationPlan" NOT NULL DEFAULT 'FREE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'SALES_REP',
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" "ApiKeyType" NOT NULL DEFAULT 'TRACKING_PUBLIC',
    "revokedAt" TIMESTAMP(3),
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visitor" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "company" TEXT,
    "industry" TEXT,
    "companySize" "CompanySize",
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "interestScore" INTEGER NOT NULL DEFAULT 0,
    "decisionStage" "DecisionStage" NOT NULL DEFAULT 'AWARENESS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Visitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "referrer" TEXT,
    "landingPage" TEXT,
    "userAgent" TEXT,
    "deviceType" "DeviceType" NOT NULL DEFAULT 'UNKNOWN',
    "country" TEXT,
    "region" TEXT,
    "pageViewCount" INTEGER NOT NULL DEFAULT 0,
    "scrollDepthAvg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "durationSeconds" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BehaviorEvent" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "type" "BehaviorEventType" NOT NULL,
    "page" TEXT NOT NULL,
    "label" TEXT,
    "value" DOUBLE PRECISION,
    "metadata" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BehaviorEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerDNA" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "buyingIntent" "IntentLevel" NOT NULL,
    "interestScore" INTEGER NOT NULL,
    "budgetSensitivity" "SensitivityLevel" NOT NULL,
    "technicalKnowledge" "KnowledgeLevel" NOT NULL,
    "decisionSpeed" "DecisionSpeed" NOT NULL,
    "communicationStyle" "CommunicationStyle" NOT NULL,
    "industry" TEXT,
    "companySize" "CompanySize",
    "likelyObjections" JSONB NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL,
    "personality" TEXT,
    "reasoning" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerDNA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "sessionId" TEXT,
    "assignedRepId" TEXT,
    "channel" "ConversationChannel" NOT NULL DEFAULT 'VOICE',
    "status" "ConversationStatus" NOT NULL DEFAULT 'ACTIVE',
    "currentStrategy" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "durationSeconds" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "audioUrl" TEXT,
    "sentimentScore" DOUBLE PRECISION,
    "strategyUsed" TEXT,
    "predictedObjection" TEXT,
    "reasoningTrace" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationScoreSnapshot" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "interestScore" INTEGER NOT NULL,
    "trustScore" INTEGER NOT NULL,
    "buyingProbability" INTEGER NOT NULL,
    "sentimentScore" DOUBLE PRECISION NOT NULL,
    "objectionCount" INTEGER NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversationScoreSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ObjectionLog" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "messageId" TEXT,
    "type" "ObjectionType" NOT NULL,
    "detail" TEXT,
    "handled" BOOLEAN NOT NULL DEFAULT false,
    "resolutionStrategy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ObjectionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "transcriptSummary" TEXT NOT NULL,
    "salesPerformanceScore" INTEGER NOT NULL,
    "buyingProbability" INTEGER NOT NULL,
    "dnaSnapshot" JSONB NOT NULL,
    "recommendations" JSONB NOT NULL,
    "missedOpportunities" JSONB NOT NULL,
    "suggestedFollowUp" JSONB NOT NULL,
    "crmSummary" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "visitorId" TEXT,
    "conversationId" TEXT,
    "name" TEXT,
    "email" TEXT,
    "company" TEXT,
    "industry" TEXT,
    "teamSize" TEXT,
    "budget" TEXT,
    "timeline" TEXT,
    "businessGoals" TEXT,
    "currentProblems" TEXT,
    "interestedService" TEXT,
    "source" "LeadSource" NOT NULL DEFAULT 'AI_CONVERSATION',
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE INDEX "Organization_slug_idx" ON "Organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_organizationId_idx" ON "User"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_key_key" ON "ApiKey"("key");

-- CreateIndex
CREATE INDEX "ApiKey_organizationId_idx" ON "ApiKey"("organizationId");

-- CreateIndex
CREATE INDEX "ApiKey_key_idx" ON "ApiKey"("key");

-- CreateIndex
CREATE INDEX "Visitor_organizationId_lastSeenAt_idx" ON "Visitor"("organizationId", "lastSeenAt");

-- CreateIndex
CREATE INDEX "Visitor_organizationId_interestScore_idx" ON "Visitor"("organizationId", "interestScore");

-- CreateIndex
CREATE UNIQUE INDEX "Visitor_organizationId_fingerprint_key" ON "Visitor"("organizationId", "fingerprint");

-- CreateIndex
CREATE INDEX "Session_organizationId_visitorId_idx" ON "Session"("organizationId", "visitorId");

-- CreateIndex
CREATE INDEX "Session_visitorId_startedAt_idx" ON "Session"("visitorId", "startedAt");

-- CreateIndex
CREATE INDEX "BehaviorEvent_sessionId_idx" ON "BehaviorEvent"("sessionId");

-- CreateIndex
CREATE INDEX "BehaviorEvent_visitorId_occurredAt_idx" ON "BehaviorEvent"("visitorId", "occurredAt");

-- CreateIndex
CREATE INDEX "BehaviorEvent_organizationId_type_occurredAt_idx" ON "BehaviorEvent"("organizationId", "type", "occurredAt");

-- CreateIndex
CREATE INDEX "CustomerDNA_visitorId_createdAt_idx" ON "CustomerDNA"("visitorId", "createdAt");

-- CreateIndex
CREATE INDEX "CustomerDNA_organizationId_interestScore_idx" ON "CustomerDNA"("organizationId", "interestScore");

-- CreateIndex
CREATE INDEX "Conversation_organizationId_status_idx" ON "Conversation"("organizationId", "status");

-- CreateIndex
CREATE INDEX "Conversation_visitorId_startedAt_idx" ON "Conversation"("visitorId", "startedAt");

-- CreateIndex
CREATE INDEX "Message_conversationId_sequence_idx" ON "Message"("conversationId", "sequence");

-- CreateIndex
CREATE INDEX "ConversationScoreSnapshot_conversationId_capturedAt_idx" ON "ConversationScoreSnapshot"("conversationId", "capturedAt");

-- CreateIndex
CREATE INDEX "ObjectionLog_conversationId_idx" ON "ObjectionLog"("conversationId");

-- CreateIndex
CREATE UNIQUE INDEX "Report_conversationId_key" ON "Report"("conversationId");

-- CreateIndex
CREATE INDEX "Report_conversationId_idx" ON "Report"("conversationId");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_conversationId_key" ON "Lead"("conversationId");

-- CreateIndex
CREATE INDEX "Lead_organizationId_status_idx" ON "Lead"("organizationId", "status");

-- CreateIndex
CREATE INDEX "Lead_organizationId_createdAt_idx" ON "Lead"("organizationId", "createdAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visitor" ADD CONSTRAINT "Visitor_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BehaviorEvent" ADD CONSTRAINT "BehaviorEvent_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BehaviorEvent" ADD CONSTRAINT "BehaviorEvent_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BehaviorEvent" ADD CONSTRAINT "BehaviorEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerDNA" ADD CONSTRAINT "CustomerDNA_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerDNA" ADD CONSTRAINT "CustomerDNA_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_assignedRepId_fkey" FOREIGN KEY ("assignedRepId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationScoreSnapshot" ADD CONSTRAINT "ConversationScoreSnapshot_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObjectionLog" ADD CONSTRAINT "ObjectionLog_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

