import { z } from 'zod'
import type { ServiceCategoryValue } from './service-category'
import { SERVICE_CATEGORIES } from './service-category'

/**
 * サービス種別の定義
 */
export const SERVICE_TYPES = {
  // 訪問系サービス
  HOME_CARE: 'HOME_CARE',
  VISITING_CARE_SEVERE: 'VISITING_CARE_SEVERE',
  ACCOMPANIMENT: 'ACCOMPANIMENT',
  BEHAVIOR_SUPPORT: 'BEHAVIOR_SUPPORT',
  COMPREHENSIVE_SUPPORT_SEVERE: 'COMPREHENSIVE_SUPPORT_SEVERE',

  // 日中活動系サービス
  MEDICAL_CARE: 'MEDICAL_CARE',
  DAILY_LIFE_SUPPORT: 'DAILY_LIFE_SUPPORT',
  SHORT_STAY: 'SHORT_STAY',

  // 施設系サービス
  FACILITY_ADMISSION: 'FACILITY_ADMISSION',

  // 居住系サービス
  GROUP_HOME: 'GROUP_HOME',
  INDEPENDENT_LIFE_SUPPORT: 'INDEPENDENT_LIFE_SUPPORT',

  // 訓練系・就労系サービス
  FUNCTIONAL_TRAINING: 'FUNCTIONAL_TRAINING',
  LIFE_TRAINING: 'LIFE_TRAINING',
  RESIDENTIAL_TRAINING: 'RESIDENTIAL_TRAINING',
  EMPLOYMENT_TRANSITION: 'EMPLOYMENT_TRANSITION',
  EMPLOYMENT_SUPPORT_A: 'EMPLOYMENT_SUPPORT_A',
  EMPLOYMENT_SUPPORT_B: 'EMPLOYMENT_SUPPORT_B',
  EMPLOYMENT_RETENTION: 'EMPLOYMENT_RETENTION',

  // 相談系サービス
  COMMUNITY_TRANSITION_SUPPORT: 'COMMUNITY_TRANSITION_SUPPORT',
  COMMUNITY_SETTLEMENT_SUPPORT: 'COMMUNITY_SETTLEMENT_SUPPORT',
  PLAN_CONSULTATION_SUPPORT: 'PLAN_CONSULTATION_SUPPORT',
  DISABLED_CHILD_CONSULTATION_SUPPORT: 'DISABLED_CHILD_CONSULTATION_SUPPORT',
} as const

export type ServiceTypeValue = (typeof SERVICE_TYPES)[keyof typeof SERVICE_TYPES]

const serviceTypeSchema = z.enum([
  'HOME_CARE',
  'VISITING_CARE_SEVERE',
  'ACCOMPANIMENT',
  'BEHAVIOR_SUPPORT',
  'COMPREHENSIVE_SUPPORT_SEVERE',
  'MEDICAL_CARE',
  'DAILY_LIFE_SUPPORT',
  'SHORT_STAY',
  'FACILITY_ADMISSION',
  'GROUP_HOME',
  'INDEPENDENT_LIFE_SUPPORT',
  'FUNCTIONAL_TRAINING',
  'LIFE_TRAINING',
  'RESIDENTIAL_TRAINING',
  'EMPLOYMENT_TRANSITION',
  'EMPLOYMENT_SUPPORT_A',
  'EMPLOYMENT_SUPPORT_B',
  'EMPLOYMENT_RETENTION',
  'COMMUNITY_TRANSITION_SUPPORT',
  'COMMUNITY_SETTLEMENT_SUPPORT',
  'PLAN_CONSULTATION_SUPPORT',
  'DISABLED_CHILD_CONSULTATION_SUPPORT',
])

/**
 * サービス種別とカテゴリのマッピング
 */
const SERVICE_TYPE_TO_CATEGORY: Record<ServiceTypeValue, ServiceCategoryValue> = {
  HOME_CARE: SERVICE_CATEGORIES.VISITING,
  VISITING_CARE_SEVERE: SERVICE_CATEGORIES.VISITING,
  ACCOMPANIMENT: SERVICE_CATEGORIES.VISITING,
  BEHAVIOR_SUPPORT: SERVICE_CATEGORIES.VISITING,
  COMPREHENSIVE_SUPPORT_SEVERE: SERVICE_CATEGORIES.VISITING,

  MEDICAL_CARE: SERVICE_CATEGORIES.DAY_ACTIVITY,
  DAILY_LIFE_SUPPORT: SERVICE_CATEGORIES.DAY_ACTIVITY,
  SHORT_STAY: SERVICE_CATEGORIES.DAY_ACTIVITY,

  FACILITY_ADMISSION: SERVICE_CATEGORIES.RESIDENTIAL,

  GROUP_HOME: SERVICE_CATEGORIES.HOUSING,
  INDEPENDENT_LIFE_SUPPORT: SERVICE_CATEGORIES.HOUSING,

  FUNCTIONAL_TRAINING: SERVICE_CATEGORIES.TRAINING_WORK,
  LIFE_TRAINING: SERVICE_CATEGORIES.TRAINING_WORK,
  RESIDENTIAL_TRAINING: SERVICE_CATEGORIES.TRAINING_WORK,
  EMPLOYMENT_TRANSITION: SERVICE_CATEGORIES.TRAINING_WORK,
  EMPLOYMENT_SUPPORT_A: SERVICE_CATEGORIES.TRAINING_WORK,
  EMPLOYMENT_SUPPORT_B: SERVICE_CATEGORIES.TRAINING_WORK,
  EMPLOYMENT_RETENTION: SERVICE_CATEGORIES.TRAINING_WORK,

  COMMUNITY_TRANSITION_SUPPORT: SERVICE_CATEGORIES.CONSULTATION,
  COMMUNITY_SETTLEMENT_SUPPORT: SERVICE_CATEGORIES.CONSULTATION,
  PLAN_CONSULTATION_SUPPORT: SERVICE_CATEGORIES.CONSULTATION,
  DISABLED_CHILD_CONSULTATION_SUPPORT: SERVICE_CATEGORIES.CONSULTATION,
}

