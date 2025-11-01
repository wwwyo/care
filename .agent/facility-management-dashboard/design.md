# 施設管理画面 設計書

## 1. アーキテクチャ設計

### 1.1 レイヤー構成

```
App Layer (Server Components / Server Actions)
↓
UseCase Layer
↓
Domain Layer ← Repository Layer (Infra)
```

### 1.2 データフロー

#### 読み取り（CQRS Query）
```
Server Components → Query (infra/query/facility-*) → Prisma → Database
```

#### 書き込み（CQRS Command）
```
Server Actions → UseCase → Domain Models → Repository → Prisma → Database
```

### 1.3 新規コンポーネント

#### Domain層
- `domain/facility/model.ts` - 施設集約
- `domain/slot/model.ts` - 空き状況集約

#### UseCase層
- `uc/facility/update-profile/` - 施設情報更新
- `uc/slot/update-status/` - 空き状況更新
- `uc/inquiry/list/` - 照会一覧取得

#### Infra層
- `infra/repositories/facility-repository.ts` - 施設リポジトリ
- `infra/repositories/slot-repository.ts` - 空き状況リポジトリ
- `infra/query/facility-profile-query.ts` - 施設情報クエリ
- `infra/query/slot-status-query.ts` - 空き状況クエリ
- `infra/query/inquiry-list-query.ts` - 照会一覧クエリ

## 2. データベース設計

### 2.1 既存テーブルの活用

以下のテーブルは既に存在し、そのまま活用：

- `facilities` - 施設基本情報
- `facility_profiles` - 施設プロファイル
- `facility_locations` - 施設所在地
- `facility_contacts` - 施設連絡先
- `facility_services` - 施設提供サービス
- `facility_staff` - 施設スタッフ
- `facility_staff_facilities` - スタッフ・施設関連
- `slots` - 空き状況
- `slot_details` - 空き状況詳細
- `inquiries` - 照会
- `inquiry_messages` - 照会メッセージ

### 2.2 施設種別マスター（Enum型で管理）

```typescript
export const FACILITY_TYPES = [
  'life_care',           // 生活介護
  'employment_a',        // 就労継続支援A型
  'employment_b',        // 就労継続支援B型
  'employment_transition', // 就労移行支援
  'residential',         // 施設入所支援
  'short_stay',          // 短期入所（ショートステイ）
  'child_development',   // 児童発達支援
  'after_school',        // 放課後等デイサービス
  'other'               // その他
] as const
```

### 2.3 空き状況ステータス

```typescript
export const SLOT_STATUS = [
  'available',   // 🟢 空きあり
  'contact',     // 🟡 要相談
  'full'         // 🔴 空きなし
] as const
```

### 2.4 データの初期化

オープンデータからのインポート時に、以下のフィールドをマッピング：

```typescript
// CSVフィールド → データベースフィールド
NAME → facility_profiles.name
NAMEKANA → facility_profiles.name_kana
ADDRESS → facility_locations (パース処理)
TEL → facility_contacts (type: 'phone')
FAX → facility_contacts (type: 'fax')
経度/緯度 → facility_locations.longitude/latitude
```

## 3. 画面設計

### 3.1 ルーティング設計

```
/facility                    - ダッシュボード
/facility/edit              - 施設基本情報編集
/facility/slots             - 空き状況更新
/facility/inquiries         - 照会一覧
```

### 3.2 画面コンポーネント構成

#### 3.2.1 ダッシュボード (`app/facility/page.tsx`)

```typescript
// Server Component
export default async function FacilityDashboard() {
  // Query使用
  const facilityProfile = await getFacilityProfile(staffId)
  const currentSlot = await getCurrentSlotStatus(facilityId)
  const inquiriesCount = await getUnreadInquiriesCount(facilityId)
  
  return (
    <div>
      <FacilityProfileCard profile={facilityProfile} />
      <SlotStatusCard slot={currentSlot} />
      <InquiriesCard count={inquiriesCount} />
      <QuickActions />
    </div>
  )
}
```

#### 3.2.2 施設情報編集 (`app/facility/edit/page.tsx`)

