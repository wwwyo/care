import type { HearingMemoModel } from '@/domain/hearing-memo/model'
import type { HearingMemoRepositoryError } from '@/domain/hearing-memo/repository'
import { hearingMemoRepository } from '@/infra/repositories/hearing-memo'

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
