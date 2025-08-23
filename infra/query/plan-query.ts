import { prisma } from '@/lib/prisma'

export async function getPlanByClientId(clientId: string) {
  return prisma.plan.findUnique({
    where: {
      clientId,
    },
    include: {
      versions: {
        orderBy: {
          versionNumber: 'desc',
        },
        include: {
          creator: {
            include: {
              profile: true,
            },
          },
        },
      },
    },
  })
}

export async function getPlanWithVersions(planId: string) {
  return prisma.plan.findUnique({
    where: {
      id: planId,
    },
    include: {
      client: {
        include: {
          profile: true,
        },
      },
      versions: {
        orderBy: {
          versionNumber: 'desc',
        },
        include: {
          services: true,
          creator: {
            include: {
              profile: true,
            },
          },
        },
      },
    },
  })
}
