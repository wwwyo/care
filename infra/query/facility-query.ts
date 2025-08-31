import type { Prisma } from '@/lib/generated/prisma'
import { prisma } from '@/lib/prisma'

// Prismaのinclude設定を定義
const facilityWithDetailsInclude = {
  profile: true,
  location: true,
  contacts: {
    where: { contactType: 'main' },
    take: 1,
  },
  slots: {
    orderBy: { updatedAt: 'desc' } as const,
    take: 1,
  },
} satisfies Prisma.FacilityInclude

// Prismaの型を利用して自動的に型を生成
export type FacilityWithDetails = Prisma.FacilityGetPayload<{
  include: typeof facilityWithDetailsInclude
}>

export async function getFacilityByStaffUserId(userId: string) {
  const result = await prisma.facilityStaffFacility.findFirst({
    where: {
      facilityStaff: {
        userId,
      },
    },
    include: {
      facility: {
        include: facilityWithDetailsInclude,
      },
    },
  })

  return result?.facility ?? null
}

export async function getFacilityStaffByUserId(userId: string) {
  return prisma.facilityStaff.findFirst({
    where: { userId },
  })
}

export async function getFacilityList() {
  const facilities = await prisma.facility.findMany({
    include: facilityWithDetailsInclude,
    orderBy: {
      profile: {
        name: 'asc',
      },
    },
  })

  return facilities
}
