'use server'

import { z } from 'zod'
import type { SlotStatus } from '@/domain/slot/model'
import { getFacilityByStaffUserId } from '@/infra/query/facility-query'
import { requireRealm } from '@/lib/auth/helpers'
import { updateSlotStatus } from '@/uc/slot/update-slot-status'

const updateSlotStatusSchema = z.object({
  status: z.enum(['available', 'limited', 'unavailable']),
  comment: z
    .string()
    .max(100, 'コメントは100文字以内で入力してください')
    .optional()
    .transform((val) => val || undefined),
})

export async function updateSlotStatusAction(input: { status: SlotStatus; comment?: string }) {
  const session = await requireRealm('facility_staff', '/login')

  const facility = await getFacilityByStaffUserId(session.user.id)
  if (!facility) {
    return { type: 'NotFound' as const, message: '施設が見つかりません' }
  }

  // Zodでバリデーション
  const validationResult = updateSlotStatusSchema.safeParse(input)

  if (!validationResult.success) {
    const firstError = validationResult.error.issues[0]
    return {
      type: 'ValidationError' as const,
      message: firstError?.message || '入力内容に誤りがあります',
    }
  }

  const result = await updateSlotStatus({
    facilityId: facility.id,
    status: validationResult.data.status,
    comment: validationResult.data.comment,
    updatedBy: session.user.id,
  })

  return result
}
