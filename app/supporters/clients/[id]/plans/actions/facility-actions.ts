'use server'

import { z } from 'zod'
import { availabilityStatusSchema } from '@/domain/availability/status'
import {
  type FacilityRecommendation,
  getFacilityRecommendations,
} from '@/infra/query/facility-recommendations'
import { prisma } from '@/lib/prisma'
import { recordSupporterAvailability } from '@/uc/availability/record-supporter-availability'

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

export type FacilityDetailData = {
  id: string
  name: string
  serviceType: string | null
  facilityReport: {
    status: ReturnType<typeof availabilityStatusSchema.parse>
    note: string | null
    contextSummary: string | null
    updatedAt: string
  } | null
  supporterNotes: Array<{
    id: string
    status: ReturnType<typeof availabilityStatusSchema.parse>
    note: string | null
    contextSummary: string | null
    expiresAt: string
    createdAt: string
  }>
  city: string | null
  accessInfo: string | null
}

export type FacilityDetailResponse = { facility: FacilityDetailData } | { error: string }

export async function getFacilityDetail(facilityId: string): Promise<FacilityDetailResponse> {
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
        availabilityReports: {
          orderBy: { validFrom: 'desc' },
          take: 1,
        },
        supporterAvailabilityNotes: {
          where: {
            expiresAt: { gte: new Date() },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
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
        facilityReport: facility.availabilityReports[0]
          ? {
              status: availabilityStatusSchema.parse(facility.availabilityReports[0].status),
              note: facility.availabilityReports[0].note,
              contextSummary: facility.availabilityReports[0].contextSummary,
              updatedAt: facility.availabilityReports[0].updatedAt.toISOString(),
            }
          : null,
        supporterNotes: facility.supporterAvailabilityNotes.map((note) => ({
          id: note.id,
          status: availabilityStatusSchema.parse(note.status),
          note: note.note,
          contextSummary: note.contextSummary,
          expiresAt: note.expiresAt.toISOString(),
          createdAt: note.createdAt.toISOString(),
        })),
        city: facility.location?.city ?? null,
        accessInfo: facility.location?.accessInfo ?? null,
      },
    }
  } catch (error) {
    console.error('Failed to fetch facility detail:', error)
    return { error: 'Failed to fetch facility detail' }
  }
}

const recordSupporterAvailabilitySchema = z.object({
  facilityId: z.string().min(1, '施設IDが必要です'),
  supporterId: z.string().min(1, '相談員IDが必要です'),
  status: z.enum(['available', 'limited', 'unavailable'], {
    message: '有効な状態を選択してください',
  }),
  note: z.string().trim().max(1000, '背景メモは1000文字以内で入力してください').optional(),
  planId: z.string().trim().optional(),
  clientId: z.string().trim().optional(),
})

export async function recordSupporterAvailabilityAction(_prevState: unknown, formData: FormData) {
  try {
    const parsed = recordSupporterAvailabilitySchema.safeParse({
      facilityId: formData.get('facilityId'),
      supporterId: formData.get('supporterId'),
      status: formData.get('status'),
      note: formData.get('note') || undefined,
      planId: formData.get('planId') || undefined,
      clientId: formData.get('clientId') || undefined,
    })

    if (!parsed.success) {
      return {
        error: parsed.error.issues[0]?.message ?? 'バリデーションエラーが発生しました',
        facilityId: formData.get('facilityId')?.toString(),
        status: formData.get('status')?.toString(),
        note: formData.get('note')?.toString(),
      }
    }

    const result = await recordSupporterAvailability({
      facilityId: parsed.data.facilityId,
      supporterId: parsed.data.supporterId,
      status: parsed.data.status,
      note: parsed.data.note,
      planId: parsed.data.planId,
      clientId: parsed.data.clientId,
    })

    if ('type' in result) {
      return {
        error: result.message,
        facilityId: parsed.data.facilityId,
        status: parsed.data.status,
        note: parsed.data.note,
      }
    }

    return {
      success: true,
      message: '空き状況メモを登録しました',
    }
  } catch (error) {
    console.error('Failed to record supporter availability:', error)
    return {
      error: '空き状況メモの登録に失敗しました',
    }
  }
}
