import { prisma } from '@/lib/prisma'

export async function getHearingMemosByClient(clientId: string) {
  const memos = await prisma.hearingMemo.findMany({
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

  // Decimal型をnumber型に変換
  return memos.map((memo) => ({
    ...memo,
    transcripts: memo.transcripts.map((transcript) => ({
      ...transcript,
      timestamp: transcript.timestamp.toNumber(),
      endTimestamp: transcript.endTimestamp ? transcript.endTimestamp.toNumber() : null,
      confidence: transcript.confidence ? transcript.confidence.toNumber() : null,
    })),
  }))
}

export async function getHearingMemo(id: string) {
  const memo = await prisma.hearingMemo.findUnique({
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

  if (!memo) return null

  // Decimal型をnumber型に変換
  return {
    ...memo,
    transcripts: memo.transcripts.map((transcript) => ({
      ...transcript,
      timestamp: transcript.timestamp.toNumber(),
      endTimestamp: transcript.endTimestamp ? transcript.endTimestamp.toNumber() : null,
      confidence: transcript.confidence ? transcript.confidence.toNumber() : null,
    })),
  }
}
