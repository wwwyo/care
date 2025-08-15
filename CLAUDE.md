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
│   ├── repositories/  # リポジトリインターフェース
│   └── services/      # ドメインサービス
├── uc/                # ユースケース層
│   ├── auth/
│   ├── plans/
│   ├── search/
│   ├── slots/
│   ├── consents/
│   ├── inquiries/
│   └── cases/
├── infrastructure/    # インフラストラクチャ層
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

### テスト駆動開発（TDD）で実装するs

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
  - re-export専門のファイルを作らない
  - 関数型の原則に従う
  - ファイル,directory名はkebab-caseで命名する

## Development Guidelines

- 環境変数はenv.tsでチェックしたのちに使うこと
```