import { z } from 'zod'

/**
 * 電話番号を正規化する関数
 * 全角数字、ハイフン、スペースなどを正規化してXX-XXXX-XXXXまたはXXX-XXXX-XXXX形式に変換
 */
export function normalizePhoneNumber(phone: string): string {
  // 全角数字を半角に変換
  const halfWidth = phone.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
  // ハイフン、スペース、括弧などを削除
  const digitsOnly = halfWidth.replace(/[\s\-()（）ー－―]/g, '')

  // 10桁または11桁の数字にフォーマット
  if (digitsOnly.length === 10) {
    // 固定電話などの10桁 (例: 03-1234-5678)
    return `${digitsOnly.slice(0, 2)}-${digitsOnly.slice(2, 6)}-${digitsOnly.slice(6)}`
  } else if (digitsOnly.length === 11) {
    // 携帯電話の11桁 (例: 090-1234-5678)
    return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3, 7)}-${digitsOnly.slice(7)}`
  }
  // そのまま返す（バリデーションでエラーになる）
  return digitsOnly
}

/**
 * 電話番号のZodスキーマ
 * 必須項目として、正規化とフォーマット検証を行う
 */
export const phoneNumberSchema = z
  .string()
  .min(1, '電話番号は必須です')
  .transform(normalizePhoneNumber)
  .refine(
    (val) => /^\d{2,3}-\d{4}-\d{4}$/.test(val),
    '電話番号の形式が正しくありません（例: 090-1234-5678）',
  )
