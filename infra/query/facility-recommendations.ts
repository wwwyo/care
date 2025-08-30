import { prisma } from '@/lib/prisma'

export type FacilityRecommendation = {
  id: string
  name: string
  serviceType: string | null
  slotStatus: string | null
  slotComment: string | null
  city: string | null
  accessInfo: string | null
}

export async function getFacilityRecommendations(
  serviceType: string,
  limit = 4,
): Promise<FacilityRecommendation[]> {
  // スロットの有無に関わらず、サービス種別が一致する施設を取得
  const facilities = await prisma.facility.findMany({
    where: {
      services: {
        some: {
          serviceType: serviceType,
        },
      },
    },
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
          expiresAt: true,
        },
        where: {
          OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
        },
        orderBy: {
          status: 'asc', // available -> limited -> unavailable の順
        },
        take: 1,
      },
    },
    take: limit,
  })

  return facilities.map((facility) => ({
    id: facility.id,
    name: facility.profile?.name ?? '施設名未設定',
    serviceType: facility.profile?.serviceType ?? null,
    slotStatus: facility.slots[0]?.status ?? null,
    slotComment: facility.slots[0]?.comment ?? null,
    city: facility.location?.city ?? null,
    accessInfo: facility.location?.accessInfo ?? null,
  }))
}

export async function searchFacilitiesWithSlots(
  serviceTypes: string[],
  limit = 12,
): Promise<FacilityRecommendation[]> {
  if (serviceTypes.length === 0) {
    return []
  }

  // スロットの有無に関わらず、サービス種別が一致する施設を取得
  const facilities = await prisma.facility.findMany({
    where: {
      services: {
        some: {
          serviceType: {
            in: serviceTypes,
          },
        },
      },
    },
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
          expiresAt: true,
        },
        where: {
          OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
        },
        orderBy: {
          status: 'asc', // available -> limited -> unavailable の順
        },
        take: 1,
      },
      services: {
        select: {
          serviceType: true,
        },
      },
    },
    take: limit,
  })

  return facilities.map((facility) => ({
    id: facility.id,
    name: facility.profile?.name ?? '施設名未設定',
    serviceType: facility.profile?.serviceType ?? null,
    slotStatus: facility.slots[0]?.status ?? null,
    slotComment: facility.slots[0]?.comment ?? null,
    city: facility.location?.city ?? null,
    accessInfo: facility.location?.accessInfo ?? null,
  }))
}
