-- CreateTable
CREATE TABLE "public"."tenants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."supporters" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "auth_user_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supporters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "auth_user_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."facilities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "facilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."facility_staff" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "auth_user_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "facility_staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."facility_staff_facilities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "facility_staff_id" UUID NOT NULL,
    "facility_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "facility_staff_facilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."facility_staff_roles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "facility_staff_id" UUID NOT NULL,
    "facility_id" UUID NOT NULL,
    "role" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "facility_staff_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."supporter_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "supporter_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "name_kana" VARCHAR(255),
    "gender" VARCHAR(10),
    "birth_date" DATE,
    "phone" VARCHAR(20),
    "tenant_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supporter_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "name_kana" VARCHAR(255),
    "gender" VARCHAR(10),
    "birth_date" DATE,
    "phone" VARCHAR(20),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_addresses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "postal_code" VARCHAR(10),
    "prefecture" VARCHAR(10),
    "city" VARCHAR(100),
    "street" VARCHAR(255),
    "building" VARCHAR(255),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."facility_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "facility_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "name_kana" VARCHAR(255),
    "description" TEXT,
    "capacity" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "facility_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."facility_locations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "facility_id" UUID NOT NULL,
    "postal_code" VARCHAR(10),
    "prefecture" VARCHAR(10),
    "city" VARCHAR(100),
    "street" VARCHAR(255),
    "building" VARCHAR(255),
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "facility_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."facility_contacts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "facility_id" UUID NOT NULL,
    "contact_type" VARCHAR(20) NOT NULL,
    "name" VARCHAR(255),
    "phone" VARCHAR(20),
    "email" VARCHAR(255),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "facility_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."facility_services" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "facility_id" UUID NOT NULL,
    "service_type" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "facility_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."facility_conditions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "facility_id" UUID NOT NULL,
    "condition_type" VARCHAR(50) NOT NULL,
    "condition_value" VARCHAR(255),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "facility_conditions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."plans" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "supporter_id" UUID NOT NULL,
    "user_id" UUID,
    "current_version_id" UUID,
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."plan_versions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "plan_id" UUID NOT NULL,
    "version_number" INTEGER NOT NULL,
    "service_type" VARCHAR(50) NOT NULL,
    "frequency" VARCHAR(100),
    "area" VARCHAR(255),
    "start_date" DATE,
    "end_date" DATE,
    "notes" TEXT,
    "valid_from" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valid_until" TIMESTAMPTZ,
    "created_by" UUID NOT NULL,
    "reason_for_update" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plan_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."plan_accessibility_requirements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "plan_version_id" UUID NOT NULL,
    "requirement_type" VARCHAR(50) NOT NULL,
    "details" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plan_accessibility_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."plan_custom_fields" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "plan_version_id" UUID NOT NULL,
    "field_name" VARCHAR(100) NOT NULL,
    "field_value" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plan_custom_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."slots" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "facility_id" UUID NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "updated_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."slot_details" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slot_id" UUID NOT NULL,
    "detail_type" VARCHAR(50) NOT NULL,
    "detail_value" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "slot_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."consents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "plan_id" UUID NOT NULL,
    "request_type" VARCHAR(20) NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."consent_grants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "consent_id" UUID NOT NULL,
    "granted_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "granted_by" VARCHAR(255),
    "method" VARCHAR(50) NOT NULL,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consent_grants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."inquiries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "plan_id" UUID NOT NULL,
    "facility_id" UUID NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'open',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."inquiry_messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "inquiry_id" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "sender_type" VARCHAR(20) NOT NULL,
    "sender_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inquiry_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."inquiry_replies" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "inquiry_id" UUID NOT NULL,
    "reply_type" VARCHAR(20) NOT NULL,
    "reply_data" JSON NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inquiry_replies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."audits" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "table_name" VARCHAR(50) NOT NULL,
    "record_id" UUID NOT NULL,
    "action" VARCHAR(20) NOT NULL,
    "actor_id" UUID NOT NULL,
    "actor_type" VARCHAR(20) NOT NULL,
    "changes" JSON,
    "metadata" JSON,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "supporters_tenant_id_idx" ON "public"."supporters"("tenant_id");

-- CreateIndex
CREATE INDEX "supporters_auth_user_id_idx" ON "public"."supporters"("auth_user_id");

-- CreateIndex
CREATE INDEX "users_auth_user_id_idx" ON "public"."users"("auth_user_id");

-- CreateIndex
CREATE INDEX "facility_staff_auth_user_id_idx" ON "public"."facility_staff"("auth_user_id");

