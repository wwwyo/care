import { HearingMemoModel } from '@/features/hearing-memo/core/model'
import type { HearingMemoRepositoryError } from '@/features/hearing-memo/core/repository'
import { hearingMemoRepository } from '@/features/hearing-memo/infra/repository/hearing-memo'

type CreateHearingMemoParams = {
  clientId: string
  supporterId: string
  date: Date
  title: string
}

type CreateHearingMemoError = HearingMemoRepositoryError

export async function createHearingMemo(
  params: CreateHearingMemoParams,
): Promise<HearingMemoModel | CreateHearingMemoError> {
  const memo = HearingMemoModel.create(params)
  return await hearingMemoRepository.save(memo)
}
