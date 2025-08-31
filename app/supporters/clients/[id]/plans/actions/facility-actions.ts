'use server'

import {
  type FacilityRecommendation,
  getFacilityRecommendations,
} from '@/infra/query/facility-recommendations'
import { prisma } from '@/lib/prisma'

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
