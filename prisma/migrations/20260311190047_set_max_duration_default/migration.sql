-- Set default value for maxDurationMinutes (12 hours = 720 minutes)
ALTER TABLE "UserSettings" ALTER COLUMN "maxDurationMinutes" SET DEFAULT 720;
UPDATE "UserSettings" SET "maxDurationMinutes" = 720 WHERE "maxDurationMinutes" IS NULL;
ALTER TABLE "UserSettings" ALTER COLUMN "maxDurationMinutes" SET NOT NULL;
