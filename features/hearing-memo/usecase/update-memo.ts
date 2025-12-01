import type { HearingMemoModel } from '@/features/hearing-memo/core/model'
import type { HearingMemoRepositoryError } from '@/features/hearing-memo/core/repository'
import { hearingMemoRepository } from '@/features/hearing-memo/infra/repository/hearing-memo'

type UpdateHearingMemoError = HearingMemoRepositoryError

export async function updateHearingMemoContent(
  id: string,
  content: string,
): Promise<HearingMemoModel | UpdateHearingMemoError> {
  const memo = await hearingMemoRepository.findById(id)
  if ('type' in memo) {
    return memo
  }

  const updatedMemo = memo.updateContent(content)

  const result = await hearingMemoRepository.save(updatedMemo)

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
