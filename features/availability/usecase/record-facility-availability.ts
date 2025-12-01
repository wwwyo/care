import { z } from 'zod'
import { FacilityAvailabilityReport } from '@/features/availability/model/facility-availability-report'
import type { AvailabilityStatus } from '@/features/availability/model/status'
import { facilityAvailabilityReportRepository } from '@/features/facility/infra/repository/facility-availability-report-repository'
import { facilityRepository } from '@/features/facility/infra/repository/facility-repository'

const noteSchema = z.string().trim().max(1000).optional()

export type RecordFacilityAvailabilityInput = {
  facilityId: string
  status: AvailabilityStatus
  reportedById: string
  note?: string | null
  validFrom?: Date
  validUntil?: Date | null
}

export type RecordFacilityAvailabilityError =
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

export async function recordFacilityAvailability(
  input: RecordFacilityAvailabilityInput,
): Promise<{ success: true } | RecordFacilityAvailabilityError> {
  try {
    const facility = await facilityRepository.findById(input.facilityId)

    if (!facility) {
      return {
        type: 'NotFound',
        message: '施設が見つかりません',
      }
    }

    const note = noteSchema.parse(input.note ?? undefined) ?? null

    const report = FacilityAvailabilityReport.create({
      facilityId: input.facilityId,
      status: input.status,
      reportedById: input.reportedById,
      validFrom: input.validFrom,
      validUntil: input.validUntil ?? null,
      note,
      contextSummary: buildContextSummary(note),
      contextDetails: [],
      confidence: null,
    })

    await facilityAvailabilityReportRepository.save(report)

    return { success: true }
  } catch (error) {
    console.error('Failed to record facility availability report:', error)
    return {
      type: 'UnexpectedError',
      message: '空き状況の登録に失敗しました',
    }
  }
}
