/*
  Warnings:

  - You are about to drop the column `city` on the `facility_locations` table. All the data in the column will be lost.
  - You are about to drop the column `prefecture` on the `facility_locations` table. All the data in the column will be lost.
  - You are about to drop the column `street` on the `facility_locations` table. All the data in the column will be lost.
  - You are about to drop the column `service_type` on the `facility_profiles` table. All the data in the column will be lost.
  - Changed the type of `service_type` on the `facility_services` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."service_category" AS ENUM ('VISITING', 'DAY_ACTIVITY', 'RESIDENTIAL', 'HOUSING', 'TRAINING_WORK');

-- CreateEnum
CREATE TYPE "public"."service_type" AS ENUM ('HOME_CARE', 'VISITING_CARE_SEVERE', 'ACCOMPANIMENT', 'BEHAVIOR_SUPPORT', 'COMPREHENSIVE_SUPPORT_SEVERE', 'MEDICAL_CARE', 'DAILY_LIFE_SUPPORT', 'SHORT_STAY', 'FACILITY_ADMISSION', 'GROUP_HOME', 'INDEPENDENT_LIFE_SUPPORT', 'FUNCTIONAL_TRAINING', 'LIFE_TRAINING', 'RESIDENTIAL_TRAINING', 'EMPLOYMENT_TRANSITION', 'EMPLOYMENT_SUPPORT_A', 'EMPLOYMENT_SUPPORT_B', 'EMPLOYMENT_RETENTION');

-- AlterTable
ALTER TABLE "public"."facility_locations" DROP COLUMN "city",
DROP COLUMN "prefecture",
DROP COLUMN "street",
ADD COLUMN     "address_city" VARCHAR(200),
ADD COLUMN     "address_detail" VARCHAR(500);

-- AlterTable
ALTER TABLE "public"."facility_profiles" DROP COLUMN "service_type",
ADD COLUMN     "corporation_id" UUID,
ADD COLUMN     "official_id" VARCHAR(20),
ADD COLUMN     "wam_id" VARCHAR(50);

-- AlterTable
ALTER TABLE "public"."facility_services" DROP COLUMN "service_type",
ADD COLUMN     "service_type" "public"."service_type" NOT NULL;

-- CreateTable
CREATE TABLE "public"."facility_corporations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "name_kana" VARCHAR(255),
    "corporate_number" VARCHAR(13),
    "postal_code" VARCHAR(10),
    "address_city" VARCHAR(200),
    "address_detail" VARCHAR(500),
    "phone" VARCHAR(20),
    "fax" VARCHAR(20),
    "url" VARCHAR(255),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "facility_corporations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."facility_business_hours" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "facility_id" UUID NOT NULL,
    "weekday_hours" TEXT,
    "saturday_hours" TEXT,
    "sunday_hours" TEXT,
    "holiday_hours" TEXT,
    "regular_holidays" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "facility_business_hours_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "facility_corporations_corporate_number_key" ON "public"."facility_corporations"("corporate_number");

-- CreateIndex
CREATE INDEX "facility_corporations_corporate_number_idx" ON "public"."facility_corporations"("corporate_number");

-- CreateIndex
CREATE UNIQUE INDEX "facility_business_hours_facility_id_key" ON "public"."facility_business_hours"("facility_id");

-- CreateIndex
CREATE INDEX "facility_profiles_wam_id_idx" ON "public"."facility_profiles"("wam_id");

-- CreateIndex
CREATE INDEX "facility_profiles_official_id_idx" ON "public"."facility_profiles"("official_id");

-- CreateIndex
CREATE INDEX "facility_profiles_corporation_id_idx" ON "public"."facility_profiles"("corporation_id");

-- CreateIndex
CREATE INDEX "facility_services_service_type_idx" ON "public"."facility_services"("service_type");

-- AddForeignKey
ALTER TABLE "public"."facility_profiles" ADD CONSTRAINT "facility_profiles_corporation_id_fkey" FOREIGN KEY ("corporation_id") REFERENCES "public"."facility_corporations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."facility_business_hours" ADD CONSTRAINT "facility_business_hours_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
