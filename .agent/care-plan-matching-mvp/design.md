# ケアプラン施設マッチングシステム MVP 設計書

## 1. システムアーキテクチャ

### 1.1 全体構成
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Client App    │     │   Client App    │     │   Client App    │
│   (Supporter)   │     │     (User)      │     │ (FacilityStaff) │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         └───────────────────────┴───────────────────────┘
                                 │
                         ┌───────┴────────┐
                         │   Next.js App  │
                         │ (Server Comp.  │
                         │+ Server Actions)│
                         └───────┬────────┘
                                 │
                         ┌───────┴────────┐
                         │    Supabase    │
                         │ (PostgreSQL +  │
                         │      RLS)      │
                         └────────────────┘
```

### 1.2 技術スタック
- **Runtime**: Bun
- **Package Manager**: Bun
- **Frontend**: React 19 + Next.js 15 (App Router) + TypeScript
- **UI Components**: shadcn/ui + Tailwind CSS v4
- **Backend**: Server Components + Server Actions
- **Database**: Supabase (PostgreSQL + Row Level Security)
- **Authentication**: Supabase Auth (Magic Link)
- **Deployment**: Vercel

## 2. データモデル設計

### 2.1 ER図
```
supporters ─┬─< supporter_profiles
            ├─< supporter_authentications
            └─────────────────────────> tenants
                         │
                         └───< plans ─────────────────> facilities ─┬─< facility_profiles
                                │                            │        ├─< facility_locations
                                │                            │        ├─< facility_contacts
                                │                            │        ├─< facility_services
                                │                            │        └─< facility_conditions
                                │                            │
users ─┬─< user_profiles        │                            │
       ├─< user_addresses ──────┘                            │
       └─< user_authentications                               │
                                                              │
facility_staff ─┬─< facility_staff_facilities >───────────────┘
                ├─< facility_staff_authentications
                └─< facility_staff_roles

plans ──────┬─< plan_versions ─┬─< plan_accessibility_requirements
            │                   └─< plan_custom_fields
            ├─< consents ─< consent_grants
            └─< inquiries ─┬─< inquiry_messages
                           └─< inquiry_replies

facilities ─< slots ─< slot_details

audits (独立テーブル)
```

### 2.2 テーブル定義

#### tenants
```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### supporters
```sql
CREATE TABLE supporters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_supporters_tenant_id ON supporters(tenant_id);
```

#### supporter_profiles
```sql
CREATE TABLE supporter_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supporter_id UUID NOT NULL REFERENCES supporters(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  name_kana VARCHAR(255),
  gender VARCHAR(10),
  birth_date DATE,
  phone VARCHAR(20),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX idx_supporter_profiles_supporter_id ON supporter_profiles(supporter_id);
```

#### supporter_authentications
```sql
CREATE TABLE supporter_authentications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supporter_id UUID NOT NULL REFERENCES supporters(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified_at TIMESTAMP,
  magic_link_token VARCHAR(255),
  magic_link_expires_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX idx_supporter_authentications_supporter_id ON supporter_authentications(supporter_id);
CREATE INDEX idx_supporter_authentications_email ON supporter_authentications(email);
CREATE INDEX idx_supporter_authentications_magic_link_token ON supporter_authentications(magic_link_token);
```

