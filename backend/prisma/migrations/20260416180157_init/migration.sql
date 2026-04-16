-- CreateEnum
CREATE TYPE "progress_status" AS ENUM ('PLANNED', 'ONGOING', 'COMPLETED');

-- CreateTable
CREATE TABLE "trips" (
    "trip_id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "status" "progress_status" NOT NULL DEFAULT 'PLANNED',
    "budget_cents" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" BIGINT NOT NULL,

    CONSTRAINT "trips_pkey" PRIMARY KEY ("trip_id")
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" BIGSERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "itineraries" (
    "itinerary_id" BIGSERIAL NOT NULL,
    "day_date" DATE NOT NULL,
    "daily_quota" INTEGER NOT NULL,
    "status" "progress_status" NOT NULL DEFAULT 'PLANNED',
    "total_estimate_cents" INTEGER NOT NULL DEFAULT 0,
    "place_api_ref" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trip_id" BIGINT NOT NULL,

    CONSTRAINT "itineraries_pkey" PRIMARY KEY ("itinerary_id")
);

-- CreateTable
CREATE TABLE "visitations" (
    "visitation_id" BIGSERIAL NOT NULL,
    "price_cents" INTEGER NOT NULL DEFAULT 0,
    "visit_order" INTEGER,
    "schedule_time" TEXT,
    "estimate_stay_time" INTEGER,
    "is_visited" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "itinerary_id" BIGINT NOT NULL,

    CONSTRAINT "visitations_pkey" PRIMARY KEY ("visitation_id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "token_id" BIGSERIAL NOT NULL,
    "token_hash" TEXT NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "device_info" TEXT,
    "ip_address" TEXT,
    "expires_at" TIMESTAMPTZ(3) NOT NULL DEFAULT NOW() + INTERVAL '7 DAYS',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" BIGINT NOT NULL,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("token_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "trips_user_id_name_key" ON "trips"("user_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "visitations_itinerary_id_schedule_time_key" ON "visitations"("itinerary_id", "schedule_time");

-- CreateIndex
CREATE UNIQUE INDEX "visitations_itinerary_id_visit_order_key" ON "visitations"("itinerary_id", "visit_order");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itineraries" ADD CONSTRAINT "itineraries_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("trip_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitations" ADD CONSTRAINT "visitations_itinerary_id_fkey" FOREIGN KEY ("itinerary_id") REFERENCES "itineraries"("itinerary_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