```typescript
// Server Component + Server Actions
export default async function FacilityEdit() {
  const facilityProfile = await getFacilityProfile(staffId)
  
  return (
    <Form action={updateFacilityProfile}>
      <FacilityProfileForm initialData={facilityProfile} />
    </Form>
  )
}

// Server Action
async function updateFacilityProfile(formData: FormData) {
  // UseCase呼び出し
  const result = await updateFacilityProfileUseCase.execute({
    staffId: getAuthenticatedStaffId(),
    data: parseFormData(formData)
  })
  
  if (result.type === 'error') {
    // エラーハンドリング
  }
  
  redirect('/facility')
}
```

#### 3.2.3 空き状況更新 (`app/facility/slots/page.tsx`)

```typescript
// Server Component
export default async function SlotManagement() {
  const currentSlot = await getCurrentSlotStatus(facilityId)
  
  return (
    <div className="text-center p-8">
      <CurrentStatusDisplay status={currentSlot.status} />
      <StatusUpdateButtons />
      <CommentForm />
      <LastUpdatedInfo updatedAt={currentSlot.updatedAt} />
    </div>
  )
}
```

#### 3.2.4 照会一覧 (`app/facility/inquiries/page.tsx`)

```typescript
// Server Component
export default async function InquiriesList() {
  const inquiries = await getInquiriesList(facilityId)
  
  return (
    <div>
      <InquiriesHeader />
      <InquiriesTable inquiries={inquiries} />
    </div>
  )
}
```

### 3.3 共通UIコンポーネント

#### 3.3.1 施設情報カード (`components/facility/facility-profile-card.tsx`)

```typescript
interface FacilityProfileCardProps {
  profile: FacilityProfile
  editable?: boolean
}

export function FacilityProfileCard({ profile, editable }: FacilityProfileCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{profile.name}</CardTitle>
        <CardDescription>{profile.nameKana}</CardDescription>
      </CardHeader>
      <CardContent>
        <FacilityTypeDisplay type={profile.serviceType} />
        <AddressDisplay address={profile.location} />
        <ContactDisplay contacts={profile.contacts} />
        {editable && <EditButton />}
      </CardContent>
    </Card>
  )
}
```

#### 3.3.2 空き状況表示 (`components/slot/slot-status-display.tsx`)

```typescript
interface SlotStatusDisplayProps {
  status: SlotStatus
  size?: 'sm' | 'md' | 'lg'
}

export function SlotStatusDisplay({ status, size = 'md' }: SlotStatusDisplayProps) {
  const config = {
    available: { emoji: '🟢', text: '空きあり', color: 'text-green-600' },
    contact: { emoji: '🟡', text: '要相談', color: 'text-yellow-600' },
    full: { emoji: '🔴', text: '空きなし', color: 'text-red-600' }
  }[status]
  
  return (
    <div className={`flex items-center gap-2 ${config.color}`}>
      <span className={`text-${size === 'lg' ? '4xl' : '2xl'}`}>
        {config.emoji}
      </span>
      <span className={`text-${size === 'lg' ? '2xl' : 'lg'} font-bold`}>
        {config.text}
      </span>
    </div>
  )
}
```

#### 3.3.3 空き状況更新ボタン (`components/slot/status-update-buttons.tsx`)

```typescript
export function StatusUpdateButtons() {
  return (
    <div className="grid grid-cols-1 gap-4 mt-8">
      <UpdateStatusButton status="available" />
      <UpdateStatusButton status="contact" />
      <UpdateStatusButton status="full" />
    </div>
  )
}

function UpdateStatusButton({ status }: { status: SlotStatus }) {
  return (
    <form action={updateSlotStatus}>
      <input type="hidden" name="status" value={status} />
      <Button 
        type="submit"
        size="lg"
        className="w-full h-16 text-lg"
        variant={getButtonVariant(status)}
      >
        <SlotStatusDisplay status={status} size="sm" />
      </Button>
    </form>
  )
}
```

## 4. API設計

### 4.1 Server Actions

#### 4.1.1 施設情報更新

