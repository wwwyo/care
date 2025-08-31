import { z } from 'zod'

export const HearingMemoSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  supporterId: z.string(),
  date: z.date(),
  title: z.string(),
  content: z.string(), // 議事録本文のみ
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type HearingMemo = z.infer<typeof HearingMemoSchema>

export class HearingMemoModel {
  readonly id: string
  readonly clientId: string
  readonly supporterId: string
  readonly date: Date
  readonly title: string
  readonly content: string
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
      content: '',
      createdAt: now,
      updatedAt: now,
    }
    return new HearingMemoModel(data)
  }

  static fromPersistence(data: HearingMemo): HearingMemoModel {
    return new HearingMemoModel(HearingMemoSchema.parse(data))
  }

  updateContent(content: string): HearingMemoModel {
    return new HearingMemoModel({
      ...this,
      content,
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
