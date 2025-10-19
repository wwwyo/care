import { HearingTranscriptModel } from '@/domain/hearing-transcript/model'
import { hearingTranscriptRepository } from '@/infra/repositories/hearing-transcript'

export async function updateHearingTranscripts(
  memoId: string,
  transcriptions: Array<{ text: string; timestamp: Date }>,
): Promise<{ success: true } | { type: 'NotFound' | 'UpdateFailed'; message: string }> {
  // HearingMemoの存在確認（事前チェック）
  const { getHearingMemo } = await import('@/infra/query/hearing-memo')
  const memo = await getHearingMemo(memoId)
  if (!memo) {
    return { type: 'NotFound', message: 'ヒアリングメモが見つかりません' }
  }

  const transcriptModels = transcriptions.map((item) =>
    HearingTranscriptModel.create({
      hearingMemoId: memoId,
      content: item.text,
      timestamp: Math.floor(item.timestamp.getTime() / 1000), // ミリ秒を秒に変換
      transcriptType: 'final',
    }),
  )

  const replaceResult = await hearingTranscriptRepository.replaceForHearingMemo(
    memoId,
    transcriptModels,
  )

  if ('type' in replaceResult) {
    return {
      type: 'UpdateFailed',
      message: replaceResult.message,
    }
  }

  return { success: true }
}

export async function addHearingTranscript(
  memoId: string,
  text: string,
): Promise<{ success: true } | { type: 'NotFound' | 'UpdateFailed'; message: string }> {
  const transcript = HearingTranscriptModel.create({
    hearingMemoId: memoId,
    content: text,
    timestamp: Math.floor(Date.now() / 1000), // 現在時刻を秒単位で
    transcriptType: 'final',
  })

  const result = await hearingTranscriptRepository.save(transcript)
  if ('type' in result) {
    return { type: 'UpdateFailed', message: result.message }
  }

  return { success: true }
}
