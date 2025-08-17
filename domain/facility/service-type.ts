import { z } from 'zod'

const serviceTypeSchema = z.enum([
  '生活介護',
  '就労継続支援A型',
  '就労継続支援B型',
  '就労移行支援',
  '施設入所支援',
  '短期入所',
  '児童発達支援',
  '放課後等デイサービス',
  'その他',
])

export type ServiceTypeValue = z.infer<typeof serviceTypeSchema>

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

  toString(): string {
    return this.value
  }

  equals(other: ServiceType | null): boolean {
    if (!other) return false
    return this.value === other.value
  }

  // ビジネスロジック: 就労系サービスかどうか
  isEmploymentService(): boolean {
    return ['就労継続支援A型', '就労継続支援B型', '就労移行支援'].includes(this.value)
  }

  // ビジネスロジック: 児童向けサービスかどうか
  isChildService(): boolean {
    return ['児童発達支援', '放課後等デイサービス'].includes(this.value)
  }
}
