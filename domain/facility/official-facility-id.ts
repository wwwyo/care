import { z } from 'zod'

/**
 * 事業所番号（10桁）
 * - 都道府県が指定する障害福祉サービス事業所番号
 * - 10桁の数字
 */
const officialFacilityIdSchema = z
  .string()
  .length(10, '事業所番号は10桁で入力してください')
  .regex(/^\d{10}$/, '事業所番号は10桁の数字で入力してください')

export class OfficialFacilityId {
  private constructor(private readonly value: string) {}

  static create(value: string | null | undefined): OfficialFacilityId | null {
    if (!value) return null

    const result = officialFacilityIdSchema.safeParse(value)
    if (!result.success) return null

    return new OfficialFacilityId(result.data)
  }

  getValue(): string {
    return this.value
  }

  toString(): string {
    return this.value
  }

  equals(other: OfficialFacilityId | null): boolean {
    if (!other) return false
    return this.value === other.value
  }
}
