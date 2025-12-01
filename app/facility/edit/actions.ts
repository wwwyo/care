'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { requireRealm } from '@/features/auth/helpers'
import { getFacilityByStaffUserId } from '@/features/facility/infra/query/facility-query'
import { updateFacility } from '@/features/facility/usecase/update-facility'

// フォームデータの基本的な型変換のみ行う（詳細なバリデーションはドメイン層で実施）
const updateFacilitySchema = z.object({
  name: z
    .string()
    .min(1, '施設名称は必須です')
    .transform((str) => str.trim()),
  nameKana: z.string().optional(),
  description: z.string().optional(),
  serviceType: z.string().optional(),
  phone: z.string().optional(),
  fax: z.string().optional(),
  email: z.email('正しいメールアドレス形式で入力してください').optional().or(z.literal('')),
  website: z.string().url('正しいURL形式で入力してください').optional().or(z.literal('')),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  accessInfo: z.string().optional(),
})

type ActionState = {
  type: 'error'
  message?: string
  fieldErrors?: Record<string, string>
  values?: Record<string, string>
} | null

export async function updateFacilityAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const session = await requireRealm('facility_staff', '/login')

    const facility = await getFacilityByStaffUserId(session.user.id)
    if (!facility) {
      return {
        type: 'error',
        message: '施設が見つかりません',
      }
    }

    // フォームの値を保存（エラー時に返す）
    const formValues = Object.fromEntries(formData.entries())

    // FormDataをオブジェクトに変換
    const rawData = {
      name: formData.get('name'),
      nameKana: formData.get('nameKana') || undefined,
      description: formData.get('description') || undefined,
      serviceType: formData.get('serviceType') || undefined,
      phone: formData.get('phone') || undefined,
      fax: formData.get('fax') || undefined,
      email: formData.get('email') || undefined,
      website: formData.get('website') || undefined,
      address: formData.get('address') || undefined,
      postalCode: formData.get('postalCode') || undefined,
      accessInfo: formData.get('accessInfo') || undefined,
    }

    // バリデーション
    const parsed = updateFacilitySchema.safeParse(rawData)

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

    // ドメイン層とユースケース層で詳細なバリデーションを実施
    const result = await updateFacility({
      facilityId: facility.id,
      ...parsed.data,
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
      type: 'error',
      message: errorMessages[result.type] || 'エラーが発生しました',
      values: formValues,
    }
  } catch {
    return {
      type: 'error',
      message: '施設情報の更新に失敗しました',
    }
  }
}
