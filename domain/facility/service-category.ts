import { z } from 'zod'

/**
 * サービス種別カテゴリ
 */
export const SERVICE_CATEGORIES = {
  VISITING: 'VISITING',
  DAY_ACTIVITY: 'DAY_ACTIVITY',
  RESIDENTIAL: 'RESIDENTIAL',
  HOUSING: 'HOUSING',
  TRAINING_WORK: 'TRAINING_WORK',
  CONSULTATION: 'CONSULTATION',
} as const

export type ServiceCategoryValue = (typeof SERVICE_CATEGORIES)[keyof typeof SERVICE_CATEGORIES]

const serviceCategorySchema = z.enum([
  'VISITING',
  'DAY_ACTIVITY',
  'RESIDENTIAL',
  'HOUSING',
  'TRAINING_WORK',
  'CONSULTATION',
])

/**
 * サービス種別カテゴリのValue Object
 */
export class ServiceCategory {
  private constructor(private readonly value: ServiceCategoryValue) {}

  static create(value: string | null | undefined): ServiceCategory | null {
    if (!value) return null

    const result = serviceCategorySchema.safeParse(value)
    if (!result.success) return null

    return new ServiceCategory(result.data)
  }

  getValue(): ServiceCategoryValue {
    return this.value
  }

  getDisplayName(): string {
    const displayNames: Record<ServiceCategoryValue, string> = {
      VISITING: '訪問系サービス',
      DAY_ACTIVITY: '日中活動系サービス',
      RESIDENTIAL: '施設系サービス',
      HOUSING: '居住系サービス',
      TRAINING_WORK: '訓練系・就労系サービス',
      CONSULTATION: '相談系サービス',
    }
    return displayNames[this.value]
  }

  toString(): string {
    return this.value
  }

  equals(other: ServiceCategory | null): boolean {
    if (!other) return false
    return this.value === other.value
  }
}
