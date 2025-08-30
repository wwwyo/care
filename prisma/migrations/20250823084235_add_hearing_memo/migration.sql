/*
  Warnings:

  - You are about to drop the `hearing_extracted_data` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `hearing_sessions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `hearing_transcripts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."hearing_extracted_data" DROP CONSTRAINT "hearing_extracted_data_hearing_session_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."hearing_sessions" DROP CONSTRAINT "hearing_sessions_client_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."hearing_sessions" DROP CONSTRAINT "hearing_sessions_plan_version_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."hearing_sessions" DROP CONSTRAINT "hearing_sessions_supporter_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."hearing_transcripts" DROP CONSTRAINT "hearing_transcripts_hearing_session_id_fkey";

-- DropTable
DROP TABLE "public"."hearing_extracted_data";

-- DropTable
DROP TABLE "public"."hearing_sessions";

-- DropTable
DROP TABLE "public"."hearing_transcripts";

-- CreateTable
CREATE TABLE "public"."hearing_memos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "client_id" UUID NOT NULL,
    "supporter_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" JSON NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hearing_memos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "hearing_memos_client_id_idx" ON "public"."hearing_memos"("client_id");

-- CreateIndex
CREATE INDEX "hearing_memos_supporter_id_idx" ON "public"."hearing_memos"("supporter_id");

-- CreateIndex
CREATE INDEX "hearing_memos_date_idx" ON "public"."hearing_memos"("date");

-- AddForeignKey
ALTER TABLE "public"."hearing_memos" ADD CONSTRAINT "hearing_memos_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hearing_memos" ADD CONSTRAINT "hearing_memos_supporter_id_fkey" FOREIGN KEY ("supporter_id") REFERENCES "public"."supporters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
