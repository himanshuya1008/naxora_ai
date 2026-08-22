-- Retroactive record of statements already run directly against the
-- database during development (see conversation history) — Postgres can't
-- rename/remove enum values in one step, only add them, so these had to run
-- and have existing rows remapped BEFORE the final LeadStatus definition
-- (which drops NEW/CONVERTED) could be migrated normally. This file exists
-- so Prisma's migration history matches what's actually in the database;
-- it is marked applied via `prisma migrate resolve --applied`, not executed.

ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'NEW_LEAD';
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'DEMO_REQUESTED';
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'PROPOSAL_SENT';
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'CUSTOMER';
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'WON';
