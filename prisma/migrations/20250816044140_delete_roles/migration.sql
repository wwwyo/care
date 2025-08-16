/*
  Warnings:

  - You are about to drop the column `auth_user_id` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `auth_user_id` on the `facility_staff` table. All the data in the column will be lost.
  - You are about to drop the column `auth_user_id` on the `supporters` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `clients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `facility_staff` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `supporters` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."clients_auth_user_id_idx";

-- DropIndex
DROP INDEX "public"."facility_staff_auth_user_id_idx";

-- DropIndex
DROP INDEX "public"."supporters_auth_user_id_idx";

-- AlterTable
ALTER TABLE "public"."clients" DROP COLUMN "auth_user_id",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."facility_staff" DROP COLUMN "auth_user_id",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."supporters" DROP COLUMN "auth_user_id",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "clients_user_id_idx" ON "public"."clients"("user_id");

-- CreateIndex
CREATE INDEX "facility_staff_user_id_idx" ON "public"."facility_staff"("user_id");

-- CreateIndex
CREATE INDEX "supporters_user_id_idx" ON "public"."supporters"("user_id");

-- AddForeignKey
ALTER TABLE "public"."supporters" ADD CONSTRAINT "supporters_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."clients" ADD CONSTRAINT "clients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."facility_staff" ADD CONSTRAINT "facility_staff_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
