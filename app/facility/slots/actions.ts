'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { getFacilityByStaffUserId, getFacilityStaffByUserId } from '@/infra/query/facility-query'
import { requireRealm } from '@/lib/auth/helpers'
import { recordFacilityAvailability } from '@/uc/availability/record-facility-availability'

const updateSlotStatusSchema = z.object({
  status: z.enum(['available', 'limited', 'unavailable'], {
    error: '無効な空き状況が選択されました',
  }),
  note: z
    .string()
    .max(1000, '背景メモは1000文字以内で入力してください')
    .optional()
    .transform((val) => val || undefined),
})

type ActionState = {
  type: 'error'
  message?: string
  fieldErrors?: Record<string, string>
  values?: Record<string, string>
} | null

export async function updateSlotStatusAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRealm('facility_staff', '/login')

  const [facility, facilityStaff] = await Promise.all([
    getFacilityByStaffUserId(session.user.id),
    getFacilityStaffByUserId(session.user.id),
  ])

  if (!facility || !facilityStaff) {
    return {
      type: 'error',
      message: '施設またはスタッフが見つかりません',
    }
  }

  // フォームの値を保存（エラー時に返す）
  const formValues = Object.fromEntries(formData.entries())

  // FormDataから値を取得
  const rawData = {
    status: formData.get('status'),
    note: formData.get('note') || undefined,
  }

  // バリデーション
  const parsed = updateSlotStatusSchema.safeParse(rawData)

  if (!parsed.success) {
    // Zodエラーをfieldごとにまとめて返す
    const fieldErrors: Record<string, string> = {}
    parsed.error.issues.forEach((err) => {
      const fieldName = err.path[0]
      if (fieldName && typeof fieldName === 'string') {
        fieldErrors[fieldName] = err.message
      }
    })

    return {
      type: 'error',
      fieldErrors,
      values: formValues,
    }
  }

  const result = await recordFacilityAvailability({
    facilityId: facility.id,
    status: parsed.data.status,
    note: parsed.data.note,
    reportedById: facilityStaff.id,
  })

  if ('success' in result) {
    redirect('/facility')
  }

  // エラーメッセージのマッピング
  const errorMessages: Record<string, string> = {
    NotFound: '施設が見つかりません',
    ValidationError: '入力内容に誤りがあります',
    UnexpectedError: 'データの保存に失敗しました',
  }

  return {
    type: 'error',
    message: errorMessages[result.type] || 'エラーが発生しました',
    values: formValues,
  }
}