#### facility_staff
```sql
CREATE TABLE facility_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### facility_staff_authentications
```sql
CREATE TABLE facility_staff_authentications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_staff_id UUID NOT NULL REFERENCES facility_staff(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified_at TIMESTAMP,
  magic_link_token VARCHAR(255),
  magic_link_expires_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX idx_facility_staff_authentications_staff_id ON facility_staff_authentications(facility_staff_id);
CREATE INDEX idx_facility_staff_authentications_email ON facility_staff_authentications(email);
```

#### facility_staff_facilities
```sql
CREATE TABLE facility_staff_facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_staff_id UUID NOT NULL REFERENCES facility_staff(id) ON DELETE CASCADE,
  facility_id UUID NOT NULL REFERENCES facilities(id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_facility_staff_facilities_staff_id ON facility_staff_facilities(facility_staff_id);
CREATE INDEX idx_facility_staff_facilities_facility_id ON facility_staff_facilities(facility_id);
CREATE UNIQUE INDEX idx_facility_staff_facilities_unique ON facility_staff_facilities(facility_staff_id, facility_id);
```

#### facility_staff_roles
```sql
CREATE TABLE facility_staff_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_staff_id UUID NOT NULL REFERENCES facility_staff(id) ON DELETE CASCADE,
  facility_id UUID NOT NULL REFERENCES facilities(id),
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'staff', 'viewer')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_facility_staff_roles_staff_id ON facility_staff_roles(facility_staff_id);
CREATE INDEX idx_facility_staff_roles_facility_id ON facility_staff_roles(facility_id);
CREATE UNIQUE INDEX idx_facility_staff_roles_unique ON facility_staff_roles(facility_staff_id, facility_id, role);
```

#### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### user_profiles
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  name_kana VARCHAR(255),
  gender VARCHAR(10),
  birth_date DATE,
  phone VARCHAR(20),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
```

#### user_addresses
```sql
CREATE TABLE user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  postal_code VARCHAR(10),
  prefecture VARCHAR(10),
  city VARCHAR(100),
  street VARCHAR(255),
  building VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_user_addresses_user_id ON user_addresses(user_id);
```

#### user_authentications
```sql
CREATE TABLE user_authentications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified_at TIMESTAMP,
  magic_link_token VARCHAR(255),
  magic_link_expires_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX idx_user_authentications_user_id ON user_authentications(user_id);
CREATE INDEX idx_user_authentications_email ON user_authentications(email);
CREATE INDEX idx_user_authentications_magic_link_token ON user_authentications(magic_link_token);
```

#### plans
```sql
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  supporter_id UUID NOT NULL REFERENCES supporters(id),
  user_id UUID REFERENCES users(id),
  current_version_id UUID, -- plan_versionsへの参照（循環参照回避のため外部キー制約なし）
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_plans_tenant_id ON plans(tenant_id);
CREATE INDEX idx_plans_supporter_id ON plans(supporter_id);
CREATE INDEX idx_plans_user_id ON plans(user_id);
CREATE INDEX idx_plans_current_version_id ON plans(current_version_id);
```

#### plan_versions
```sql
CREATE TABLE plan_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  -- 厚労省様式の主要項目を正規化
  service_type VARCHAR(50) NOT NULL,
  frequency VARCHAR(100),
  area VARCHAR(255),
  start_date DATE,
  end_date DATE,
  notes TEXT,
  -- バージョン管理情報
  valid_from TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  valid_until TIMESTAMP,
  created_by UUID NOT NULL REFERENCES supporters(id),
  reason_for_update TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_plan_versions_plan_id ON plan_versions(plan_id);
CREATE INDEX idx_plan_versions_valid_from ON plan_versions(valid_from);
CREATE INDEX idx_plan_versions_valid_until ON plan_versions(valid_until);
CREATE UNIQUE INDEX idx_plan_versions_unique ON plan_versions(plan_id, version_number);
```

#### plan_accessibility_requirements
```sql
CREATE TABLE plan_accessibility_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_version_id UUID NOT NULL REFERENCES plan_versions(id) ON DELETE CASCADE,
  requirement_type VARCHAR(50) NOT NULL, -- 'wheelchair', 'hearing_aid', etc.
  details TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_plan_accessibility_version_id ON plan_accessibility_requirements(plan_version_id);
CREATE INDEX idx_plan_accessibility_type ON plan_accessibility_requirements(requirement_type);
```

#### plan_custom_fields
```sql
CREATE TABLE plan_custom_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_version_id UUID NOT NULL REFERENCES plan_versions(id) ON DELETE CASCADE,
  field_name VARCHAR(100) NOT NULL,
  field_value TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_plan_custom_fields_version_id ON plan_custom_fields(plan_version_id);
```

#### facilities
```sql
CREATE TABLE facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### facility_profiles
```sql
CREATE TABLE facility_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  name_kana VARCHAR(255),
  description TEXT,
  capacity INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX idx_facility_profiles_facility_id ON facility_profiles(facility_id);
```

#### facility_locations
```sql
CREATE TABLE facility_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  postal_code VARCHAR(10),
  prefecture VARCHAR(10),
  city VARCHAR(100),
  street VARCHAR(255),
  building VARCHAR(255),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX idx_facility_locations_facility_id ON facility_locations(facility_id);
CREATE INDEX idx_facility_locations_geo ON facility_locations(latitude, longitude);
```

#### facility_contacts
```sql
CREATE TABLE facility_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  contact_type VARCHAR(20) NOT NULL, -- 'main', 'emergency', 'inquiry'
  name VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_facility_contacts_facility_id ON facility_contacts(facility_id);
```

#### facility_services
```sql
CREATE TABLE facility_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  service_type VARCHAR(50) NOT NULL, -- '生活介護', '就労継続支援A型', etc.
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_facility_services_facility_id ON facility_services(facility_id);
CREATE INDEX idx_facility_services_service_type ON facility_services(service_type);
```

#### facility_conditions
```sql
CREATE TABLE facility_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  condition_type VARCHAR(50) NOT NULL, -- 'wheelchair_accessible', 'has_pickup', etc.
  condition_value VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_facility_conditions_facility_id ON facility_conditions(facility_id);
CREATE INDEX idx_facility_conditions_type ON facility_conditions(condition_type);
```

#### slots
```sql
CREATE TABLE slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id),
  status VARCHAR(20) NOT NULL CHECK (status IN ('open', 'limited', 'closed')),
  expires_at TIMESTAMP NOT NULL,
  updated_by UUID NOT NULL REFERENCES facility_staff(id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_slots_facility_id ON slots(facility_id);
CREATE INDEX idx_slots_expires_at ON slots(expires_at);
```

#### slot_details
```sql
CREATE TABLE slot_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id UUID NOT NULL REFERENCES slots(id) ON DELETE CASCADE,
  detail_type VARCHAR(50) NOT NULL, -- 'memo', 'age_limit', 'gender_limit', etc.
  detail_value TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_slot_details_slot_id ON slot_details(slot_id);
```

-- matchesテーブルは削除し、検索結果はキャッシュやセッション管理で対応
-- 必要に応じてElasticsearchやRedisなどの検索エンジンを使用

#### consents
```sql
CREATE TABLE consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES plans(id),
  user_contact VARCHAR(255) NOT NULL,
  scope VARCHAR(50) NOT NULL CHECK (scope IN ('search_inquiry')),
  token VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_consents_plan_id ON consents(plan_id);
CREATE INDEX idx_consents_token ON consents(token);
```

#### consent_grants
```sql
CREATE TABLE consent_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consent_id UUID NOT NULL REFERENCES consents(id) ON DELETE CASCADE,
  granted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  method VARCHAR(20) NOT NULL CHECK (method IN ('link')),
  ip_address INET NOT NULL,
  user_agent TEXT NOT NULL
);
CREATE UNIQUE INDEX idx_consent_grants_consent_id ON consent_grants(consent_id);
```

#### inquiries
```sql
CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES plans(id),
  facility_id UUID NOT NULL REFERENCES facilities(id),
  status VARCHAR(20) NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'replied', 'closed')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_inquiries_plan_id ON inquiries(plan_id);
