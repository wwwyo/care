import type { TranscriptionItem } from '@/domain/hearing-memo/model'
import { hearingMemoRepository } from '@/infra/repositories/hearing-memo'

export async function updateHearingMemoTranscription(
  id: string,
  transcription: TranscriptionItem[],
): Promise<{ success: true } | { type: 'NotFound' | 'UpdateFailed'; message: string }> {
  const existing = await hearingMemoRepository.findById(id)
  if ('type' in existing) {
    return { type: 'NotFound', message: existing.message }
  }

  const updated = existing.updateTranscription(transcription)
  const result = await hearingMemoRepository.save(updated)

  if ('type' in result) {
    return { type: 'UpdateFailed', message: result.message }
  }

  return { success: true }
}

export async function addHearingMemoTranscriptionItem(
  id: string,
  text: string,
): Promise<{ success: true } | { type: 'NotFound' | 'UpdateFailed'; message: string }> {
  const existing = await hearingMemoRepository.findById(id)
  if ('type' in existing) {
    return { type: 'NotFound', message: existing.message }
  }

  const updated = existing.addTranscriptionItem(text)
  const result = await hearingMemoRepository.save(updated)

  if ('type' in result) {
    return { type: 'UpdateFailed', message: result.message }
  }

  return { success: true }
}
