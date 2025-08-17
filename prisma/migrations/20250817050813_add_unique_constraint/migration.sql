/*
  Warnings:

  - A unique constraint covering the columns `[facility_id]` on the table `slots` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."slots_facility_id_idx";

-- CreateIndex
CREATE UNIQUE INDEX "slots_facility_id_key" ON "public"."slots"("facility_id");
