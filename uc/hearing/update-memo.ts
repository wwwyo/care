import type { HearingMemoModel } from '@/domain/hearing-memo/model'
import type { HearingMemoRepositoryError } from '@/domain/hearing-memo/repository'
import { hearingMemoRepository } from '@/infra/repositories/hearing-memo'

type UpdateHearingMemoError = HearingMemoRepositoryError

export async function updateHearingMemoContent(
  id: string,
  content: string,
): Promise<HearingMemoModel | UpdateHearingMemoError> {
  console.log('updateHearingMemoContent called with:', { id, contentLength: content?.length })

  const memo = await hearingMemoRepository.findById(id)
  if ('type' in memo) {
    console.error('Failed to find memo:', memo)
    return memo
  }

  console.log('Found memo, updating content')
  const updatedMemo = memo.updateContent(content)

  console.log('Saving updated memo')
  const result = await hearingMemoRepository.save(updatedMemo)

  if ('type' in result) {
    console.error('Failed to save memo:', result)
  } else {
    console.log('Memo saved successfully')
  }

  return result
}

export async function updateHearingMemoTitle(
  id: string,
  title: string,
): Promise<HearingMemoModel | UpdateHearingMemoError> {
  const memo = await hearingMemoRepository.findById(id)
  if ('type' in memo) {
    return memo
  }

  const updatedMemo = memo.updateTitle(title)
  return await hearingMemoRepository.save(updatedMemo)
}
