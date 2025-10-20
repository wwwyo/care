/*
  Warnings:

  - You are about to drop the `slot_details` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `slots` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."slot_details" DROP CONSTRAINT "slot_details_slot_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."slots" DROP CONSTRAINT "slots_facility_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."slots" DROP CONSTRAINT "slots_updated_by_fkey";

-- DropTable
DROP TABLE "public"."slot_details";

-- DropTable
DROP TABLE "public"."slots";

-- CreateTable
CREATE TABLE "public"."facility_availability_reports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "facility_id" UUID NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "valid_from" TIMESTAMPTZ NOT NULL,
    "valid_until" TIMESTAMPTZ,
    "note" TEXT,
    "context_summary" VARCHAR(200),
    "context_details" JSONB NOT NULL,
    "confidence" SMALLINT,
    "reported_by_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "facility_availability_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."supporter_availability_notes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "facility_id" UUID NOT NULL,
    "supporter_id" UUID NOT NULL,
    "plan_id" UUID,
    "client_id" UUID,
    "status" VARCHAR(20) NOT NULL,
    "intent" VARCHAR(30),
    "note" TEXT,
    "context_summary" VARCHAR(200),
    "context_details" JSONB NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supporter_availability_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "facility_availability_reports_facility_id_valid_until_idx" ON "public"."facility_availability_reports"("facility_id", "valid_until");

-- CreateIndex
CREATE INDEX "facility_availability_reports_status_idx" ON "public"."facility_availability_reports"("status");

-- CreateIndex
CREATE INDEX "supporter_availability_notes_facility_id_supporter_id_idx" ON "public"."supporter_availability_notes"("facility_id", "supporter_id");

-- CreateIndex
CREATE INDEX "supporter_availability_notes_plan_id_idx" ON "public"."supporter_availability_notes"("plan_id");

-- CreateIndex
CREATE INDEX "supporter_availability_notes_client_id_idx" ON "public"."supporter_availability_notes"("client_id");

-- AddForeignKey
ALTER TABLE "public"."facility_availability_reports" ADD CONSTRAINT "facility_availability_reports_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."facility_availability_reports" ADD CONSTRAINT "facility_availability_reports_reported_by_id_fkey" FOREIGN KEY ("reported_by_id") REFERENCES "public"."facility_staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."supporter_availability_notes" ADD CONSTRAINT "supporter_availability_notes_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."supporter_availability_notes" ADD CONSTRAINT "supporter_availability_notes_supporter_id_fkey" FOREIGN KEY ("supporter_id") REFERENCES "public"."supporters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."supporter_availability_notes" ADD CONSTRAINT "supporter_availability_notes_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."supporter_availability_notes" ADD CONSTRAINT "supporter_availability_notes_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
