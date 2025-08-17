import { Facility, type FacilityData } from '@/domain/facility/model'
import type { FacilityRepository } from '@/domain/facility/repository'
import { prisma } from '@/lib/prisma'

async function findById(id: string): Promise<Facility | null> {
  const facility = await prisma.facility.findUnique({
    where: { id },
    include: {
      profile: true,
      location: true,
      contacts: true,
    },
  })

  if (!facility) {
    return null
  }

  return Facility.create(facility as FacilityData)
}

async function findByStaffUserId(userId: string): Promise<Facility | null> {
  const staffFacility = await prisma.facilityStaffFacility.findFirst({
    where: {
      facilityStaff: {
        userId,
      },
    },
    include: {
      facility: {
        include: {
          profile: true,
          location: true,
          contacts: true,
        },
      },
    },
  })

  if (!staffFacility) {
    return null
  }

  return Facility.create(staffFacility.facility as FacilityData)
}

async function save(facility: Facility): Promise<void> {
  const facilityId = facility.getId()

  // ドメインモデルから必要なデータを取得
  const profileData = {
    name: facility.getName(),
    nameKana: facility.getNameKana(),
    description: facility.getDescription(),
    serviceType: facility.getServiceType(),
  }

  const locationData = {
    postalCode: facility.getPostalCode(),
    accessInfo: facility.getAccessInfo(),
    latitude: facility.getLatitude(),
    longitude: facility.getLongitude(),
  }

  const contactData = {
    phone: facility.getPhone(),
    fax: facility.getFax(),
    email: facility.getEmail(),
    website: facility.getWebsite(),
  }

  await prisma.$transaction([
    // プロフィール更新
    prisma.facilityProfile.upsert({
      where: { facilityId },
      create: {
        facilityId,
        ...profileData,
      },
      update: profileData,
    }),

    // ロケーション更新
    prisma.facilityLocation.upsert({
      where: { facilityId },
      create: {
        facilityId,
        ...locationData,
      },
      update: locationData,
    }),

    // 連絡先更新（mainタイプのみ）
    prisma.facilityContact.upsert({
      where: {
        id: (await getMainContactId(facilityId)) ?? '',
      },
      create: {
        facilityId,
        contactType: 'main',
        ...contactData,
      },
      update: contactData,
    }),

    // 施設の更新日時を更新
    prisma.facility.update({
      where: { id: facilityId },
      data: { updatedAt: new Date() },
    }),
  ])
}

async function deleteById(id: string): Promise<void> {
  await prisma.facility.delete({
    where: { id },
  })
}

async function getMainContactId(facilityId: string): Promise<string | null> {
  const contact = await prisma.facilityContact.findFirst({
    where: { facilityId, contactType: 'main' },
    select: { id: true },
  })
  return contact?.id ?? null
}

/**
 * 施設リポジトリの実装
 */
export const facilityRepository: FacilityRepository = {
  findById,
  findByStaffUserId,
  save,
  delete: deleteById,
}
