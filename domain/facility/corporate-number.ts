import { z } from 'zod'

/**
 * 法人番号（13桁）
 * - 国税庁が指定する法人番号
 * - 13桁の数字
 */
const corporateNumberSchema = z
  .string()
  .length(13, '法人番号は13桁で入力してください')
  .regex(/^\d{13}$/, '法人番号は13桁の数字で入力してください')

export class CorporateNumber {
  private constructor(private readonly value: string) {}

  static create(value: string | null | undefined): CorporateNumber | null {
    if (!value) return null

    const result = corporateNumberSchema.safeParse(value)
    if (!result.success) return null

    return new CorporateNumber(result.data)
  }

  getValue(): string {
    return this.value
  }

  toString(): string {
    return this.value
  }

  equals(other: CorporateNumber | null): boolean {
    if (!other) return false
    return this.value === other.value
  }
}
