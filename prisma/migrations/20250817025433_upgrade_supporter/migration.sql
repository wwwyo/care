-- AlterTable
ALTER TABLE "public"."client_profiles" ADD COLUMN     "care_level" VARCHAR(50),
ADD COLUMN     "disability" VARCHAR(255),
ADD COLUMN     "emergency_contact_name" VARCHAR(255),
ADD COLUMN     "emergency_contact_phone" VARCHAR(20),
ADD COLUMN     "emergency_contact_relation" VARCHAR(50),
ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "public"."facility_contacts" ADD COLUMN     "fax" VARCHAR(20),
ADD COLUMN     "website" VARCHAR(255);

-- AlterTable
ALTER TABLE "public"."facility_locations" ADD COLUMN     "access_info" TEXT;

-- AlterTable
ALTER TABLE "public"."facility_profiles" ADD COLUMN     "service_type" VARCHAR(50);

-- AlterTable
ALTER TABLE "public"."slots" ADD COLUMN     "comment" VARCHAR(100),
ALTER COLUMN "expires_at" DROP NOT NULL;