CREATE INDEX idx_inquiries_facility_id ON inquiries(facility_id);
CREATE INDEX idx_inquiries_status ON inquiries(status);
```

#### inquiry_messages
```sql
CREATE TABLE inquiry_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id UUID NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('supporter', 'facility')),
  sender_id UUID NOT NULL, -- supporter_id or facility_staff_id
  message TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_inquiry_messages_inquiry_id ON inquiry_messages(inquiry_id);
```

#### inquiry_replies
```sql
CREATE TABLE inquiry_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id UUID NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  reply_status VARCHAR(20) NOT NULL CHECK (reply_status IN ('accept', 'decline')),
  replied_by UUID NOT NULL REFERENCES facility_staff(id),
  replied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX idx_inquiry_replies_inquiry_id ON inquiry_replies(inquiry_id);
```

#### audits
```sql
CREATE TABLE audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL, -- supporter_id or facility_staff_id
  actor_type VARCHAR(20) NOT NULL CHECK (actor_type IN ('supporter', 'facility_staff')),
  action VARCHAR(50) NOT NULL,
  target_table VARCHAR(50) NOT NULL,
  target_id UUID NOT NULL,
  ip_address INET NOT NULL,
  user_agent TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_audits_actor ON audits(actor_type, actor_id);
CREATE INDEX idx_audits_target ON audits(target_table, target_id);
CREATE INDEX idx_audits_created_at ON audits(created_at);
CREATE INDEX idx_audits_action ON audits(action);
```

## 3. Server Actions 設計

### 3.1 コロケーション配置方針

Server Actionsは各ページの近くに配置し、共通ロジックはuc/ディレクトリに集約します。

### 3.2 認証関連 Actions

#### app/(auth)/login/actions.ts
```typescript
'use server';

