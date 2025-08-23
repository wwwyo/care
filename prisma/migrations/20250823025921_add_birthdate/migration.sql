/*
  Warnings:

  - Made the column `birth_date` on table `client_profiles` required. This step will fail if there are existing NULL values in that column.
  - Made the column `birth_date` on table `supporter_profiles` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."client_profiles" ALTER COLUMN "birth_date" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."supporter_profiles" ALTER COLUMN "birth_date" SET NOT NULL;
