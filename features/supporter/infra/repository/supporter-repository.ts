import { Supporter, type SupporterProfile } from '@/features/supporter/core/model'
import type { SupporterRepository } from '@/features/supporter/core/repository'
import { prisma } from '@/lib/prisma'

export const supporterRepository: SupporterRepository = {
  async save(supporter: Supporter): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // Supporter本体を保存
      await tx.supporter.create({
        data: {
          id: supporter.id,
          userId: supporter.userId,
          tenantId: supporter.tenantId,
        },
      })

      // プロフィールがあれば保存
      if (supporter.profile) {
        await tx.supporterProfile.create({
          data: {
            id: supporter.profile.id,
            tenantId: supporter.tenantId,
            name: supporter.profile.name,
            nameKana: supporter.profile.nameKana,
            gender: supporter.profile.gender,
            birthDate: supporter.profile.birthDate,
            phone: supporter.profile.phone,
            supporter: { connect: { id: supporter.id } },
          },
        })
      }
    })
  },

  async findById(id: string): Promise<Supporter | null> {
    const data = await prisma.supporter.findUnique({
      where: { id },
      include: {
        profile: true,
      },
    })

    if (!data) return null

    const profile: SupporterProfile | undefined = data.profile
      ? {
          id: data.profile.id,
          supporterId: data.profile.supporterId,
          name: data.profile.name,
          nameKana: data.profile.nameKana ?? undefined,
          gender: data.profile.gender ?? undefined,
          birthDate: data.profile.birthDate ?? undefined,
          phone: data.profile.phone ?? undefined,
          tenantId: data.profile.tenantId,
        }
      : undefined

    return new Supporter(data.id, data.userId, data.tenantId, profile)
  },

  async findByUserId(userId: string): Promise<Supporter | null> {
    const data = await prisma.supporter.findFirst({
      where: { userId },
      include: {
        profile: true,
      },
    })

    if (!data) return null

    const profile: SupporterProfile | undefined = data.profile
      ? {
          id: data.profile.id,
          supporterId: data.profile.supporterId,
          name: data.profile.name,
          nameKana: data.profile.nameKana ?? undefined,
          gender: data.profile.gender ?? undefined,
          birthDate: data.profile.birthDate ?? undefined,
          phone: data.profile.phone ?? undefined,
          tenantId: data.profile.tenantId,
        }
      : undefined

    return new Supporter(data.id, data.userId, data.tenantId, profile)
  },
}
