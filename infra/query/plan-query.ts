import { prisma } from '@/lib/prisma'

export async function getPlansByClientId(clientId: string) {
  return prisma.plan.findMany({
    where: {
      clientId,
    },
    include: {
      versions: {
        orderBy: {
          versionNumber: 'desc',
        },
        take: 1,
        include: {
          creator: {
            include: {
              profile: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
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
