import type { HearingMemoRepositoryError } from '@/features/hearing-memo/core/repository'
import { hearingMemoRepository } from '@/features/hearing-memo/infra/repository/hearing-memo'

type DeleteHearingMemoError = HearingMemoRepositoryError

export async function deleteHearingMemo(id: string): Promise<undefined | DeleteHearingMemoError> {
  return await hearingMemoRepository.delete(id)
}