import { sendMagicLinkUseCase } from '@/uc/auth/send-magic-link';

export async function sendMagicLink(email: string) {
  return await sendMagicLinkUseCase(email);
}
```

#### uc/auth/send-magic-link.ts
```typescript
export async function sendMagicLinkUseCase(email: string) {
  // Magic Link をメール送信
  // セッションCookieを設定
  return { success: boolean; message: string; }
}
```

### 3.3 計画書管理 Actions

#### app/(dashboard)/plans/import/actions.ts
```typescript
'use server';

import { createPlanUseCase } from '@/uc/plans/create-plan';
import { getCurrentUser } from '@/uc/auth/get-current-user';

export async function createPlan(data: {
  userId?: string;
  fields: {
    serviceType: string;
    frequency: string;
    area: string;
    accessibility: string[];
    notes?: string;
  };
}) {
  const user = await getCurrentUser();
  return await createPlanUseCase(user, data);
}
```

### 3.4 検索関連 Actions

#### app/(dashboard)/search/results/actions.ts
```typescript
'use server';

import { searchFacilitiesUseCase } from '@/uc/search/search-facilities';
import { saveSearchResultsUseCase } from '@/uc/search/save-results';

export async function searchFacilities(params: {
  planId: string;
  filters?: {
    distance?: number;
    services?: string[];
    hasOpenSlots?: boolean;
  };
  sort?: 'distance' | 'availability' | 'score';
}) {
  return await searchFacilitiesUseCase(params);
}

export async function saveSearchResults(planId: string, facilityIds: string[]) {
  return await saveSearchResultsUseCase(planId, facilityIds);
}
```

### 3.5 空き状況管理 Actions

#### app/(dashboard)/facility/slots/actions.ts
```typescript
'use server';

import { updateSlotUseCase } from '@/uc/slots/update-slot';
import { getCurrentSlotUseCase } from '@/uc/slots/get-current-slot';

export async function updateSlot(facilityId: string, data: {
  status: 'open' | 'limited' | 'closed';
  expiresAt: Date;
  memo?: string;
}) {
  return await updateSlotUseCase(facilityId, data);
}

export async function getCurrentSlot(facilityId: string) {
  return await getCurrentSlotUseCase(facilityId);
}
```

### 3.6 同意管理 Actions

#### app/consent/[token]/actions.ts
```typescript
'use server';

import { grantConsentUseCase } from '@/uc/consents/grant-consent';
import { getConsentByTokenUseCase } from '@/uc/consents/get-consent';

