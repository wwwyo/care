import { z } from 'zod'

const facilityNameSchema = z.string().min(1, '施設名称は必須です').max(255, '施設名称は255文字以内で入力してください')

export class FacilityName {
  private constructor(private readonly value: string) {}

  static create(value: string | null | undefined): FacilityName | null {
    if (!value) return null

    const result = facilityNameSchema.safeParse(value)
    if (!result.success) return null

    return new FacilityName(result.data)
  }

  getValue(): string {
    return this.value
  }

  toString(): string {
    return this.value
  }

  equals(other: FacilityName | null): boolean {
    if (!other) return false
    return this.value === other.value
  }
}

// 施設名カナ用
const facilityNameKanaSchema = z
  .string()
  .max(255, '施設名称カナは255文字以内で入力してください')
  .regex(/^[ァ-ヶー　]+$/, '施設名称カナはカタカナで入力してください')

export class FacilityNameKana {
  private constructor(private readonly value: string) {}

  static create(value: string | null | undefined): FacilityNameKana | null {
    if (!value) return null

    const result = facilityNameKanaSchema.safeParse(value)
    if (!result.success) return null

    return new FacilityNameKana(result.data)
  }

  getValue(): string {
    return this.value
  }

  toString(): string {
    return this.value
  }

  equals(other: FacilityNameKana | null): boolean {
    if (!other) return false
    return this.value === other.value
  }
}
