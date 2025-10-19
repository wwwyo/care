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

  console.log(`Updating transcripts for memo: ${memoId}, count: ${transcriptions.length}`)

  // 既存のtranscriptsを削除
  const existing = await hearingTranscriptRepository.findByHearingMemoId(memoId)
  if (!('type' in existing)) {
    console.log(`Deleting ${existing.length} existing transcripts`)
    for (const transcript of existing) {
      const deleteResult = await hearingTranscriptRepository.delete(transcript.id)
      if (deleteResult) {
        console.error(`Failed to delete transcript ${transcript.id}:`, deleteResult)
        return {
          type: 'UpdateFailed',
          message: `既存データの削除に失敗しました: ${deleteResult.message}`,
        }
      }
    }
  }

  // 新しいtranscriptsを作成
  for (const [index, item] of transcriptions.entries()) {
    console.log(`Creating transcript ${index + 1}/${transcriptions.length}:`, {
      text: `${item.text.substring(0, 50)}...`,
      timestamp: item.timestamp.toISOString(),
    })

    const transcript = HearingTranscriptModel.create({
      hearingMemoId: memoId,
      content: item.text,
      timestamp: Math.floor(item.timestamp.getTime() / 1000), // ミリ秒を秒に変換
      transcriptType: 'final',
    })

    const result = await hearingTranscriptRepository.save(transcript)
    if ('type' in result) {
      console.error(`Failed to save transcript ${index + 1}:`, result)
      return { type: 'UpdateFailed', message: result.message }
    }
  }

  console.log(`Successfully saved ${transcriptions.length} transcripts`)
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