export async function grantConsent(token: string) {
  return await grantConsentUseCase(token);
}

export async function getConsentByToken(token: string) {
  return await getConsentByTokenUseCase(token);
}
```

### 3.7 照会管理 Actions

#### app/(dashboard)/facility/inquiries/actions.ts
```typescript
'use server';

import { createInquiryUseCase } from '@/uc/inquiries/create-inquiry';
import { replyToInquiryUseCase } from '@/uc/inquiries/reply-inquiry';

export async function createInquiry(data: {
  planId: string;
  facilityId: string;
  message?: string;
}) {
  return await createInquiryUseCase(data);
}

export async function replyToInquiry(inquiryId: string, data: {
  replyStatus: 'accept' | 'decline';
  message?: string;
}) {
  return await replyToInquiryUseCase(inquiryId, data);
}
```

### 3.8 ケース管理 Actions

#### app/(dashboard)/cases/[id]/actions.ts
```typescript
'use server';

import { getCaseProgressUseCase } from '@/uc/cases/get-progress';
import { getCaseTimelineUseCase } from '@/uc/cases/get-timeline';

export async function getCaseProgress(planId: string) {
  return await getCaseProgressUseCase(planId);
}

export async function getCaseTimeline(planId: string) {
  return await getCaseTimelineUseCase(planId);
}
```

## 4. 画面設計

### 4.1 画面遷移図
```
/login ─────────┬─> /plans/import ──> /search/results ──> /cases/:id
                │                            │
                │                            └──> /consent/share
                │
                ├─> /facility/slots
                │
                ├─> /facility/inquiries
                │
                └─> /my/plans ──> /my/plans/:id

