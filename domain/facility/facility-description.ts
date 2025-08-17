import { z } from 'zod'

const facilityDescriptionSchema = z.string().max(500, '施設紹介文は500文字以内で入力してください')

export class FacilityDescription {
  private constructor(private readonly value: string) {}

  static create(value: string | null | undefined): FacilityDescription | null {
    if (!value) return null

    const result = facilityDescriptionSchema.safeParse(value)
    if (!result.success) return null

    return new FacilityDescription(result.data)
  }

  getValue(): string {
    return this.value
  }

  toString(): string {
    return this.value
  }

  // 説明文の要約を取得（最初の100文字）
  getSummary(maxLength: number = 100): string {
    if (this.value.length <= maxLength) return this.value
    return this.value.substring(0, maxLength) + '...'
  }

  equals(other: FacilityDescription | null): boolean {
    if (!other) return false
    return this.value === other.value
  }
}
