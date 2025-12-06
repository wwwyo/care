import { z } from 'zod'

/**
 * 営業時間の曜日タイプ
 */
export type DayType = 'weekday' | 'saturday' | 'sunday' | 'holiday'

const dayTypeSchema = z.enum(['weekday', 'saturday', 'sunday', 'holiday'])

/**
 * 時間フォーマット（HH:MM）
 */
const timeSchema = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, '時間はHH:MM形式で入力してください')

export type BusinessHourData = {
  dayType: DayType
  openTime: string | null
  closeTime: string | null
  isRegularOff: boolean
  notes: string | null
}

/**
 * 営業時間
 * - 曜日タイプごとの営業時間を管理
 * - 定休日の場合はisRegularOffをtrueに設定
 */
export class BusinessHours {
  private constructor(
    private readonly dayType: DayType,
    private readonly openTime: string | null,
    private readonly closeTime: string | null,
    private readonly isRegularOff: boolean,
    private readonly notes: string | null,
  ) {}

  static create(data: BusinessHourData): BusinessHours | null {
    // dayTypeのバリデーション
    const dayTypeResult = dayTypeSchema.safeParse(data.dayType)
    if (!dayTypeResult.success) return null

    // 定休日でない場合は営業時間のバリデーション
    if (!data.isRegularOff) {
      if (data.openTime) {
        const openTimeResult = timeSchema.safeParse(data.openTime)
        if (!openTimeResult.success) return null
      }
      if (data.closeTime) {
        const closeTimeResult = timeSchema.safeParse(data.closeTime)
        if (!closeTimeResult.success) return null
      }
    }

    return new BusinessHours(
      dayTypeResult.data,
      data.isRegularOff ? null : data.openTime,
      data.isRegularOff ? null : data.closeTime,
      data.isRegularOff,
      data.notes,
    )
  }

  getDayType(): DayType {
    return this.dayType
  }

  getOpenTime(): string | null {
    return this.openTime
  }

  getCloseTime(): string | null {
    return this.closeTime
  }

  isOpen(): boolean {
    return !this.isRegularOff && this.openTime !== null && this.closeTime !== null
  }

  getIsRegularOff(): boolean {
    return this.isRegularOff
  }

  getNotes(): string | null {
    return this.notes
  }

  getDisplayText(): string {
    if (this.isRegularOff) {
      return '定休日'
    }
    if (!this.openTime || !this.closeTime) {
      return '営業時間未設定'
    }
    return `${this.openTime} - ${this.closeTime}`
  }
}
