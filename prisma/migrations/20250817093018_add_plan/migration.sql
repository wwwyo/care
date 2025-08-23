/*
  Warnings:

  - You are about to drop the column `area` on the `plan_versions` table. All the data in the column will be lost.
  - You are about to drop the column `end_date` on the `plan_versions` table. All the data in the column will be lost.
  - You are about to drop the column `frequency` on the `plan_versions` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `plan_versions` table. All the data in the column will be lost.
  - You are about to drop the column `service_type` on the `plan_versions` table. All the data in the column will be lost.
  - You are about to drop the column `start_date` on the `plan_versions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."plan_versions" DROP COLUMN "area",
DROP COLUMN "end_date",
DROP COLUMN "frequency",
DROP COLUMN "notes",
DROP COLUMN "service_type",
DROP COLUMN "start_date",
ADD COLUMN     "considerations" TEXT,
ADD COLUMN     "desired_life" TEXT,
ADD COLUMN     "troubles" TEXT,
ADD COLUMN     "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "version_type" VARCHAR(20) NOT NULL DEFAULT 'draft';

-- CreateTable
CREATE TABLE "public"."plan_services" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "plan_version_id" UUID NOT NULL,
    "service_category" VARCHAR(50) NOT NULL,
    "service_type" VARCHAR(100) NOT NULL,
    "desired_amount" VARCHAR(255),
    "desired_life_by_service" TEXT,
    "achievement_period" VARCHAR(100),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plan_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hearing_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "plan_version_id" UUID,
    "client_id" UUID NOT NULL,
    "supporter_id" UUID NOT NULL,
    "session_date" TIMESTAMPTZ NOT NULL,
    "duration" INTEGER,
    "audio_file_url" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'completed',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hearing_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hearing_transcripts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "hearing_session_id" UUID NOT NULL,
    "transcript_type" VARCHAR(20) NOT NULL,
    "content" TEXT NOT NULL,
    "timestamp" DECIMAL(10,3) NOT NULL,
    "end_timestamp" DECIMAL(10,3),
    "speaker" VARCHAR(50),
    "confidence" DECIMAL(3,2),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hearing_transcripts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hearing_extracted_data" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "hearing_session_id" UUID NOT NULL,
    "data_type" VARCHAR(50) NOT NULL,
    "extracted_content" TEXT NOT NULL,
    "confidence" DECIMAL(3,2) NOT NULL,
    "source_transcript_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hearing_extracted_data_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "plan_services_plan_version_id_idx" ON "public"."plan_services"("plan_version_id");

-- CreateIndex
CREATE INDEX "plan_services_service_category_idx" ON "public"."plan_services"("service_category");

-- CreateIndex
CREATE INDEX "plan_services_service_type_idx" ON "public"."plan_services"("service_type");

-- CreateIndex
CREATE INDEX "hearing_sessions_plan_version_id_idx" ON "public"."hearing_sessions"("plan_version_id");

-- CreateIndex
CREATE INDEX "hearing_sessions_client_id_idx" ON "public"."hearing_sessions"("client_id");

-- CreateIndex
CREATE INDEX "hearing_sessions_supporter_id_idx" ON "public"."hearing_sessions"("supporter_id");

-- CreateIndex
CREATE INDEX "hearing_sessions_session_date_idx" ON "public"."hearing_sessions"("session_date");

-- CreateIndex
CREATE INDEX "hearing_transcripts_hearing_session_id_idx" ON "public"."hearing_transcripts"("hearing_session_id");

-- CreateIndex
CREATE INDEX "hearing_transcripts_timestamp_idx" ON "public"."hearing_transcripts"("timestamp");

-- CreateIndex
CREATE INDEX "hearing_extracted_data_hearing_session_id_idx" ON "public"."hearing_extracted_data"("hearing_session_id");

-- CreateIndex
CREATE INDEX "hearing_extracted_data_data_type_idx" ON "public"."hearing_extracted_data"("data_type");

-- CreateIndex
CREATE INDEX "plan_versions_version_type_idx" ON "public"."plan_versions"("version_type");

-- AddForeignKey
ALTER TABLE "public"."plan_services" ADD CONSTRAINT "plan_services_plan_version_id_fkey" FOREIGN KEY ("plan_version_id") REFERENCES "public"."plan_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hearing_sessions" ADD CONSTRAINT "hearing_sessions_plan_version_id_fkey" FOREIGN KEY ("plan_version_id") REFERENCES "public"."plan_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hearing_sessions" ADD CONSTRAINT "hearing_sessions_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hearing_sessions" ADD CONSTRAINT "hearing_sessions_supporter_id_fkey" FOREIGN KEY ("supporter_id") REFERENCES "public"."supporters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hearing_transcripts" ADD CONSTRAINT "hearing_transcripts_hearing_session_id_fkey" FOREIGN KEY ("hearing_session_id") REFERENCES "public"."hearing_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hearing_extracted_data" ADD CONSTRAINT "hearing_extracted_data_hearing_session_id_fkey" FOREIGN KEY ("hearing_session_id") REFERENCES "public"."hearing_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
