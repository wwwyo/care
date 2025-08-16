/*
  Warnings:

  - You are about to drop the `facility_staff_roles` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."facility_staff_roles" DROP CONSTRAINT "facility_staff_roles_facility_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."facility_staff_roles" DROP CONSTRAINT "facility_staff_roles_facility_staff_id_fkey";

-- DropTable
DROP TABLE "public"."facility_staff_roles";