```typescript
// app/facility/edit/actions.ts
export async function updateFacilityProfile(formData: FormData) {
  const staffId = await getAuthenticatedStaffId()
  
  const updateData = {
    name: formData.get('name') as string,
    nameKana: formData.get('nameKana') as string,
    serviceType: formData.get('serviceType') as FacilityType,
    description: formData.get('description') as string,
    address: {
      prefecture: formData.get('prefecture') as string,
      city: formData.get('city') as string,
      street: formData.get('street') as string,
      building: formData.get('building') as string,
    },
    contacts: {
      phone: formData.get('phone') as string,
      fax: formData.get('fax') as string,
    }
  }
  
  const result = await updateFacilityProfileUseCase.execute({
    staffId,
    updateData
  })
  
  if (result.type === 'ValidationError') {
    return { error: result.message }
  }
  
  if (result.type === 'NotFound') {
    return { error: '施設が見つかりません' }
  }
  
  revalidatePath('/facility')
  redirect('/facility')
}
```

#### 4.1.2 空き状況更新

```typescript
// app/facility/slots/actions.ts
export async function updateSlotStatus(formData: FormData) {
  const staffId = await getAuthenticatedStaffId()
  const status = formData.get('status') as SlotStatus
  const comment = formData.get('comment') as string
  
  const result = await updateSlotStatusUseCase.execute({
    staffId,
    status,
    comment
  })
  
  if (result.type === 'ValidationError') {
    return { error: result.message }
  }
  
  revalidatePath('/facility')
  revalidatePath('/facility/slots')
  redirect('/facility')
}
```

### 4.2 エラーハンドリング

#### 4.2.1 UseCase層でのエラー型定義

```typescript
// uc/types/errors.ts
export type DomainError =
  | { type: 'NotFound'; message: string }
  | { type: 'ValidationError'; message: string }
  | { type: 'Unauthorized'; message: string }
  | { type: 'BusinessRuleViolation'; message: string }

export type UseCaseResult<T> = T | DomainError

export function isError(result: any): result is DomainError {
  return result && typeof result === 'object' && 'type' in result
}
```

#### 4.2.2 バリデーション

```typescript
// domain/facility/validation.ts
export function validateFacilityProfile(data: any): ValidationResult {
  const errors: string[] = []
  
  if (!data.name || data.name.trim().length === 0) {
    errors.push('施設名は必須です')
  }
  
  if (data.name && data.name.length > 255) {
    errors.push('施設名は255文字以内で入力してください')
  }
  
  if (data.description && data.description.length > 500) {
    errors.push('施設紹介は500文字以内で入力してください')
  }
  
  if (!FACILITY_TYPES.includes(data.serviceType)) {
    errors.push('有効な施設種別を選択してください')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}
```

### 4.3 認証・認可

#### 4.3.1 施設スタッフ認証

```typescript
// lib/auth/facility-staff.ts
export async function getAuthenticatedStaffId(): Promise<string> {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error('認証が必要です')
  }
  
  const facilityStaff = await prisma.facilityStaff.findUnique({
    where: { userId: session.user.id }
  })
  
  if (!facilityStaff) {
    throw new Error('施設スタッフとして登録されていません')
  }
  
  return facilityStaff.id
}
```

#### 4.3.2 施設アクセス権限チェック

```typescript
// lib/auth/facility-access.ts
export async function checkFacilityAccess(
  staffId: string, 
  facilityId: string
): Promise<boolean> {
  const assignment = await prisma.facilityStaffFacility.findUnique({
    where: {
      facilityStaffId_facilityId: {
        facilityStaffId: staffId,
        facilityId: facilityId
      }
    }
  })
  
  return !!assignment
}
```

## 5. ドメインモデル設計

### 5.1 施設集約 (`domain/facility/model.ts`)

