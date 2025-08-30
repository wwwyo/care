'use server'

import type { TranscriptionItem } from '@/domain/hearing-memo/model'
import { updateHearingMemoDocument } from '@/uc/hearing/update-memo'
import {
  addHearingMemoTranscriptionItem,
  updateHearingMemoTranscription,
} from '@/uc/hearing/update-transcription'

type ActionError = {
  type: 'Error'
  message: string
}

export async function saveDocument(
  memoId: string,
  formData: FormData,
): Promise<{ success: true } | ActionError> {
  const document = formData.get('document') as string
  console.log('Saving document for memo:', memoId)
  console.log('Document content length:', document?.length)

  const result = await updateHearingMemoDocument(memoId, document)

  if ('type' in result) {
    console.error('Failed to save document:', result)
    return { type: 'Error', message: result.message }
  }

  console.log('Document saved successfully')
  return { success: true }
}

export async function saveTranscription(
  memoId: string,
  transcription: TranscriptionItem[],
): Promise<{ success: true } | ActionError> {
  const result = await updateHearingMemoTranscription(memoId, transcription)

  if ('type' in result) {
    return { type: 'Error', message: result.message }
  }

  return { success: true }
}

export async function addTranscriptionItem(
  memoId: string,
  text: string,
): Promise<{ success: true } | ActionError> {
  const result = await addHearingMemoTranscriptionItem(memoId, text)

  if ('type' in result) {
    return { type: 'Error', message: result.message }
  }

  return { success: true }
}
