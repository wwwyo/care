import { HearingTranscriptModel } from '@/domain/hearing-transcript/model'
import { hearingTranscriptRepository } from '@/infra/repositories/hearing-transcript'

export async function updateHearingTranscripts(
  memoId: string,
  transcriptions: Array<{ text: string; timestamp: Date }>,
): Promise<{ success: true } | { type: 'NotFound' | 'UpdateFailed'; message: string }> {
  // 既存のtranscriptsを削除
  const existing = await hearingTranscriptRepository.findByHearingMemoId(memoId)
  if (!('type' in existing)) {
    for (const transcript of existing) {
      await hearingTranscriptRepository.delete(transcript.id)
    }
  }

  // 新しいtranscriptsを作成
  for (const item of transcriptions) {
    const transcript = HearingTranscriptModel.create({
      hearingMemoId: memoId,
      content: item.text,
      timestamp: Math.floor(item.timestamp.getTime() / 1000), // ミリ秒を秒に変換
      transcriptType: 'final',
    })
    const result = await hearingTranscriptRepository.save(transcript)
    if ('type' in result) {
      return { type: 'UpdateFailed', message: result.message }
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
