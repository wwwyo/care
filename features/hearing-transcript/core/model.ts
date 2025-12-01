import { z } from 'zod'

export const HearingTranscriptSchema = z.object({
  id: z.string(),
  hearingMemoId: z.string(),
  transcriptType: z.enum(['partial', 'final']),
  content: z.string(),
  timestamp: z.number(), // 秒単位
  endTimestamp: z.number().nullable(),
  speaker: z.enum(['supporter', 'client', 'unknown']).nullable(),
  confidence: z.number().nullable(),
  createdAt: z.date(),
})

export type HearingTranscript = z.infer<typeof HearingTranscriptSchema>

export class HearingTranscriptModel {
  readonly id: string
  readonly hearingMemoId: string
  readonly transcriptType: 'partial' | 'final'
  readonly content: string
  readonly timestamp: number
  readonly endTimestamp: number | null
  readonly speaker: 'supporter' | 'client' | 'unknown' | null
  readonly confidence: number | null
  readonly createdAt: Date

  private constructor(data: HearingTranscript) {
    this.id = data.id
    this.hearingMemoId = data.hearingMemoId
    this.transcriptType = data.transcriptType
    this.content = data.content
    this.timestamp = data.timestamp
    this.endTimestamp = data.endTimestamp
    this.speaker = data.speaker
    this.confidence = data.confidence
    this.createdAt = data.createdAt
  }

  static create(params: {
    hearingMemoId: string
    content: string
    timestamp?: number
    transcriptType?: 'partial' | 'final'
    speaker?: 'supporter' | 'client' | 'unknown'
    confidence?: number
  }): HearingTranscriptModel {
    const data: HearingTranscript = {
      id: crypto.randomUUID(),
      hearingMemoId: params.hearingMemoId,
      transcriptType: params.transcriptType ?? 'final',
      content: params.content,
      timestamp: params.timestamp ?? 0,
      endTimestamp: null,
      speaker: params.speaker ?? null,
      confidence: params.confidence ?? null,
      createdAt: new Date(),
    }
    return new HearingTranscriptModel(data)
  }

  static fromPersistence(data: HearingTranscript): HearingTranscriptModel {
    return new HearingTranscriptModel(HearingTranscriptSchema.parse(data))
  }

  updateContent(content: string): HearingTranscriptModel {
    return new HearingTranscriptModel({
      ...this,
      content,
    })
  }

  setEndTimestamp(endTimestamp: number): HearingTranscriptModel {
    return new HearingTranscriptModel({
      ...this,
      endTimestamp,
    })
  }

  toJSON(): HearingTranscript {
    return {
      id: this.id,
      hearingMemoId: this.hearingMemoId,
      transcriptType: this.transcriptType,
      content: this.content,
      timestamp: this.timestamp,
      endTimestamp: this.endTimestamp,
      speaker: this.speaker,
      confidence: this.confidence,
      createdAt: this.createdAt,
    }
  }
}
