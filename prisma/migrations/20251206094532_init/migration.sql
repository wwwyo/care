-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verifications" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT,
    "metadata" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "members" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitations" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "inviter_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" TEXT NOT NULL,
    "user_id" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "client_id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facilities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "facilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supporter_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "name_kana" VARCHAR(255),
    "gender" VARCHAR(10),
    "birth_date" DATE,
    "phone" VARCHAR(20),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supporter_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "client_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "name_kana" VARCHAR(255),
    "gender" VARCHAR(10),
    "birth_date" DATE,
    "phone" VARCHAR(20),
    "disability" VARCHAR(255),
    "care_level" VARCHAR(50),
    "notes" TEXT,
    "emergency_contact_name" VARCHAR(255),
    "emergency_contact_relation" VARCHAR(50),
    "emergency_contact_phone" VARCHAR(20),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_addresses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "client_id" UUID NOT NULL,
    "postal_code" VARCHAR(10),
    "prefecture" VARCHAR(10),
    "city" VARCHAR(100),
    "street" VARCHAR(255),
    "building" VARCHAR(255),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facility_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "facility_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "name_kana" VARCHAR(255),
    "description" TEXT,
    "capacity" INTEGER,
    "wam_id" VARCHAR(50),
    "official_id" VARCHAR(20),
    "corporation_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "facility_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facility_locations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "facility_id" UUID NOT NULL,
    "postal_code" VARCHAR(10),
    "address_city" VARCHAR(200),
    "address_detail" VARCHAR(500),
    "building" VARCHAR(255),
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "access_info" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "facility_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facility_contacts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "facility_id" UUID NOT NULL,
    "contact_type" VARCHAR(20) NOT NULL,
    "name" VARCHAR(255),
    "phone" VARCHAR(20),
    "fax" VARCHAR(20),
    "email" VARCHAR(255),
    "website" VARCHAR(255),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "facility_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facility_services" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "facility_id" UUID NOT NULL,
    "service_type" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "facility_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facility_conditions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "facility_id" UUID NOT NULL,
    "condition_type" VARCHAR(50) NOT NULL,
    "condition_value" VARCHAR(255),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "facility_conditions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facility_corporations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "name_kana" VARCHAR(255),
    "corporate_number" VARCHAR(13),
    "postal_code" VARCHAR(10),
    "address_city" VARCHAR(200),
    "address_detail" VARCHAR(500),
    "phone" VARCHAR(20),
    "fax" VARCHAR(20),
    "url" VARCHAR(255),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "facility_corporations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facility_business_hours" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "facility_id" UUID NOT NULL,
    "weekday_hours" TEXT,
    "saturday_hours" TEXT,
    "sunday_hours" TEXT,
    "holiday_hours" TEXT,
    "regular_holidays" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "facility_business_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plans" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" TEXT NOT NULL,
    "client_id" UUID NOT NULL,
    "current_version_id" UUID,
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_versions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "plan_id" UUID NOT NULL,
    "version_number" INTEGER NOT NULL,
    "version_type" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "desired_life" TEXT,
    "troubles" TEXT,
    "considerations" TEXT,
    "form_category" VARCHAR(20),
    "form_revision_month" DATE,
    "municipality_name" VARCHAR(100),
    "plan_created_on" DATE,
    "monitoring_start_month" DATE,
    "monitoring_end_month" DATE,
    "monitoring_frequency" VARCHAR(40),
    "monitoring_frequency_other" VARCHAR(255),
    "consent_signer_name" VARCHAR(255),
    "consent_signed_on" DATE,
    "consent_notes" TEXT,
    "client_name_snapshot" VARCHAR(255),
    "client_name_kana_snapshot" VARCHAR(255),
    "client_postal_code_snapshot" VARCHAR(10),
    "client_address_snapshot" TEXT,
    "recipient_certificate_number" VARCHAR(50),
    "regional_certificate_number" VARCHAR(50),
    "disability_classification" VARCHAR(50),
    "disability_support_level" VARCHAR(50),
    "user_burden_limit" VARCHAR(100),
    "support_office_name" VARCHAR(255),
    "plan_creator_name" VARCHAR(255),
    "plan_creator_title" VARCHAR(100),
    "plan_creator_phone" VARCHAR(20),
    "user_intentions" TEXT,
    "overall_support_policy" TEXT,
    "long_term_goal" TEXT,
    "short_term_goal" TEXT,
    "envisioned_life_with_services" TEXT,
    "non_weekly_service_notes" TEXT,
    "medical_care_notes" TEXT,
    "medical_institution" VARCHAR(255),
    "medical_visit_frequency" VARCHAR(255),
    "medical_travel_time" VARCHAR(100),
    "valid_from" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valid_until" TIMESTAMPTZ,
    "created_by" TEXT NOT NULL,
    "reason_for_update" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plan_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_accessibility_requirements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "plan_version_id" UUID NOT NULL,
    "requirement_type" VARCHAR(50) NOT NULL,
    "details" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plan_accessibility_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_custom_fields" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "plan_version_id" UUID NOT NULL,
    "field_name" VARCHAR(100) NOT NULL,
    "field_value" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plan_custom_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_prioritized_supports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "plan_version_id" UUID NOT NULL,
    "priority_order" INTEGER NOT NULL,
    "need_description" TEXT,
    "support_goal" TEXT,
    "achievement_timing" VARCHAR(100),
    "welfare_service_name" VARCHAR(255),
    "service_detail" TEXT,
    "provider_name" VARCHAR(255),
    "provider_contact" VARCHAR(255),
    "user_role" TEXT,
    "evaluation_timing" VARCHAR(100),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plan_prioritized_supports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_weekly_schedule_cells" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "plan_version_id" UUID NOT NULL,
    "time_slot" VARCHAR(20) NOT NULL,
    "column_type" VARCHAR(40) NOT NULL,
    "content" TEXT,
    "provider_name" VARCHAR(255),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plan_weekly_schedule_cells_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_services" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "plan_version_id" UUID NOT NULL,
    "service_category" VARCHAR(50) NOT NULL,
    "service_type" VARCHAR(100) NOT NULL,
    "desired_amount" VARCHAR(255),
    "desired_life_by_service" TEXT,
    "achievement_period" VARCHAR(100),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plan_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hearing_transcripts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "hearing_memo_id" UUID NOT NULL,
    "transcript_type" VARCHAR(20) NOT NULL,
    "content" TEXT NOT NULL,
    "timestamp" DECIMAL(13,3) NOT NULL,
    "end_timestamp" DECIMAL(13,3),
    "speaker" VARCHAR(50),
    "confidence" DECIMAL(3,2),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hearing_transcripts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hearing_memos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "client_id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hearing_memos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hearing_audios" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "hearing_memo_id" UUID NOT NULL,
    "audio_file_url" TEXT NOT NULL,
    "duration" INTEGER,
    "status" VARCHAR(20) NOT NULL DEFAULT 'completed',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hearing_audios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supporter_availability_notes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "facility_id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "plan_id" UUID,
    "client_id" UUID,
    "status" VARCHAR(20) NOT NULL,
    "intent" VARCHAR(30),
    "note" TEXT,
    "context_summary" VARCHAR(200),
    "context_details" JSONB NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supporter_availability_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consents" (
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
CREATE TABLE "consent_grants" (
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
CREATE TABLE "inquiries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "plan_id" UUID NOT NULL,
    "facility_id" UUID NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'open',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inquiry_messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "inquiry_id" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "sender_type" VARCHAR(20) NOT NULL,
    "sender_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inquiry_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inquiry_replies" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "inquiry_id" UUID NOT NULL,
    "reply_type" VARCHAR(20) NOT NULL,
    "reply_data" JSON NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inquiry_replies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audits" (
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
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE INDEX "clients_organization_id_idx" ON "clients"("organization_id");

-- CreateIndex
CREATE INDEX "clients_user_id_idx" ON "clients"("user_id");

-- CreateIndex
CREATE INDEX "client_users_client_id_idx" ON "client_users"("client_id");

-- CreateIndex
CREATE INDEX "client_users_user_id_idx" ON "client_users"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "client_users_client_id_user_id_key" ON "client_users"("client_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "supporter_profiles_user_id_key" ON "supporter_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "client_profiles_client_id_key" ON "client_profiles"("client_id");

-- CreateIndex
CREATE INDEX "client_addresses_client_id_idx" ON "client_addresses"("client_id");

-- CreateIndex
CREATE UNIQUE INDEX "facility_profiles_facility_id_key" ON "facility_profiles"("facility_id");

-- CreateIndex
CREATE INDEX "facility_profiles_wam_id_idx" ON "facility_profiles"("wam_id");

-- CreateIndex
CREATE INDEX "facility_profiles_official_id_idx" ON "facility_profiles"("official_id");

-- CreateIndex
CREATE INDEX "facility_profiles_corporation_id_idx" ON "facility_profiles"("corporation_id");

-- CreateIndex
CREATE UNIQUE INDEX "facility_locations_facility_id_key" ON "facility_locations"("facility_id");

-- CreateIndex
CREATE INDEX "facility_locations_latitude_longitude_idx" ON "facility_locations"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "facility_contacts_facility_id_idx" ON "facility_contacts"("facility_id");

-- CreateIndex
CREATE INDEX "facility_services_facility_id_idx" ON "facility_services"("facility_id");

-- CreateIndex
CREATE INDEX "facility_services_service_type_idx" ON "facility_services"("service_type");

-- CreateIndex
CREATE INDEX "facility_conditions_facility_id_idx" ON "facility_conditions"("facility_id");

-- CreateIndex
CREATE INDEX "facility_conditions_condition_type_idx" ON "facility_conditions"("condition_type");

-- CreateIndex
CREATE UNIQUE INDEX "facility_corporations_corporate_number_key" ON "facility_corporations"("corporate_number");

-- CreateIndex
CREATE INDEX "facility_corporations_corporate_number_idx" ON "facility_corporations"("corporate_number");

-- CreateIndex
CREATE UNIQUE INDEX "facility_business_hours_facility_id_key" ON "facility_business_hours"("facility_id");

-- CreateIndex
CREATE INDEX "plans_organization_id_idx" ON "plans"("organization_id");

-- CreateIndex
CREATE INDEX "plans_current_version_id_idx" ON "plans"("current_version_id");

-- CreateIndex
CREATE UNIQUE INDEX "plans_client_id_key" ON "plans"("client_id");

-- CreateIndex
CREATE INDEX "plan_versions_plan_id_idx" ON "plan_versions"("plan_id");

-- CreateIndex
CREATE INDEX "plan_versions_version_type_idx" ON "plan_versions"("version_type");

-- CreateIndex
CREATE INDEX "plan_versions_valid_from_idx" ON "plan_versions"("valid_from");

-- CreateIndex
CREATE INDEX "plan_versions_valid_until_idx" ON "plan_versions"("valid_until");

-- CreateIndex
CREATE UNIQUE INDEX "plan_versions_plan_id_version_number_key" ON "plan_versions"("plan_id", "version_number");

-- CreateIndex
CREATE INDEX "plan_accessibility_requirements_plan_version_id_idx" ON "plan_accessibility_requirements"("plan_version_id");

-- CreateIndex
CREATE INDEX "plan_accessibility_requirements_requirement_type_idx" ON "plan_accessibility_requirements"("requirement_type");

-- CreateIndex
CREATE INDEX "plan_custom_fields_plan_version_id_idx" ON "plan_custom_fields"("plan_version_id");

-- CreateIndex
CREATE INDEX "plan_prioritized_supports_plan_version_id_idx" ON "plan_prioritized_supports"("plan_version_id");

-- CreateIndex
CREATE UNIQUE INDEX "plan_prioritized_supports_plan_version_id_priority_order_key" ON "plan_prioritized_supports"("plan_version_id", "priority_order");

-- CreateIndex
CREATE INDEX "plan_weekly_schedule_cells_plan_version_id_idx" ON "plan_weekly_schedule_cells"("plan_version_id");

-- CreateIndex
CREATE INDEX "plan_weekly_schedule_cells_plan_version_id_column_type_idx" ON "plan_weekly_schedule_cells"("plan_version_id", "column_type");

-- CreateIndex
CREATE INDEX "plan_services_plan_version_id_idx" ON "plan_services"("plan_version_id");

-- CreateIndex
CREATE INDEX "plan_services_service_category_idx" ON "plan_services"("service_category");

-- CreateIndex
CREATE INDEX "plan_services_service_type_idx" ON "plan_services"("service_type");

-- CreateIndex
CREATE INDEX "hearing_transcripts_hearing_memo_id_idx" ON "hearing_transcripts"("hearing_memo_id");

-- CreateIndex
CREATE INDEX "hearing_transcripts_timestamp_idx" ON "hearing_transcripts"("timestamp");

-- CreateIndex
CREATE INDEX "hearing_memos_client_id_idx" ON "hearing_memos"("client_id");

-- CreateIndex
CREATE INDEX "hearing_memos_user_id_idx" ON "hearing_memos"("user_id");

-- CreateIndex
CREATE INDEX "hearing_memos_date_idx" ON "hearing_memos"("date");

-- CreateIndex
CREATE INDEX "hearing_audios_hearing_memo_id_idx" ON "hearing_audios"("hearing_memo_id");

-- CreateIndex
CREATE INDEX "supporter_availability_notes_facility_id_user_id_idx" ON "supporter_availability_notes"("facility_id", "user_id");

-- CreateIndex
CREATE INDEX "supporter_availability_notes_plan_id_idx" ON "supporter_availability_notes"("plan_id");

-- CreateIndex
CREATE INDEX "supporter_availability_notes_client_id_idx" ON "supporter_availability_notes"("client_id");

-- CreateIndex
CREATE UNIQUE INDEX "consents_token_key" ON "consents"("token");

-- CreateIndex
CREATE INDEX "consents_plan_id_idx" ON "consents"("plan_id");

-- CreateIndex
CREATE INDEX "consents_token_idx" ON "consents"("token");

-- CreateIndex
CREATE INDEX "consents_status_idx" ON "consents"("status");

-- CreateIndex
CREATE INDEX "consent_grants_consent_id_idx" ON "consent_grants"("consent_id");

-- CreateIndex
CREATE INDEX "inquiries_plan_id_idx" ON "inquiries"("plan_id");

-- CreateIndex
CREATE INDEX "inquiries_facility_id_idx" ON "inquiries"("facility_id");

-- CreateIndex
CREATE INDEX "inquiries_status_idx" ON "inquiries"("status");

-- CreateIndex
CREATE INDEX "inquiry_messages_inquiry_id_idx" ON "inquiry_messages"("inquiry_id");

-- CreateIndex
CREATE INDEX "inquiry_messages_sender_id_idx" ON "inquiry_messages"("sender_id");

-- CreateIndex
CREATE INDEX "inquiry_replies_inquiry_id_idx" ON "inquiry_replies"("inquiry_id");

-- CreateIndex
CREATE INDEX "audits_table_name_record_id_idx" ON "audits"("table_name", "record_id");

-- CreateIndex
CREATE INDEX "audits_actor_id_idx" ON "audits"("actor_id");

-- CreateIndex
CREATE INDEX "audits_created_at_idx" ON "audits"("created_at");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_users" ADD CONSTRAINT "client_users_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_users" ADD CONSTRAINT "client_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supporter_profiles" ADD CONSTRAINT "supporter_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_profiles" ADD CONSTRAINT "client_profiles_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_addresses" ADD CONSTRAINT "client_addresses_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facility_profiles" ADD CONSTRAINT "facility_profiles_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facility_profiles" ADD CONSTRAINT "facility_profiles_corporation_id_fkey" FOREIGN KEY ("corporation_id") REFERENCES "facility_corporations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facility_locations" ADD CONSTRAINT "facility_locations_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facility_contacts" ADD CONSTRAINT "facility_contacts_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facility_services" ADD CONSTRAINT "facility_services_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facility_conditions" ADD CONSTRAINT "facility_conditions_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facility_business_hours" ADD CONSTRAINT "facility_business_hours_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plans" ADD CONSTRAINT "plans_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plans" ADD CONSTRAINT "plans_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_versions" ADD CONSTRAINT "plan_versions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_versions" ADD CONSTRAINT "plan_versions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_accessibility_requirements" ADD CONSTRAINT "plan_accessibility_requirements_plan_version_id_fkey" FOREIGN KEY ("plan_version_id") REFERENCES "plan_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_custom_fields" ADD CONSTRAINT "plan_custom_fields_plan_version_id_fkey" FOREIGN KEY ("plan_version_id") REFERENCES "plan_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_prioritized_supports" ADD CONSTRAINT "plan_prioritized_supports_plan_version_id_fkey" FOREIGN KEY ("plan_version_id") REFERENCES "plan_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_weekly_schedule_cells" ADD CONSTRAINT "plan_weekly_schedule_cells_plan_version_id_fkey" FOREIGN KEY ("plan_version_id") REFERENCES "plan_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_services" ADD CONSTRAINT "plan_services_plan_version_id_fkey" FOREIGN KEY ("plan_version_id") REFERENCES "plan_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hearing_transcripts" ADD CONSTRAINT "hearing_transcripts_hearing_memo_id_fkey" FOREIGN KEY ("hearing_memo_id") REFERENCES "hearing_memos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hearing_memos" ADD CONSTRAINT "hearing_memos_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hearing_memos" ADD CONSTRAINT "hearing_memos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hearing_audios" ADD CONSTRAINT "hearing_audios_hearing_memo_id_fkey" FOREIGN KEY ("hearing_memo_id") REFERENCES "hearing_memos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supporter_availability_notes" ADD CONSTRAINT "supporter_availability_notes_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supporter_availability_notes" ADD CONSTRAINT "supporter_availability_notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supporter_availability_notes" ADD CONSTRAINT "supporter_availability_notes_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supporter_availability_notes" ADD CONSTRAINT "supporter_availability_notes_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consents" ADD CONSTRAINT "consents_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consent_grants" ADD CONSTRAINT "consent_grants_consent_id_fkey" FOREIGN KEY ("consent_id") REFERENCES "consents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiry_messages" ADD CONSTRAINT "inquiry_messages_inquiry_id_fkey" FOREIGN KEY ("inquiry_id") REFERENCES "inquiries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiry_replies" ADD CONSTRAINT "inquiry_replies_inquiry_id_fkey" FOREIGN KEY ("inquiry_id") REFERENCES "inquiries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
