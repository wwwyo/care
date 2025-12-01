import { Supporter, type SupporterProfile } from '@/features/supporter/core/model'
import { prisma } from '@/lib/prisma'

export async function getSupporterByUserId(userId: string): Promise<Supporter | null> {
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
}
