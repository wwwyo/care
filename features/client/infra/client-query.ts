import { prisma } from '@/lib/prisma'

export async function getClientById(id: string, tenantId: string) {
  return await prisma.client.findFirst({
    where: {
      id,
      tenantId,
    },
    include: {
      profile: true,
      addresses: true,
    },
  })
}

export async function getAllClients(tenantId: string, options?: { limit?: number; offset?: number }) {
  return await prisma.client.findMany({
    where: { tenantId },
    include: {
      profile: true,
      addresses: true,
    },
    take: options?.limit,
    skip: options?.offset,
    orderBy: { createdAt: 'desc' },
  })
}
