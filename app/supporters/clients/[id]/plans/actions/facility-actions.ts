'use server'

import { z } from 'zod'
import {
  type FacilityRecommendation,
  getFacilityRecommendations,
} from '@/infra/query/facility-recommendations'
import { prisma } from '@/lib/prisma'
import { updateSlotStatus } from '@/uc/slot/update-slot-status'

export async function fetchFacilityRecommendations(
  serviceType: string,
): Promise<{ facilities: FacilityRecommendation[] } | { error: string }> {
  try {
    const facilities = await getFacilityRecommendations(serviceType)
    return { facilities }
  } catch (error) {
    console.error('Failed to fetch facility recommendations:', error)
    return { error: '施設の取得に失敗しました' }
  }
}

export async function getFacilityDetail(facilityId: string) {
  try {
    const facility = await prisma.facility.findUnique({
      where: { id: facilityId },
      select: {
        id: true,
        profile: {
          select: {
            name: true,
            serviceType: true,
          },
        },
        location: {
          select: {
            city: true,
            accessInfo: true,
          },
        },
        slots: {
          select: {
            status: true,
            comment: true,
          },
          where: {
            OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
          },
          orderBy: {
            status: 'asc',
          },
          take: 1,
        },
      },
    })

    if (!facility) {
      return { error: 'Facility not found' }
    }

    return {
      facility: {
        id: facility.id,
        name: facility.profile?.name ?? '施設名未設定',
        serviceType: facility.profile?.serviceType ?? null,
        slotStatus: facility.slots[0]?.status ?? null,
        slotComment: facility.slots[0]?.comment ?? null,
        city: facility.location?.city ?? null,
        accessInfo: facility.location?.accessInfo ?? null,
      },
    }
  } catch (error) {
    console.error('Failed to fetch facility detail:', error)
    return { error: 'Failed to fetch facility detail' }
  }
}

const updateSlotSchema = z.object({
  facilityId: z.string().min(1, '施設IDが必要です'),
  status: z.enum(['available', 'limited', 'unavailable'], {
    message: '有効な状態を選択してください',
  }),
  comment: z.string().optional(),
})

export async function updateFacilitySlotAction(_prevState: unknown, formData: FormData) {
  try {
    // TODO: 認証機能を実装後に追加
    // const session = await auth()
    // if (!session?.user) {
    //   redirect('/login')
    // }

    const parsed = updateSlotSchema.safeParse({
      facilityId: formData.get('facilityId'),
      status: formData.get('status'),
      comment: formData.get('comment') || undefined,
    })

    if (!parsed.success) {
      return {
        error: parsed.error.issues[0]?.message ?? 'バリデーションエラーが発生しました',
        facilityId: formData.get('facilityId')?.toString(),
        status: formData.get('status')?.toString(),
        comment: formData.get('comment')?.toString(),
      }
    }

    const result = await updateSlotStatus({
      ...parsed.data,
      updatedBy: null, // TODO: 認証機能実装後に session.user.id に変更
    })

    if ('type' in result) {
      return {
        error: result.message,
        facilityId: parsed.data.facilityId,
        status: parsed.data.status,
        comment: parsed.data.comment,
      }
    }

    return {
      success: true,
      message: '空き状況を更新しました',
    }
  } catch (error) {
    console.error('Failed to update slot status:', error)
    return {
      error: '空き状況の更新に失敗しました',
    }
  }
}
