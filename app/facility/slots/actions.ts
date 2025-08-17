'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { getFacilityByStaffUserId } from '@/infra/query/facility-query'
import { requireRealm } from '@/lib/auth/helpers'
import { updateSlotStatus } from '@/uc/slot/update-slot-status'

const updateSlotStatusSchema = z.object({
  status: z.enum(['available', 'limited', 'unavailable'], {
    required_error: '空き状況を選択してください',
    invalid_type_error: '無効な空き状況が選択されました',
  }),
  comment: z
    .string()
    .max(100, 'コメントは100文字以内で入力してください')
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
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const session = await requireRealm('facility_staff', '/login')

    const facility = await getFacilityByStaffUserId(session.user.id)
    if (!facility) {
      return {
        type: 'error' as const,
        message: '施設が見つかりません',
      }
    }

    // フォームの値を保存（エラー時に返す）
    const formValues = Object.fromEntries(formData.entries())

    // FormDataから値を取得
    const rawData = {
      status: formData.get('status'),
      comment: formData.get('comment') || undefined,
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
        type: 'error' as const,
        fieldErrors,
        values: formValues,
      }
    }

    const result = await updateSlotStatus({
      facilityId: facility.id,
      status: parsed.data.status,
      comment: parsed.data.comment,
      updatedBy: session.user.id,
    })

    if ('success' in result) {
      redirect('/facility')
    }

    // エラーメッセージのマッピング
    const errorMessages: Record<string, string> = {
      NotFound: '施設が見つかりません',
      ValidationError: '入力内容に誤りがあります',
      SaveError: 'データの保存に失敗しました',
    }

    return {
      type: 'error' as const,
      message: errorMessages[result.type] || 'エラーが発生しました',
      values: formValues,
    }
  } catch {
    return {
      type: 'error' as const,
      message: '空き状況の更新に失敗しました',
    }
  }
}
