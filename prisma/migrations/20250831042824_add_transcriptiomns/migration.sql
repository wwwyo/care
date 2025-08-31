-- AlterTable
ALTER TABLE "public"."hearing_memos" ALTER COLUMN "content" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "public"."hearing_transcripts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "hearing_memo_id" UUID NOT NULL,
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
CREATE TABLE "public"."hearing_audios" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "hearing_memo_id" UUID NOT NULL,
    "audio_file_url" TEXT NOT NULL,
    "duration" INTEGER,
    "status" VARCHAR(20) NOT NULL DEFAULT 'completed',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hearing_audios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "hearing_transcripts_hearing_memo_id_idx" ON "public"."hearing_transcripts"("hearing_memo_id");

-- CreateIndex
CREATE INDEX "hearing_transcripts_timestamp_idx" ON "public"."hearing_transcripts"("timestamp");

-- CreateIndex
CREATE INDEX "hearing_audios_hearing_memo_id_idx" ON "public"."hearing_audios"("hearing_memo_id");

-- AddForeignKey
ALTER TABLE "public"."hearing_transcripts" ADD CONSTRAINT "hearing_transcripts_hearing_memo_id_fkey" FOREIGN KEY ("hearing_memo_id") REFERENCES "public"."hearing_memos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hearing_audios" ADD CONSTRAINT "hearing_audios_hearing_memo_id_fkey" FOREIGN KEY ("hearing_memo_id") REFERENCES "public"."hearing_memos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
