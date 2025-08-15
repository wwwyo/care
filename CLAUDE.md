# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ミタスケア - 厚生労働省標準様式のサービス等利用計画書を基に、福祉施設の空き状況と連動した施設候補検索と同意取得をワンストップで実現するWebアプリケーション。

s
## Architecture

### Tech Stack
- **Runtime**: Bun
- **Package Manager**: Bun
- **Frontend**: React 19 + Next.js 15 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui
- **Backend**: Server Components + Server Actions
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: Magic Link authentication (email-based)
- **Deployment**: Vercel

### Directory Structure
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
│   │   └── facility/
│   │       ├── slots/
│   │       │   ├── page.tsx
│   │       │   └── actions.ts
│   │       └── inquiries/
│   │           ├── page.tsx
│   │           └── actions.ts
│   ├── consent/
│   │   └── [token]/
│   │       ├── page.tsx
│   │       └── actions.ts
│   └── globals.css
├── domain/            # ドメイン層
│   ├── models/
│   └── services/      # ドメインサービス
├── uc/                # ユースケース層
│   ├── auth/
│   ├── plans/
│   ├── search/
│   ├── slots/
│   ├── consents/
│   ├── inquiries/
│   └── cases/
├── infra/    # インフラストラクチャ層
│   ├── query/         # 読み取り専用クエリ（CQRS）
│   ├── repositories/  # リポジトリ実装
│   └── services/      # 外部サービス
├── components/
│   ├── ui/           # shadcn/ui components
│   └── features/     # Feature-specific components
├── lib/
├── prisma/
│   └── schema.prisma
├── types/
├── bunfig.toml
├── package.json
└── tsconfig.json
```

### Key Design Patterns

1. **Multi-tenant Architecture**: Each organization (tenant) has isolated data with Row Level Security
2. **Role-Based Access Control (RBAC)**: Three roles - Supporter, Client, FacilityAdmin
3. **Audit Logging**: All critical operations are logged in the audits table
4. **Real-time Updates**: Facility slot status changes reflect immediately in search results
5. **Server Actions Colocation**: Actions are placed near their pages, with shared logic in uc/ directory
6. **Domain-Driven Design**: Business logic encapsulated in domain models

### Server Actions Architecture

This project uses Server Actions instead of traditional API routes. Actions are colocated with their pages:

- **app/(auth)/login/actions.ts** - Authentication (sendMagicLink)
- **app/(dashboard)/plans/import/actions.ts** - Plan creation (createPlan)
- **app/(dashboard)/search/results/actions.ts** - Facility search (searchFacilities, saveSearchResults)
- **app/(dashboard)/facility/slots/actions.ts** - Slot management (updateSlot, getCurrentSlot)
- **app/consent/[token]/actions.ts** - Consent handling (grantConsent, getConsentByToken)
- **app/(dashboard)/facility/inquiries/actions.ts** - Inquiry management (createInquiry, replyToInquiry)
- **app/(dashboard)/cases/[id]/actions.ts** - Case tracking (getCaseProgress, getCaseTimeline)

### Database Schema (Normalized Design)

#### Core Tables
- **users** - Base user accounts
- **user_profiles** - User profile information
- **user_addresses** - User addresses
- **user_authentications** - Authentication data (email, magic link)
- **user_roles** - RBAC assignments

#### Business Tables
- **tenants** - Multi-tenant organizations
- **plans** - Care plans (厚労省標準様式)
- **plan_accessibility_requirements** - Accessibility needs
- **plan_custom_fields** - Additional plan fields
- **facilities** - Facility base records
- **facility_profiles** - Facility information
- **facility_locations** - Facility addresses with geo coordinates
- **facility_services** - Services offered (生活介護, 就労継続, etc.)
- **facility_conditions** - Conditions (送迎可否, バリアフリー, etc.)
- **slots** - Availability status
- **slot_details** - Additional slot information
- **consents** - Consent requests
- **consent_grants** - Consent approval records
- **inquiries** - Facility inquiries
- **inquiry_messages** - Inquiry conversations
- **inquiry_replies** - Inquiry responses
- **audits** - Audit trail (append-only)

### Search Matching Logic
1. Service type match (生活介護, 就労継続, etc.)
2. Geographic proximity (within 10km prioritized)
3. Accessibility requirements (送迎可否, バリアフリー, etc.)
4. Slot availability ranking (open > limited > closed > unknown)

## Important Considerations

### Compliance & Security
- All personal data must be minimally collected (only contact info for clients)
- Consent records must include timestamp, method, and IP address
- Implement proper data isolation between tenants
- Use HTTPS/TLS and database encryption

### UI/UX Requirements
- Mobile-first responsive design
- Consent sharing must be achievable within 2 clicks
- Visual slot status indicators: ○ (open), △ (limited), × (closed), gray (unknown/expired)
- Use Japanese language for all user-facing text

### Care Plan Standards
The system is based on 厚生労働省標準様式 (Ministry of Health, Labour and Welfare standard forms) for サービス等利用計画書 (Service Use Plans). Key fields include:
- サービス種別 (Service Type)
- 利用頻度 (Usage Frequency)
- 地域 (Area)
- 送迎可否 (Transportation Availability)
- バリアフリー対応 (Barrier-free Support)

### テスト駆動開発（TDD）で実装する

- 原則としてテスト駆動開発（TDD）で進める
- 期待される入出力に基づき、まずテストを作成する
- 実装コードは書かず、テストのみを用意する
- テストを実行し、失敗を確認する
- テストが正しいことを確認できた段階でコミットする
- その後、テストをパスさせる実装を進める
- 実装中はテストを変更せず、コードを修正し続ける
- すべてのテストが通過するまで繰り返す

## Code Guidelines

- **Export Guidelines**:
  - don't use index.ts for re-export
  - 関数型の原則に従う
  - ファイル,directory名はkebab-caseで命名する

### Form Components
- **shadcn/uiは使用するが、フォームに関してはNext.js 15の純粋な`Form`コンポーネントを使用する**
  - `import Form from 'next/form'` を使用
  - shadcn/uiのFormコンポーネントは使用しない
  - Server Actionsとの統合を最適化するため

### CQRSパターンの実装ルール

#### Query (読み取り専用)
- **infrastructure/query/** にPrismaで扱いやすい単位で取得関数を実装
- Server Componentsから直接呼び出し可能
- 複雑なJOINやフィルタリングを含む読み取り専用のクエリを配置
- 命名規則: `get*`, `list*` などの読み取りを示す動詞で開始

```typescript
// infrastructure/query/facility-query.ts
export async function getFacilitiesWithSlots(tenantId: string) {
  return prisma.facility.findMany({
    where: { tenantId },
    include: { slots: true, services: true }
  });
}
```

#### Repository (書き込み・集約単位)
- **infrastructure/repositories/** に集約単位の操作関数を実装
- 各関数は独立してexport（インターフェース定義なし）
- 命名規則: `get{Entity}`, `save{Entity}`, `delete{Entity}`
- 集約単位での出し入れを担当
- トランザクション境界を管理

```typescript
// infrastructure/repositories/facility-repository.ts
import { Facility } from '@/domain/models/facility';
import { prisma } from '@/lib/prisma';