/consent/:token ──> /login (optional) ──> /my/plans
```

### 4.2 主要画面コンポーネント構成

#### app/(auth)/login/page.tsx
```typescript
// Server Component
export default function LoginPage() {
  return <LoginForm />;
}
```

#### app/(dashboard)/plans/import/page.tsx
```typescript
// Server Component
export default async function PlanImportPage() {
  const user = await getCurrentUser();

  return (
    <div>
      <PlanImportForm user={user} />
    </div>
  );
}
```

#### app/(dashboard)/search/results/page.tsx
```typescript
// Server Component
export default async function SearchResultsPage({
  searchParams
}: {
  searchParams: { planId: string }
}) {
  const results = await searchFacilities({
    planId: searchParams.planId,
    // filters...
  });

  return (
    <SearchResults
      initialResults={results}
      planId={searchParams.planId}
    />
  );
}
```

#### app/consent/[token]/page.tsx
```typescript
// Server Component
export default async function ConsentPage({
  params
}: {
  params: { token: string }
}) {
  const consent = await getConsentByToken(params.token);

  if (!consent) {
    notFound();
  }

  return (
    <ConsentForm consent={consent} />
  );
}
```

#### app/(dashboard)/my/plans/page.tsx
```typescript
// Server Component
export default async function MyPlansPage() {
  const user = await getCurrentUser();

  if (!user || user.type !== 'user') {
    redirect('/login');
  }

  const plans = await getUserPlans(user.id);

  return (
    <MyPlansList plans={plans} />
  );
}
```

#### app/(dashboard)/my/plans/[id]/page.tsx
```typescript
// Server Component
export default async function MyPlanDetailPage({
  params
}: {
  params: { id: string }
}) {
  const user = await getCurrentUser();

  if (!user || user.type !== 'user') {
    redirect('/login');
  }

  const plan = await getPlanById(params.id);

  if (!plan || plan.userId !== user.id) {
    notFound();
  }

  return (
    <PlanDetail plan={plan} readOnly={true} />
  );
}
```

## 5. セキュリティ設計

### 5.1 認証・認可
- Magic Link方式（JWTトークン使用）
- セッション管理: httpOnly Cookie
- 認証対象:
  - Supporter: 必須
  - FacilityStaff: 必須
  - User: オプション（マイページ利用時のみ）
- RBAC実装: ミドルウェアでユーザータイプとアクセス権をチェック

### 5.2 マルチテナント分離
- Row Level Security (RLS) の実装
- テナントIDによるデータフィルタリング
- クロステナントアクセスの防止
- Server Actions内での厳密なテナント確認

### 5.3 監査ログ
- 全ての更新操作を記録
- ユーザーID、IPアドレス、変更内容を保存
- 改ざん防止（追記のみ、更新・削除不可）

## 6. パフォーマンス設計

### 6.1 データベース最適化
- 適切なインデックス設定
- 地理検索用のPostGIS利用
- マテリアライズドビューの検討（将来）

### 6.2 キャッシュ戦略
- 施設情報の静的キャッシュ
- 検索結果の短期キャッシュ（5分）
- Vercel Edge Cacheの活用

### 6.3 レスポンス最適化
- ページネーション実装
- 遅延ローディング
- 画像最適化（Next.js Image）

## 7. エラーハンドリング

### 7.1 Server Actions エラーハンドリング
```typescript
export async function actionWithErrorHandling() {
  try {
    // 処理
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'UNAUTHORIZED', message: '認証エラー' };
    }
    return { error: 'INTERNAL_ERROR', message: 'システムエラー' };
  }
}
```

### 7.2 フロントエンドエラー処理
- グローバルエラーバウンダリー
- Server Actions エラーのトースト表示
- ネットワークエラーの再試行機能

## 8. 開発環境構成

### 8.1 ディレクトリ構造
```
care/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       ├── page.tsx
│   │       └── actions.ts
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── plans/
│   │   │   └── import/
│   │   │       ├── page.tsx
│   │   │       └── actions.ts
│   │   ├── search/
│   │   │   └── results/
│   │   │       ├── page.tsx
│   │   │       └── actions.ts
│   │   ├── cases/
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── actions.ts
│   │   ├── facility/
│   │   │   ├── slots/
│   │   │   │   ├── page.tsx
│   │   │   │   └── actions.ts
│   │   │   └── inquiries/
│   │   │       ├── page.tsx
│   │   │       └── actions.ts
│   │   └── my/
│   │       └── plans/
│   │           ├── page.tsx
│   │           ├── actions.ts
│   │           └── [id]/
│   │               ├── page.tsx
│   │               └── actions.ts
│   ├── consent/
│   │   └── [token]/
│   │       ├── page.tsx
│   │       └── actions.ts
│   └── globals.css
├── domain/            # ドメイン層
│   ├── models/
│   │   ├── tenant.ts
│   │   ├── user.ts
│   │   ├── plan.ts
│   │   ├── facility.ts
│   │   ├── slot.ts
│   │   ├── consent.ts
│   │   ├── inquiry.ts
│   │   └── audit.ts
│   ├── repositories/  # リポジトリインターフェース
│   │   ├── tenant-repository.ts
│   │   ├── user-repository.ts
│   │   ├── plan-repository.ts
│   │   ├── facility-repository.ts
│   │   ├── slot-repository.ts
│   │   ├── consent-repository.ts
│   │   ├── inquiry-repository.ts
│   │   └── audit-repository.ts
│   └── services/      # ドメインサービス
│       ├── plan-matching-service.ts
│       ├── slot-availability-service.ts
│       └── consent-verification-service.ts
├── uc/                # ユースケース層
│   ├── auth/
│   │   ├── send-magic-link.ts
│   │   ├── verify-magic-link.ts
│   │   └── get-current-user.ts
│   ├── plans/
│   │   ├── create-plan.ts
│   │   ├── get-plan.ts
│   │   └── update-plan.ts
│   ├── search/
│   │   ├── search-facilities.ts
│   │   └── save-results.ts
│   ├── slots/
│   │   ├── update-slot.ts
│   │   ├── get-current-slot.ts
│   │   └── get-slot-history.ts
│   ├── consents/
│   │   ├── create-consent-request.ts
│   │   ├── grant-consent.ts
│   │   └── get-consent.ts
│   ├── inquiries/
│   │   ├── create-inquiry.ts
│   │   ├── reply-inquiry.ts
│   │   └── get-inquiries.ts
│   └── cases/
│       ├── get-progress.ts
│       └── get-timeline.ts
├── infra/             # インフラストラクチャ層
│   ├── repositories/  # リポジトリ実装
│   │   ├── tenant-repository.ts
│   │   ├── user-repository.ts
│   │   ├── plan-repository.ts
│   │   ├── facility-repository.ts
│   │   ├── slot-repository.ts
│   │   ├── consent-repository.ts
│   │   ├── inquiry-repository.ts
│   │   └── audit-repository.ts
│   └── services/      # 外部サービス
│       ├── email-service.ts
│       └── geocoding-service.ts
├── components/
│   ├── ui/           # shadcn/ui components
│   └── features/     # Feature-specific components
│       ├── plans/
│       ├── search/
│       ├── consent/
│       └── facility/
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   └── utils.ts
├── prisma/
│   └── schema.prisma
├── public/
├── types/
│   ├── index.ts
│   └── database.ts
├── bunfig.toml
├── package.json
├── tsconfig.json
├── biome.json
└── bunfig.toml
```

### 8.2 環境変数
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Email
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASS=...

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 9. デプロイメント設計

### 9.1 本番環境構成
- **アプリケーション**: Vercel
- **データベース**: Supabase PostgreSQL
- **ファイルストレージ**: Vercel Blob Storage
- **メール送信**: Resend

### 9.2 CI/CD
- GitHub Actions
- 自動テスト実行
- Vercel Preview Deployments
- 本番デプロイ（mainブランチ）

## 10. Bun 固有の設定

### 10.1 package.json scripts
```json
{
  "scripts": {
    "dev": "bun run next dev",
    "build": "bun run next build",
    "start": "bun run next start",
    "lint": "bun run biome check .",
    "lint:fix": "bun run biome check --apply .",
    "format": "bun run biome format --write .",
    "typecheck": "bun run tsc --noEmit",
    "db:reset": "bun run supabase db reset",
    "db:migrate": "bun run supabase migration up",
    "db:diff": "bun run supabase db diff",
    "test": "bun test",
    "test:watch": "bun test --watch"
  }
}
```

### 10.2 biome.json
```json
{
  "$schema": "https://biomejs.dev/schemas/1.5.0/schema.json",
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "formatter": {
    "enabled": true,
    "formatWithErrors": false,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  }
}
```

### 10.3 bunfig.toml
```toml
[install]
# パッケージインストール時の設定
peer = true
dev = true
optional = true

[install.lockfile]
# lockファイルの扱い
save = true
print = "yarn"

[test]
# テスト実行時の設定
preload = ["./test/setup.ts"]
```

## 11. ドメインモデル設計

### 11.1 ドメインモデルの責務

ドメインモデルはビジネスルールをカプセル化し、以下の責務を持ちます：

- **Plan**: 計画書の作成、更新、状態遷移の管理
- **Slot**: 空き状況の更新、有効期限管理
- **Consent**: 同意の記録、証跡管理
- **Inquiry**: 照会の送信、返信管理

### 11.2 ユースケースとドメインモデルの連携

更新系のユースケースは以下のパターンで実装します：

1. 権限チェック
2. ドメインモデルの取得または生成
3. ドメインモデルのメソッド呼び出しによるビジネスロジック実行
4. リポジトリを通じた永続化
5. 必要に応じてドメインサービスの呼び出し

## 12. 拡張性考慮事項

### 12.1 将来的な機能拡張
- リアルタイム通知（WebSocket）
- ファイル管理機能の強化
- レポート・分析機能
- API公開（外部連携）

### 12.2 スケーラビリティ
- 水平スケーリング対応
- データベースレプリケーション
- CDN活用