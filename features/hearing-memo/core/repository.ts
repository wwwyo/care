import type { HearingMemoModel } from './model'

export type HearingMemoRepositoryError =
  | { type: 'NotFound'; message: string }
  | { type: 'SaveFailed'; message: string }
  | { type: 'DeleteFailed'; message: string }

export interface HearingMemoRepository {
  save(memo: HearingMemoModel): Promise<HearingMemoModel | HearingMemoRepositoryError>
  delete(id: string): Promise<undefined | HearingMemoRepositoryError>
  findById(id: string): Promise<HearingMemoModel | HearingMemoRepositoryError>
  findByClientId(clientId: string): Promise<HearingMemoModel[] | HearingMemoRepositoryError>
  findBySupporterId(supporterId: string): Promise<HearingMemoModel[] | HearingMemoRepositoryError>
}
