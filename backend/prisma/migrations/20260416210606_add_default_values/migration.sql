-- AlterTable
ALTER TABLE "itineraries" ALTER COLUMN "daily_quota" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "refresh_tokens" ALTER COLUMN "expires_at" SET DEFAULT NOW() + INTERVAL '7 DAYS';