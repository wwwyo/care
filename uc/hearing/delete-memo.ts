import type { HearingMemoRepositoryError } from '@/domain/hearing-memo/repository'
import { hearingMemoRepository } from '@/infra/repositories/hearing-memo'

type DeleteHearingMemoError = HearingMemoRepositoryError

export async function deleteHearingMemo(id: string): Promise<undefined | DeleteHearingMemoError> {
  return await hearingMemoRepository.delete(id)
}
