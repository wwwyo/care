import {
  type FacilityAssignment,
  FacilityStaff,
  type FacilityStaffRole,
} from '@/domain/facility-staff/model'
import type { FacilityStaffRepository } from '@/domain/facility-staff/repository'
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

      // 施設割り当てがあれば保存
      if (facilityStaff.facilities.length > 0) {
        await tx.facilityStaffFacility.createMany({
          data: facilityStaff.facilities.map((facility) => ({
            id: facility.id,
            facilityStaffId: facilityStaff.id,
            facilityId: facility.facilityId,
          })),
        })
      }

      // ロールがあれば保存
      if (facilityStaff.roles.length > 0) {
        await tx.facilityStaffRole.createMany({
          data: facilityStaff.roles.map((role) => ({
            id: role.id,
            facilityStaffId: facilityStaff.id,
            facilityId: role.facilityId,
            role: role.role,
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
        roles: true,
      },
    })

    if (!data) return null

    const facilities: FacilityAssignment[] = data.facilities.map((f) => ({
      id: f.id,
      facilityStaffId: f.facilityStaffId,
      facilityId: f.facilityId,
    }))

    const roles: FacilityStaffRole[] = data.roles.map((r) => ({
      id: r.id,
      facilityStaffId: r.facilityStaffId,
      facilityId: r.facilityId,
      role: r.role as 'admin' | 'staff' | 'viewer',
    }))

    return new FacilityStaff(data.id, data.userId, facilities, roles)
  },

  async findByUserId(userId: string): Promise<FacilityStaff | null> {
    const data = await prisma.facilityStaff.findFirst({
      where: { userId },
      include: {
        facilities: true,
        roles: true,
      },
    })

    if (!data) return null

    const facilities: FacilityAssignment[] = data.facilities.map((f) => ({
      id: f.id,
      facilityStaffId: f.facilityStaffId,
      facilityId: f.facilityId,
    }))

    const roles: FacilityStaffRole[] = data.roles.map((r) => ({
      id: r.id,
      facilityStaffId: r.facilityStaffId,
      facilityId: r.facilityId,
      role: r.role as 'admin' | 'staff' | 'viewer',
    }))

    return new FacilityStaff(data.id, data.userId, facilities, roles)
  },
}