export async function getFacility(id: string): Promise<Facility | null> {
  // 集約全体を取得
  const data = await prisma.facility.findUnique({
    where: { id },
    include: { services: true, conditions: true }
  });
  return data ? toDomainModel(data) : null;
}

export async function saveFacility(facility: Facility): Promise<void> {
  // 集約全体を保存（upsert）
  await prisma.facility.upsert({
    where: { id: facility.id },
    create: toDbModel(facility),
    update: toDbModel(facility)
  });
}

export async function deleteFacility(id: string): Promise<void> {
  // 集約全体を削除
  await prisma.facility.delete({ where: { id } });
}
```

#### 使い分けのガイドライン
- **Query**: 画面表示用のデータ取得、検索、一覧表示
- **Repository**: ビジネスロジックを伴う更新、集約の永続化、トランザクション管理

### レイヤー間の呼び出しルール

#### 呼び出しの流れ
1. **Server Actions** → **UseCase (uc/)** → **Domain** ← **Repository**
2. **Server Components** → **Query (infrastructure/query/)** （読み取り専用）

#### 厳格なルール
- **Domain層はUseCase層からのみ呼び出される**
  - Server ActionsやServer Componentsから直接Domain層を呼び出さない
  - ビジネスロジックはDomain層に集約し、UseCase経由でのみアクセス
- **Server ActionsはUseCase層を呼び出す**
  - ビジネスロジックの実行はすべてUseCase経由
  - トランザクション境界の管理もUseCase層で行う
- **Server Componentsは読み取り専用のQueryを直接呼び出し可能**
  - 表示用データの取得は効率性を重視してQuery層を直接利用

```typescript
// app/(dashboard)/facility/slots/actions.ts
import { updateSlotUseCase } from '@/uc/slots/update-slot';

