/*
  Warnings:

  - A unique constraint covering the columns `[client_id]` on the table `plans` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."plans_client_id_idx";

-- CreateIndex
CREATE UNIQUE INDEX "plans_client_id_key" ON "public"."plans"("client_id");
