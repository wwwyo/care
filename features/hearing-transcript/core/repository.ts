import type { HearingTranscriptModel } from './model'

export type HearingTranscriptRepositoryError =
  | { type: 'NotFound'; message: string }
  | { type: 'SaveFailed'; message: string }
  | { type: 'DeleteFailed'; message: string }

export interface HearingTranscriptRepository {
  save: (transcript: HearingTranscriptModel) => Promise<HearingTranscriptModel | HearingTranscriptRepositoryError>
  delete: (id: string) => Promise<undefined | HearingTranscriptRepositoryError>
  findById: (id: string) => Promise<HearingTranscriptModel | HearingTranscriptRepositoryError>
  findByHearingMemoId: (hearingMemoId: string) => Promise<HearingTranscriptModel[] | HearingTranscriptRepositoryError>
  replaceForHearingMemo: (
    hearingMemoId: string,
    transcripts: HearingTranscriptModel[],
  ) => Promise<{ success: true } | HearingTranscriptRepositoryError>
}