export async function updateSlotAction(slotId: string, status: string) {
  // Server ActionはUseCaseを呼び出す
  return await updateSlotUseCase({ slotId, status });
}

// uc/slots/update-slot.ts
import { getSlot, saveSlot } from '@/infrastructure/repositories/slot-repository';
import { updateSlotStatus } from '@/domain/models/slot';

type SlotError =
  | { type: 'NotFound'; message: string }
  | { type: 'InvalidStatus'; message: string };

export async function updateSlotUseCase(
  { slotId, status }: { slotId: string; status: string }
): Promise<void | SlotError> {
  // UseCaseはDomain層を利用
  const slot = await getSlot(slotId);
  if (!slot) {
    return { type: 'NotFound', message: 'Slot not found' };
  }

  const updatedSlot = updateSlotStatus(slot, status); // ドメインロジック（純粋関数）
  if (isError(updatedSlot)) {
    return updatedSlot; // バリデーションエラー等
  }

  await saveSlot(updatedSlot);
  // 成功時はvoidを返す（または更新後のデータ）
}

// app/(dashboard)/facility/slots/page.tsx
import { getFacilitySlots } from '@/infrastructure/query/slot-query';

export default async function SlotsPage() {
  // Server ComponentはQuery層を直接呼び出し
  const slots = await getFacilitySlots();
  return <SlotList slots={slots} />;
}
```

### エラーハンドリング

#### UseCase層以降は例外をthrowしない
- **Union型によるエラー表現**を使用
- 成功時の値またはエラーオブジェクトを返す
- Domain層、UseCase層では例外を投げずにUnion型を返す

```typescript
// エラー型の定義
type DomainError =
  | { type: 'NotFound'; message: string }
  | { type: 'ValidationError'; message: string }
  | { type: 'ConflictError'; message: string };

// UseCaseでの使用例
export async function createPlanUseCase(
  input: CreatePlanInput
): Promise<Plan | DomainError> {
  // バリデーション
  const validation = validatePlanInput(input);
  if (isError(validation)) {
    return validation; // ValidationError
  }

  // ドメインロジック実行
  const plan = createPlan(input);

  // 永続化
  const saved = await savePlan(plan);
  if (isError(saved)) {
    return saved; // 永続化エラー
  }

  return plan; // 成功時はPlanを返す
}

// エラー判定のヘルパー関数
export function isError(value: unknown): value is DomainError {
  return typeof value === 'object' && value !== null && 'type' in value;
}

// Server Actionでのハンドリング
export async function createPlanAction(input: CreatePlanInput) {
  const result = await createPlanUseCase(input);

  if (isError(result)) {
    // Server Actionレベルでのエラー処理
    return { error: result.message };
  }

  return { data: result };
}
```

## Development Guidelines

- 環境変数はenv.tsでチェックしたのちに使うこと
- 後方互換性は不要