-- CreateIndex
CREATE INDEX "facility_staff_facilities_facility_staff_id_idx" ON "public"."facility_staff_facilities"("facility_staff_id");

-- CreateIndex
CREATE INDEX "facility_staff_facilities_facility_id_idx" ON "public"."facility_staff_facilities"("facility_id");

-- CreateIndex
CREATE UNIQUE INDEX "facility_staff_facilities_facility_staff_id_facility_id_key" ON "public"."facility_staff_facilities"("facility_staff_id", "facility_id");

-- CreateIndex
CREATE INDEX "facility_staff_roles_facility_staff_id_idx" ON "public"."facility_staff_roles"("facility_staff_id");

-- CreateIndex
CREATE INDEX "facility_staff_roles_facility_id_idx" ON "public"."facility_staff_roles"("facility_id");

-- CreateIndex
CREATE UNIQUE INDEX "facility_staff_roles_facility_staff_id_facility_id_role_key" ON "public"."facility_staff_roles"("facility_staff_id", "facility_id", "role");

-- CreateIndex
CREATE UNIQUE INDEX "supporter_profiles_supporter_id_key" ON "public"."supporter_profiles"("supporter_id");

-- CreateIndex
CREATE INDEX "supporter_profiles_tenant_id_idx" ON "public"."supporter_profiles"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_user_id_key" ON "public"."user_profiles"("user_id");

-- CreateIndex
CREATE INDEX "user_addresses_user_id_idx" ON "public"."user_addresses"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "facility_profiles_facility_id_key" ON "public"."facility_profiles"("facility_id");

-- CreateIndex
CREATE UNIQUE INDEX "facility_locations_facility_id_key" ON "public"."facility_locations"("facility_id");

-- CreateIndex
CREATE INDEX "facility_locations_latitude_longitude_idx" ON "public"."facility_locations"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "facility_contacts_facility_id_idx" ON "public"."facility_contacts"("facility_id");

-- CreateIndex
CREATE INDEX "facility_services_facility_id_idx" ON "public"."facility_services"("facility_id");

-- CreateIndex
CREATE INDEX "facility_services_service_type_idx" ON "public"."facility_services"("service_type");

-- CreateIndex
CREATE INDEX "facility_conditions_facility_id_idx" ON "public"."facility_conditions"("facility_id");

-- CreateIndex
CREATE INDEX "facility_conditions_condition_type_idx" ON "public"."facility_conditions"("condition_type");

-- CreateIndex
CREATE INDEX "plans_tenant_id_idx" ON "public"."plans"("tenant_id");

-- CreateIndex
CREATE INDEX "plans_supporter_id_idx" ON "public"."plans"("supporter_id");

-- CreateIndex
CREATE INDEX "plans_user_id_idx" ON "public"."plans"("user_id");

-- CreateIndex
CREATE INDEX "plans_current_version_id_idx" ON "public"."plans"("current_version_id");

-- CreateIndex
CREATE INDEX "plan_versions_plan_id_idx" ON "public"."plan_versions"("plan_id");

-- CreateIndex
CREATE INDEX "plan_versions_valid_from_idx" ON "public"."plan_versions"("valid_from");

-- CreateIndex
CREATE INDEX "plan_versions_valid_until_idx" ON "public"."plan_versions"("valid_until");

-- CreateIndex
CREATE UNIQUE INDEX "plan_versions_plan_id_version_number_key" ON "public"."plan_versions"("plan_id", "version_number");

-- CreateIndex
CREATE INDEX "plan_accessibility_requirements_plan_version_id_idx" ON "public"."plan_accessibility_requirements"("plan_version_id");

-- CreateIndex
CREATE INDEX "plan_accessibility_requirements_requirement_type_idx" ON "public"."plan_accessibility_requirements"("requirement_type");

-- CreateIndex
CREATE INDEX "plan_custom_fields_plan_version_id_idx" ON "public"."plan_custom_fields"("plan_version_id");

-- CreateIndex
CREATE INDEX "slots_facility_id_idx" ON "public"."slots"("facility_id");

-- CreateIndex
CREATE INDEX "slots_status_idx" ON "public"."slots"("status");

-- CreateIndex
CREATE INDEX "slots_expires_at_idx" ON "public"."slots"("expires_at");

-- CreateIndex
CREATE INDEX "slot_details_slot_id_idx" ON "public"."slot_details"("slot_id");

-- CreateIndex
CREATE UNIQUE INDEX "consents_token_key" ON "public"."consents"("token");

