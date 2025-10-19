-- AlterTable
ALTER TABLE "public"."hearing_transcripts" ALTER COLUMN "timestamp" SET DATA TYPE DECIMAL(13,3),
ALTER COLUMN "end_timestamp" SET DATA TYPE DECIMAL(13,3);
