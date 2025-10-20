import { z } from 'zod'
import type { AvailabilityStatus } from '@/domain/availability/status'
import { SupporterAvailabilityNote } from '@/domain/availability/supporter-availability-note'
import { facilityRepository } from '@/infra/repositories/facility-repository'
import { supporterAvailabilityNoteRepository } from '@/infra/repositories/supporter-availability-note-repository'
import { supporterRepository } from '@/infra/repositories/supporter-repository'

const noteSchema = z.string().trim().max(1000).optional()

const optionalIdSchema = z.string().trim().min(1).optional()

export type RecordSupporterAvailabilityInput = {
  facilityId: string
  supporterId: string
  status: AvailabilityStatus
  note?: string | null
  planId?: string | null
  clientId?: string | null
  intent?: string | null
}

export type RecordSupporterAvailabilityError =
  | { type: 'NotFound'; message: string }
  | { type: 'ValidationError'; message: string }
  | { type: 'UnexpectedError'; message: string }

function buildContextSummary(note?: string | null): string | null {
  if (!note) {
    return null
  }

  const trimmed = note.trim()
  if (!trimmed) {
    return null
  }

  return trimmed.slice(0, 80)
}

function calculateExpiryDate(): Date {
  const now = new Date()
  const expires = new Date(now)
  expires.setDate(expires.getDate() + 30)
  return expires
}

export async function recordSupporterAvailability(
  input: RecordSupporterAvailabilityInput,
): Promise<{ success: true } | RecordSupporterAvailabilityError> {
  try {
    const [facility, supporter] = await Promise.all([
      facilityRepository.findById(input.facilityId),
      supporterRepository.findById(input.supporterId),
    ])

    if (!facility) {
      return {
        type: 'NotFound',
        message: '施設が見つかりません',
      }
    }

    if (!supporter) {
      return {
        type: 'NotFound',
        message: '相談員が見つかりません',
      }
    }

    const note = noteSchema.parse(input.note ?? undefined) ?? null
    const planId = optionalIdSchema.parse(input.planId ?? undefined) ?? null
    const clientId = optionalIdSchema.parse(input.clientId ?? undefined) ?? null

    const availabilityNote = SupporterAvailabilityNote.create({
      facilityId: input.facilityId,
      supporterId: input.supporterId,
      status: input.status,
      intent: input.intent ?? 'general',
      note,
      planId,
      clientId,
      contextSummary: buildContextSummary(note),
      contextDetails: [],
      expiresAt: calculateExpiryDate(),
    })

    await supporterAvailabilityNoteRepository.save(availabilityNote)

    return { success: true }
  } catch (error) {
    console.error('Failed to record supporter availability:', error)
    return {
      type: 'UnexpectedError',
      message: '相談員の空き状況登録に失敗しました',
    }
  }
}