-- CreateIndex
CREATE INDEX "consents_plan_id_idx" ON "public"."consents"("plan_id");

-- CreateIndex
CREATE INDEX "consents_token_idx" ON "public"."consents"("token");

-- CreateIndex
CREATE INDEX "consents_status_idx" ON "public"."consents"("status");

-- CreateIndex
CREATE INDEX "consent_grants_consent_id_idx" ON "public"."consent_grants"("consent_id");

-- CreateIndex
CREATE INDEX "inquiries_plan_id_idx" ON "public"."inquiries"("plan_id");

-- CreateIndex
CREATE INDEX "inquiries_facility_id_idx" ON "public"."inquiries"("facility_id");

-- CreateIndex
CREATE INDEX "inquiries_status_idx" ON "public"."inquiries"("status");

-- CreateIndex
CREATE INDEX "inquiry_messages_inquiry_id_idx" ON "public"."inquiry_messages"("inquiry_id");

-- CreateIndex
CREATE INDEX "inquiry_messages_sender_id_idx" ON "public"."inquiry_messages"("sender_id");

-- CreateIndex
CREATE INDEX "inquiry_replies_inquiry_id_idx" ON "public"."inquiry_replies"("inquiry_id");

-- CreateIndex
CREATE INDEX "audits_table_name_record_id_idx" ON "public"."audits"("table_name", "record_id");

-- CreateIndex
CREATE INDEX "audits_actor_id_idx" ON "public"."audits"("actor_id");

-- CreateIndex
CREATE INDEX "audits_created_at_idx" ON "public"."audits"("created_at");

-- AddForeignKey
ALTER TABLE "public"."supporters" ADD CONSTRAINT "supporters_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."facility_staff_facilities" ADD CONSTRAINT "facility_staff_facilities_facility_staff_id_fkey" FOREIGN KEY ("facility_staff_id") REFERENCES "public"."facility_staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."facility_staff_facilities" ADD CONSTRAINT "facility_staff_facilities_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."facility_staff_roles" ADD CONSTRAINT "facility_staff_roles_facility_staff_id_fkey" FOREIGN KEY ("facility_staff_id") REFERENCES "public"."facility_staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."facility_staff_roles" ADD CONSTRAINT "facility_staff_roles_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."supporter_profiles" ADD CONSTRAINT "supporter_profiles_supporter_id_fkey" FOREIGN KEY ("supporter_id") REFERENCES "public"."supporters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_addresses" ADD CONSTRAINT "user_addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."facility_profiles" ADD CONSTRAINT "facility_profiles_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."facility_locations" ADD CONSTRAINT "facility_locations_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."facility_contacts" ADD CONSTRAINT "facility_contacts_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."facility_services" ADD CONSTRAINT "facility_services_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."facility_conditions" ADD CONSTRAINT "facility_conditions_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."plans" ADD CONSTRAINT "plans_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."plans" ADD CONSTRAINT "plans_supporter_id_fkey" FOREIGN KEY ("supporter_id") REFERENCES "public"."supporters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."plans" ADD CONSTRAINT "plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."plan_versions" ADD CONSTRAINT "plan_versions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."plan_versions" ADD CONSTRAINT "plan_versions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."supporters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."plan_accessibility_requirements" ADD CONSTRAINT "plan_accessibility_requirements_plan_version_id_fkey" FOREIGN KEY ("plan_version_id") REFERENCES "public"."plan_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."plan_custom_fields" ADD CONSTRAINT "plan_custom_fields_plan_version_id_fkey" FOREIGN KEY ("plan_version_id") REFERENCES "public"."plan_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."slots" ADD CONSTRAINT "slots_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."slots" ADD CONSTRAINT "slots_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."facility_staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."slot_details" ADD CONSTRAINT "slot_details_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "public"."slots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."consents" ADD CONSTRAINT "consents_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."consent_grants" ADD CONSTRAINT "consent_grants_consent_id_fkey" FOREIGN KEY ("consent_id") REFERENCES "public"."consents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inquiries" ADD CONSTRAINT "inquiries_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inquiries" ADD CONSTRAINT "inquiries_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inquiry_messages" ADD CONSTRAINT "inquiry_messages_inquiry_id_fkey" FOREIGN KEY ("inquiry_id") REFERENCES "public"."inquiries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inquiry_replies" ADD CONSTRAINT "inquiry_replies_inquiry_id_fkey" FOREIGN KEY ("inquiry_id") REFERENCES "public"."inquiries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
