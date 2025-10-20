/*
  Warnings:

  - Added support for 4 new consultation service types:
    - COMMUNITY_TRANSITION_SUPPORT (地域相談支援(地域移行支援))
    - COMMUNITY_SETTLEMENT_SUPPORT (地域相談支援(地域定着支援))
    - PLAN_CONSULTATION_SUPPORT (計画相談支援)
    - DISABLED_CHILD_CONSULTATION_SUPPORT (障害児相談支援)

*/
-- No schema changes needed for facility_services.service_type
-- The column is already VARCHAR(100) which supports all service types

-- AlterTable
ALTER TABLE "public"."plan_versions" ADD COLUMN     "client_address_snapshot" TEXT,
ADD COLUMN     "client_name_kana_snapshot" VARCHAR(255),
ADD COLUMN     "client_name_snapshot" VARCHAR(255),
ADD COLUMN     "client_postal_code_snapshot" VARCHAR(10),
ADD COLUMN     "consent_notes" TEXT,
ADD COLUMN     "consent_signed_on" DATE,
ADD COLUMN     "consent_signer_name" VARCHAR(255),
ADD COLUMN     "disability_classification" VARCHAR(50),
ADD COLUMN     "disability_support_level" VARCHAR(50),
ADD COLUMN     "envisioned_life_with_services" TEXT,
ADD COLUMN     "form_category" VARCHAR(20),
ADD COLUMN     "form_revision_month" DATE,
ADD COLUMN     "long_term_goal" TEXT,
ADD COLUMN     "medical_care_notes" TEXT,
ADD COLUMN     "medical_institution" VARCHAR(255),
ADD COLUMN     "medical_travel_time" VARCHAR(100),
ADD COLUMN     "medical_visit_frequency" VARCHAR(255),
ADD COLUMN     "monitoring_end_month" DATE,
ADD COLUMN     "monitoring_frequency" VARCHAR(40),
ADD COLUMN     "monitoring_frequency_other" VARCHAR(255),
ADD COLUMN     "monitoring_start_month" DATE,
ADD COLUMN     "municipality_name" VARCHAR(100),
ADD COLUMN     "non_weekly_service_notes" TEXT,
ADD COLUMN     "overall_support_policy" TEXT,
ADD COLUMN     "plan_created_on" DATE,
ADD COLUMN     "plan_creator_name" VARCHAR(255),
ADD COLUMN     "plan_creator_phone" VARCHAR(20),
ADD COLUMN     "plan_creator_title" VARCHAR(100),
ADD COLUMN     "recipient_certificate_number" VARCHAR(50),
ADD COLUMN     "regional_certificate_number" VARCHAR(50),
ADD COLUMN     "short_term_goal" TEXT,
ADD COLUMN     "support_office_name" VARCHAR(255),
ADD COLUMN     "user_burden_limit" VARCHAR(100),
ADD COLUMN     "user_intentions" TEXT;

-- Note: service_type enum was already removed in previous migration
-- The column now uses VARCHAR(100) to support flexible service types

-- CreateTable
CREATE TABLE "public"."plan_prioritized_supports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "plan_version_id" UUID NOT NULL,
    "priority_order" INTEGER NOT NULL,
    "need_description" TEXT,
    "support_goal" TEXT,
    "achievement_timing" VARCHAR(100),
    "welfare_service_name" VARCHAR(255),
    "service_detail" TEXT,
    "provider_name" VARCHAR(255),
    "provider_contact" VARCHAR(255),
    "user_role" TEXT,
    "evaluation_timing" VARCHAR(100),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plan_prioritized_supports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."plan_weekly_schedule_cells" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "plan_version_id" UUID NOT NULL,
    "time_slot" VARCHAR(20) NOT NULL,
    "column_type" VARCHAR(40) NOT NULL,
    "content" TEXT,
    "provider_name" VARCHAR(255),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plan_weekly_schedule_cells_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "plan_prioritized_supports_plan_version_id_idx" ON "public"."plan_prioritized_supports"("plan_version_id");

-- CreateIndex
CREATE UNIQUE INDEX "plan_prioritized_supports_plan_version_id_priority_order_key" ON "public"."plan_prioritized_supports"("plan_version_id", "priority_order");

-- CreateIndex
CREATE INDEX "plan_weekly_schedule_cells_plan_version_id_idx" ON "public"."plan_weekly_schedule_cells"("plan_version_id");

-- CreateIndex
CREATE INDEX "plan_weekly_schedule_cells_plan_version_id_column_type_idx" ON "public"."plan_weekly_schedule_cells"("plan_version_id", "column_type");

-- Note: facility_services_service_type_idx already exists from previous migration

-- AddForeignKey
ALTER TABLE "public"."plan_prioritized_supports" ADD CONSTRAINT "plan_prioritized_supports_plan_version_id_fkey" FOREIGN KEY ("plan_version_id") REFERENCES "public"."plan_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."plan_weekly_schedule_cells" ADD CONSTRAINT "plan_weekly_schedule_cells_plan_version_id_fkey" FOREIGN KEY ("plan_version_id") REFERENCES "public"."plan_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
