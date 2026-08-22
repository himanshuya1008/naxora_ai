-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('STARTER', 'PROFESSIONAL', 'ENTERPRISE');

-- AlterEnum
BEGIN;
CREATE TYPE "LeadStatus_new" AS ENUM ('NEW_LEAD', 'CONTACTED', 'QUALIFIED', 'DEMO_REQUESTED', 'PROPOSAL_SENT', 'CUSTOMER', 'WON', 'LOST');
ALTER TABLE "public"."Lead" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Lead" ALTER COLUMN "status" TYPE "LeadStatus_new" USING ("status"::text::"LeadStatus_new");
ALTER TYPE "LeadStatus" RENAME TO "LeadStatus_old";
ALTER TYPE "LeadStatus_new" RENAME TO "LeadStatus";
DROP TYPE "public"."LeadStatus_old";
ALTER TABLE "Lead" ALTER COLUMN "status" SET DEFAULT 'NEW_LEAD';
COMMIT;

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "currentPlan" "PlanTier",
ADD COLUMN     "ownerUserId" TEXT,
ADD COLUMN     "revenueOpportunity" INTEGER,
ALTER COLUMN "status" SET DEFAULT 'NEW_LEAD';

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

