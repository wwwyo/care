import { prisma } from '@/lib/prisma'

export async function getHearingMemosByClient(clientId: string) {
  return await prisma.hearingMemo.findMany({
    where: { clientId },
    include: {
      supporter: {
        include: {
          profile: true,
        },
      },
      transcripts: {
        orderBy: { timestamp: 'asc' },
      },
    },
    orderBy: { date: 'desc' },
  })
}

export async function getHearingMemo(id: string) {
  return await prisma.hearingMemo.findUnique({
    where: { id },
    include: {
      client: {
        include: {
          profile: true,
        },
      },
      supporter: {
        include: {
          profile: true,
        },
      },
      transcripts: {
        orderBy: { timestamp: 'asc' },
      },
    },
  })
}