/**
 * サービス種別の日本語名マッピング
 */
const SERVICE_TYPE_DISPLAY_NAMES: Record<ServiceTypeValue, string> = {
  HOME_CARE: '居宅介護',
  VISITING_CARE_SEVERE: '重度訪問介護',
  ACCOMPANIMENT: '同行援護',
  BEHAVIOR_SUPPORT: '行動援護',
  COMPREHENSIVE_SUPPORT_SEVERE: '重度障害者等包括支援',

  MEDICAL_CARE: '療養介護',
  DAILY_LIFE_SUPPORT: '生活介護',
  SHORT_STAY: '短期入所',

  FACILITY_ADMISSION: '施設入所支援',

  GROUP_HOME: '共同生活援助',
  INDEPENDENT_LIFE_SUPPORT: '自立生活援助',

  FUNCTIONAL_TRAINING: '自立訓練(機能訓練)',
  LIFE_TRAINING: '自立訓練(生活訓練)',
  RESIDENTIAL_TRAINING: '宿泊型自立訓練',
  EMPLOYMENT_TRANSITION: '就労移行支援',
  EMPLOYMENT_SUPPORT_A: '就労継続支援A型',
  EMPLOYMENT_SUPPORT_B: '就労継続支援B型',
  EMPLOYMENT_RETENTION: '就労定着支援',

  COMMUNITY_TRANSITION_SUPPORT: '地域相談支援(地域移行支援)',
  COMMUNITY_SETTLEMENT_SUPPORT: '地域相談支援(地域定着支援)',
  PLAN_CONSULTATION_SUPPORT: '計画相談支援',
  DISABLED_CHILD_CONSULTATION_SUPPORT: '障害児相談支援',
}

/**
 * 日本語表示名からサービス種別コードを解決
 */
export function resolveServiceTypeValue(displayName: string | null | undefined): ServiceTypeValue | null {
  if (!displayName) return null
  const match = Object.entries(SERVICE_TYPE_DISPLAY_NAMES).find(([, name]) => name === displayName)
  if (!match) return null
  return match[0] as ServiceTypeValue
}

/**
 * サービス種別のValue Object
 */
export class ServiceType {
  private constructor(private readonly value: ServiceTypeValue) {}

  static create(value: string | null | undefined): ServiceType | null {
    if (!value) return null

    const result = serviceTypeSchema.safeParse(value)
    if (!result.success) return null

    return new ServiceType(result.data)
  }

  getValue(): ServiceTypeValue {
    return this.value
  }

  getDisplayName(): string {
    return SERVICE_TYPE_DISPLAY_NAMES[this.value]
  }

  getCategory(): ServiceCategoryValue {
    return SERVICE_TYPE_TO_CATEGORY[this.value]
  }

  toString(): string {
    return this.value
  }

  equals(other: ServiceType | null): boolean {
    if (!other) return false
    return this.value === other.value
  }

  // ビジネスロジック: カテゴリ判定
  isVisitingService(): boolean {
    return this.getCategory() === SERVICE_CATEGORIES.VISITING
  }

  isDayActivityService(): boolean {
    return this.getCategory() === SERVICE_CATEGORIES.DAY_ACTIVITY
  }

  isResidentialService(): boolean {
    return this.getCategory() === SERVICE_CATEGORIES.RESIDENTIAL
  }

  isHousingService(): boolean {
    return this.getCategory() === SERVICE_CATEGORIES.HOUSING
  }

  isTrainingOrWorkService(): boolean {
    return this.getCategory() === SERVICE_CATEGORIES.TRAINING_WORK
  }

  isConsultationService(): boolean {
    return this.getCategory() === SERVICE_CATEGORIES.CONSULTATION
  }

  // 既存互換メソッド
  isEmploymentService(): boolean {
    const employmentTypes: ServiceTypeValue[] = [
      SERVICE_TYPES.EMPLOYMENT_TRANSITION,
      SERVICE_TYPES.EMPLOYMENT_SUPPORT_A,
      SERVICE_TYPES.EMPLOYMENT_SUPPORT_B,
    ]
    return employmentTypes.includes(this.value)
  }

  isChildService(): boolean {
    // 今後、児童向けサービスが追加された場合はここに定義
    return false
  }
}
