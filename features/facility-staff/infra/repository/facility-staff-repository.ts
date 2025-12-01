import { type FacilityAssignment, FacilityStaff } from '@/features/facility-staff/core/model'
import type { FacilityStaffRepository } from '@/features/facility-staff/core/repository'
import { prisma } from '@/lib/prisma'

export const facilityStaffRepository: FacilityStaffRepository = {
  async save(facilityStaff: FacilityStaff): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // FacilityStaff本体を保存
      await tx.facilityStaff.create({
        data: {
          id: facilityStaff.id,
          userId: facilityStaff.userId,
        },
      })

      if (facilityStaff.facilities.length > 0) {
        await tx.facilityStaffFacility.createMany({
          data: facilityStaff.facilities.map((facility) => ({
            id: facility.id,
            facilityStaffId: facilityStaff.id,
            facilityId: facility.facilityId,
          })),
        })
      }
    })
  },

  async findById(id: string): Promise<FacilityStaff | null> {
    const data = await prisma.facilityStaff.findUnique({
      where: { id },
      include: {
        facilities: true,
      },
    })

    if (!data) return null

    const facilities: FacilityAssignment[] = data.facilities.map((f) => ({
      id: f.id,
      facilityStaffId: f.facilityStaffId,
      facilityId: f.facilityId,
    }))

    return new FacilityStaff(data.id, data.userId, facilities)
  },

  async findByUserId(userId: string): Promise<FacilityStaff | null> {
    const data = await prisma.facilityStaff.findFirst({
      where: { userId },
      include: {
        facilities: true,
      },
    })

    if (!data) return null

    const facilities: FacilityAssignment[] = data.facilities.map((f) => ({
      id: f.id,
      facilityStaffId: f.facilityStaffId,
      facilityId: f.facilityId,
    }))

    return new FacilityStaff(data.id, data.userId, facilities)
  },
}
