'use server'

import { z } from 'zod'
import { getFacilityByStaffUserId } from '@/infra/query/facility-query'
import { requireRealm } from '@/lib/auth/helpers'
import { updateFacility } from '@/uc/facility/update-facility'

// フォームデータの基本的な型変換のみ行う（詳細なバリデーションはドメイン層で実施）
const updateFacilitySchema = z.object({
  name: z.string().transform((str) => str.trim()),
  nameKana: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  serviceType: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  fax: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  postalCode: z.string().nullable().optional(),
  accessInfo: z.string().nullable().optional(),
})

export async function updateFacilityAction(formData: FormData) {
  const session = await requireRealm('facility_staff', '/login')

  const facility = await getFacilityByStaffUserId(session.user.id)
  if (!facility) {
    return { type: 'NotFound' as const, message: '施設が見つかりません' }
  }

  // FormDataをオブジェクトに変換
  const rawData = {
    name: formData.get('name'),
    nameKana: formData.get('nameKana') || null,
    description: formData.get('description') || null,
    serviceType: formData.get('serviceType') || null,
    phone: formData.get('phone') || null,
    fax: formData.get('fax') || null,
    email: formData.get('email') || null,
    website: formData.get('website') || null,
    address: formData.get('address') || null,
    postalCode: formData.get('postalCode') || null,
    accessInfo: formData.get('accessInfo') || null,
  }

  // 基本的な型変換のみ実施
  const validationResult = updateFacilitySchema.safeParse(rawData)

  if (!validationResult.success) {
    const firstError = validationResult.error.issues[0]
    return {
      type: 'ValidationError' as const,
      message: firstError?.message || '入力内容に誤りがあります',
    }
  }

  // ドメイン層とユースケース層で詳細なバリデーションを実施
  const result = await updateFacility({
    facilityId: facility.id,
    ...validationResult.data,
  })

  return result
}
