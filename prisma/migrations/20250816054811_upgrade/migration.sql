/*
  Warnings:

  - You are about to drop the column `user_id` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `supporter_id` on the `plans` table. All the data in the column will be lost.
  - Added the required column `tenant_id` to the `clients` table without a default value. This is not possible if the table is not empty.
  - Made the column `client_id` on table `plans` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."clients" DROP CONSTRAINT "clients_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."plans" DROP CONSTRAINT "plans_client_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."plans" DROP CONSTRAINT "plans_supporter_id_fkey";

-- DropIndex
DROP INDEX "public"."clients_user_id_idx";

-- DropIndex
DROP INDEX "public"."plans_supporter_id_idx";

-- AlterTable
ALTER TABLE "public"."clients" DROP COLUMN "user_id",
ADD COLUMN     "tenant_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "public"."plans" DROP COLUMN "supporter_id",
ALTER COLUMN "client_id" SET NOT NULL;

-- CreateTable
CREATE TABLE "public"."client_supporters" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "client_id" UUID NOT NULL,
    "supporter_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_supporters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "client_supporters_client_id_idx" ON "public"."client_supporters"("client_id");

-- CreateIndex
CREATE INDEX "client_supporters_supporter_id_idx" ON "public"."client_supporters"("supporter_id");

-- CreateIndex
CREATE UNIQUE INDEX "client_supporters_client_id_supporter_id_key" ON "public"."client_supporters"("client_id", "supporter_id");

-- CreateIndex
CREATE INDEX "clients_tenant_id_idx" ON "public"."clients"("tenant_id");

-- AddForeignKey
ALTER TABLE "public"."clients" ADD CONSTRAINT "clients_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."client_supporters" ADD CONSTRAINT "client_supporters_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."client_supporters" ADD CONSTRAINT "client_supporters_supporter_id_fkey" FOREIGN KEY ("supporter_id") REFERENCES "public"."supporters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."plans" ADD CONSTRAINT "plans_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