```typescript
export class Facility {
  constructor(
    public readonly id: string,
    public profile: FacilityProfile,
    public location: FacilityLocation,
    public contacts: FacilityContact[],
    public services: FacilityService[]
  ) {}
  
  // ドメインロジック: プロファイル更新
  updateProfile(newProfile: Partial<FacilityProfile>): void {
    // バリデーション
    const validation = validateFacilityProfile({
      ...this.profile,
      ...newProfile
    })
    
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '))
    }
    
    this.profile = { ...this.profile, ...newProfile }
  }
  
  // ドメインロジック: サービス種別確認
  providesService(serviceType: FacilityType): boolean {
    return this.services.some(s => s.serviceType === serviceType)
  }
  
  // ファクトリメソッド
  static create(params: CreateFacilityParams): Facility {
    return new Facility(
      crypto.randomUUID(),
      params.profile,
      params.location,
      params.contacts || [],
      params.services || []
    )
  }
}
```

### 5.2 空き状況集約 (`domain/slot/model.ts`)

```typescript
export class Slot {
  constructor(
    public readonly id: string,
    public readonly facilityId: string,
    public status: SlotStatus,
    public comment?: string,
    public updatedBy?: string,
    public updatedAt?: Date,
    public expiresAt?: Date
  ) {}
  
  // ドメインロジック: ステータス更新
  updateStatus(
    newStatus: SlotStatus, 
    updatedBy: string, 
    comment?: string
  ): void {
    this.status = newStatus
    this.comment = comment
    this.updatedBy = updatedBy
    this.updatedAt = new Date()
    
    // 30日後に期限切れ
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  }
  
  // ドメインロジック: 期限切れチェック
  isExpired(): boolean {
    return this.expiresAt ? this.expiresAt < new Date() : false
  }
  
  // ファクトリメソッド
  static create(params: CreateSlotParams): Slot {
    return new Slot(
      crypto.randomUUID(),
      params.facilityId,
      params.status,
      params.comment
    )
  }
}
```

## 6. 実装優先順位

### Phase 1: 基盤実装
1. ドメインモデル（Facility, Slot）
2. リポジトリ実装
3. 基本的なQuery実装

### Phase 2: 画面実装
1. ダッシュボード（読み取り専用）
2. 空き状況更新（ワンクリック）
3. 施設情報表示

### Phase 3: 編集機能
1. 施設情報編集フォーム
2. バリデーション実装
3. エラーハンドリング

### Phase 4: 照会機能
1. 照会一覧表示
2. 新着通知バッジ
3. 照会詳細表示

## 7. テスト設計

### 7.1 ドメインモデルテスト

```typescript
// domain/facility/model.test.ts
describe('Facility', () => {
  test('プロファイル更新時のバリデーション', () => {
    const facility = Facility.create(validParams)
    
    expect(() => {
      facility.updateProfile({ name: '' })
    }).toThrow('施設名は必須です')
  })
})
```

### 7.2 UseCase統合テスト

```typescript
// uc/facility/update-profile/index.test.ts
describe('UpdateFacilityProfileUseCase', () => {
  test('正常な更新処理', async () => {
    const result = await useCase.execute({
      staffId: 'staff-1',
      updateData: validUpdateData
    })
    
    expect(result).toEqual({ success: true })
  })
})
```

## 8. パフォーマンス考慮事項

### 8.1 データベースインデックス

既存スキーマで適切なインデックスが設定済み：
- `facility_staff_facilities.facility_staff_id`
- `slots.facility_id`, `slots.status`
- `inquiries.facility_id`, `inquiries.status`

### 8.2 キャッシュ戦略

- 施設情報：Next.js Server Componentsの自動キャッシュ
- 空き状況：リアルタイム更新のため短時間キャッシュ
- 照会一覧：`revalidatePath`による選択的キャッシュ無効化

## 9. セキュリティ考慮事項

### 9.1 アクセス制御

- 施設スタッフは自分が所属する施設のみアクセス可能
- セッション検証による認証確認
- CSRF保護（Next.js標準）

### 9.2 データ検証

- Server Action入力値の厳密なバリデーション
- SQLインジェクション対策（Prisma ORM）
- XSS対策（React標準エスケープ）

## 10. 運用考慮事項

### 10.1 監査ログ

既存の`audits`テーブルを活用：
- 施設情報更新
- 空き状況変更
- スタッフアクセス記録

### 10.2 エラー監視

- Server Actionsでのエラーログ出力
- Vercelの自動エラー監視活用
- クライアントサイドエラーバウンダリ