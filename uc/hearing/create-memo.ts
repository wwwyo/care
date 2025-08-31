import { HearingMemoModel } from '@/domain/hearing-memo/model'
import type { HearingMemoRepositoryError } from '@/domain/hearing-memo/repository'
import { hearingMemoRepository } from '@/infra/repositories/hearing-memo'

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
