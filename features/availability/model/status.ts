import { z } from 'zod'

export const availabilityStatusSchema = z.enum(['available', 'limited', 'unavailable'])

export type AvailabilityStatus = z.infer<typeof availabilityStatusSchema>

export function mapStatus(raw: string): AvailabilityStatus {
  const parsed = availabilityStatusSchema.safeParse(raw)

  if (parsed.success) {
    return parsed.data
  }

  return 'unavailable'
}
