import { z } from 'zod'

const availabilityCategorySchema = z.enum(['age', 'disability', 'equipment', 'timeframe', 'other'])

const availabilityContextItemSchema = z.object({
  category: availabilityCategorySchema.default('other'),
  detail: z.string().trim().min(1).max(200),
  applicableTo: z.array(z.string().trim().min(1)).default([]),
  lastConfirmedAt: z.coerce.date().optional(),
})

const availabilityContextSchema = z.array(availabilityContextItemSchema).default([])

export type AvailabilityCategory = z.infer<typeof availabilityCategorySchema>
export type AvailabilityContextItem = z.infer<typeof availabilityContextItemSchema>

export type AvailabilityContextDataItem = {
  category: AvailabilityCategory
  detail: string
  applicableTo: string[]
  lastConfirmedAt: string | null
}

export type AvailabilityContextData = AvailabilityContextDataItem[]

export class AvailabilityContext {
  private constructor(private readonly items: AvailabilityContextItem[]) {}

  static create(input: unknown): AvailabilityContext {
    const parsed = availabilityContextSchema.parse(input ?? [])
    return new AvailabilityContext(parsed)
  }

  getItems(): AvailabilityContextItem[] {
    return this.items.map((item) => ({ ...item }))
  }

  toJSON(): AvailabilityContextData {
    return this.items.map((item) => ({
      category: item.category,
      detail: item.detail,
      applicableTo: [...item.applicableTo],
      lastConfirmedAt: item.lastConfirmedAt ? item.lastConfirmedAt.toISOString() : null,
    }))
  }
}
