import { z } from 'zod'

// 音声認識の1つの発話
export const TranscriptionItemSchema = z.object({
  text: z.string(),
  timestamp: z
    .union([z.string(), z.date()])
    .transform((val) => (typeof val === 'string' ? new Date(val) : val)),
})

export type TranscriptionItem = z.infer<typeof TranscriptionItemSchema>

// contentをシンプルな構造に変更
export const HearingMemoContentSchema = z.object({
  document: z.string(), // 議事録本文
  transcription: z.array(TranscriptionItemSchema).optional(), // 音声認識の文字起こし結果（配列）
})

export const HearingMemoSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  supporterId: z.string(),
  date: z.date(),
  title: z.string(),
  content: HearingMemoContentSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type HearingMemoContent = z.infer<typeof HearingMemoContentSchema>
export type HearingMemo = z.infer<typeof HearingMemoSchema>

export class HearingMemoModel {
  readonly id: string
  readonly clientId: string
  readonly supporterId: string
  readonly date: Date
  readonly title: string
  readonly content: HearingMemoContent
  readonly createdAt: Date
  readonly updatedAt: Date

  private constructor(data: HearingMemo) {
    this.id = data.id
    this.clientId = data.clientId
    this.supporterId = data.supporterId
    this.date = data.date
    this.title = data.title
    this.content = data.content
    this.createdAt = data.createdAt
    this.updatedAt = data.updatedAt
  }

  static create(params: {
    clientId: string
    supporterId: string
    date: Date
    title: string
  }): HearingMemoModel {
    const now = new Date()
    const data: HearingMemo = {
      id: crypto.randomUUID(),
      clientId: params.clientId,
      supporterId: params.supporterId,
      date: params.date,
      title: params.title,
      content: {
        document: '',
        transcription: [],
      },
      createdAt: now,
      updatedAt: now,
    }
    return new HearingMemoModel(data)
  }

  static fromPersistence(data: HearingMemo): HearingMemoModel {
    return new HearingMemoModel(HearingMemoSchema.parse(data))
  }

  updateDocument(document: string): HearingMemoModel {
    return new HearingMemoModel({
      ...this,
      content: {
        ...this.content,
        document,
      },
      updatedAt: new Date(),
    })
  }

  updateTranscription(transcription: TranscriptionItem[]): HearingMemoModel {
    return new HearingMemoModel({
      ...this,
      content: {
        ...this.content,
        transcription,
      },
      updatedAt: new Date(),
    })
  }

  addTranscriptionItem(text: string): HearingMemoModel {
    const newItem: TranscriptionItem = {
      text,
      timestamp: new Date(),
    }
    const currentTranscription = this.content.transcription || []
    return new HearingMemoModel({
      ...this,
      content: {
        ...this.content,
        transcription: [...currentTranscription, newItem],
      },
      updatedAt: new Date(),
    })
  }

  updateTitle(title: string): HearingMemoModel {
    return new HearingMemoModel({
      ...this,
      title,
      updatedAt: new Date(),
    })
  }

  toJSON(): HearingMemo {
    return {
      id: this.id,
      clientId: this.clientId,
      supporterId: this.supporterId,
      date: this.date,
      title: this.title,
      content: this.content,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
