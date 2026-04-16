

-- Add GIST Extension
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Add overlap constraint to the trips dates
ALTER TABLE "trips" ADD CONSTRAINT "no_overlapping_trips" 
EXCLUDE USING gist ("user_id" WITH =, (daterange("start_date", "end_date", '[)')) WITH &&);
--EXCLUDE USING gist (user_id WITH =,  daterange(start_date, end_date, '[)') WITH &&);

-- Add check "start_date" < "end_date" to the trips dates.
ALTER TABLE "trips" ADD CONSTRAINT "check_date"
CHECK ("start_date" < "end_date");

-- Add check budget_cents to the trips table
ALTER TABLE "trips" ADD CONSTRAINT "check_budget_cents" 
CHECK ("budget_cents" >= 0);

-- Add check daily_quota to the itineraries table
ALTER TABLE "itineraries" ADD CONSTRAINT "check_daily_quota" 
CHECK ("daily_quota" >= 0);

-- Add check total_estimate_cents to the itineraries table
ALTER TABLE "itineraries" ADD CONSTRAINT "check_total_estimate_cents" 
CHECK ("total_estimate_cents" >= 0);

-- Add check price_cents to the itineraries table
ALTER TABLE "visitations" ADD CONSTRAINT "check_price_cents" 
CHECK ("price_cents" >= 0);

-- Add check "expires_at" < "created_at" to the trips dates.
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "check_expires_at"
CHECK ("expires_at" > "created_at");

-- Function to validate date
CREATE OR REPLACE FUNCTION "validate_itinerary_date"()
    RETURNS TRIGGER AS $$
        BEGIN
            IF NOT EXISTS (
            SELECT 1 FROM "trips"
            WHERE "trip_id" = NEW."trip_id"
            AND NEW."day_date" >= "start_date"
            AND NEW."day_date" < "end_date"
            ) THEN
                RAISE EXCEPTION 'The itinerary date (%) must be between start_date (inclusive) and end_date (exclusive).', NEW."day_date";
            END IF;
        RETURN NEW;
        END;
    $$ LANGUAGE plpgsql;

-- Trigger to validate before insert or update
DROP TRIGGER IF EXISTS "trg_validate_itinerary_date" ON "itineraries";
CREATE TRIGGER "trg_validate_itinerary_date"
BEFORE INSERT OR UPDATE ON "itineraries"
FOR EACH ROW EXECUTE FUNCTION "validate_itinerary_date"();




