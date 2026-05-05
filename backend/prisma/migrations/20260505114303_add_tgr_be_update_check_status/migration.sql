CREATE OR REPLACE FUNCTION "validate_update_check_status"()
    RETURNS TRIGGER AS $$
        BEGIN 
            IF OLD."status" = 'COMPLETED' OR OLD."status" = 'CANCELED' THEN 
                RAISE EXCEPTION '% cannot be updated when is completed or canceled', TG_TABLE_NAME;
            END IF;
            RETURN NEW;
        END;
    $$ LANGUAGE plpgsql;

CREATE TRIGGER "trg_be_update_trips_check_status"
BEFORE UPDATE ON "trips"
FOR EACH ROW EXECUTE FUNCTION "validate_update_check_status"();

CREATE TRIGGER "trg_be_update_itineraries_check_status"
BEFORE UPDATE ON "itineraries"
FOR EACH ROW EXECUTE FUNCTION "validate_update_check_status"();

