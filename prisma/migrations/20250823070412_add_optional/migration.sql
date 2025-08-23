-- AlterTable
ALTER TABLE "public"."client_profiles" ALTER COLUMN "birth_date" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."supporter_profiles" ALTER COLUMN "birth_date" DROP NOT NULL;
