'use server'

import { updateHearingMemoContent } from '@/uc/hearing/update-memo'
import { addHearingTranscript, updateHearingTranscripts } from '@/uc/hearing/update-transcription'

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

  const result = await updateHearingMemoContent(memoId, document)

  if ('type' in result) {
    console.error('Failed to save document:', result)
    return { type: 'Error', message: result.message }
  }

  console.log('Document saved successfully')
  return { success: true }
}

export async function saveTranscription(
  memoId: string,
  transcription: Array<{ text: string; timestamp: Date }>,
): Promise<{ success: true } | ActionError> {
  const result = await updateHearingTranscripts(memoId, transcription)

  if ('type' in result) {
    return { type: 'Error', message: result.message }
  }

  return { success: true }
}

export async function addTranscriptionItem(
  memoId: string,
  text: string,
): Promise<{ success: true } | ActionError> {
  const result = await addHearingTranscript(memoId, text)

  if ('type' in result) {
    return { type: 'Error', message: result.message }
  }

  return { success: true }
}

export async function updateTitle(
  memoId: string,
  formData: FormData,
): Promise<{ success: true } | ActionError> {
  const title = formData.get('title') as string

  if (!title || title.trim() === '') {
    return { type: 'Error', message: 'タイトルを入力してください' }
  }

  const { updateHearingMemoTitle } = await import('@/uc/hearing/update-memo')
  const result = await updateHearingMemoTitle(memoId, title.trim())

  if ('type' in result) {
    return { type: 'Error', message: result.message }
  }

  return { success: true }
}
