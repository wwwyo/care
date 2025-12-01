import { z } from 'zod'
import {
  AvailabilityContext,
  type AvailabilityContextData,
} from '@/features/availability/model/context'
import {
  type AvailabilityStatus,
  availabilityStatusSchema,
  mapStatus,
} from '@/features/availability/model/status'

export type FacilityAvailabilityReportData = {
  id: string
  facilityId: string
  status: string
  validFrom: Date
  validUntil: Date | null
  note: string | null
  contextSummary: string | null
  contextDetails: AvailabilityContextData
  confidence: number | null
  reportedById: string
  createdAt: Date
  updatedAt: Date
}

const confidenceSchema = z.number().int().min(0).max(100).optional()

type FacilityAvailabilityReportCreateInput = {
  facilityId: string
  status: AvailabilityStatus
  reportedById: string
  validFrom?: Date
  validUntil?: Date | null
  note?: string | null
  contextSummary?: string | null
  contextDetails?: AvailabilityContextData
  confidence?: number | null
}

export class FacilityAvailabilityReport {
  private constructor(
    private readonly id: string,
    private readonly facilityId: string,
    private readonly status: AvailabilityStatus,
    private readonly validFrom: Date,
    private readonly validUntil: Date | null,
    private readonly note: string | null,
    private readonly contextSummary: string | null,
    private readonly context: AvailabilityContext,
    private readonly confidence: number | null,
    private readonly reportedById: string,
    private readonly createdAt: Date,
    private readonly updatedAt: Date,
  ) {}

  static create(input: FacilityAvailabilityReportCreateInput): FacilityAvailabilityReport {
    availabilityStatusSchema.parse(input.status)
    confidenceSchema.parse(input.confidence ?? undefined)

    const context = AvailabilityContext.create(input.contextDetails ?? [])
    const now = new Date()

    return new FacilityAvailabilityReport(
      crypto.randomUUID(),
      input.facilityId,
      input.status,
      input.validFrom ?? now,
      input.validUntil ?? null,
      input.note?.trim() ? input.note.trim() : null,
      input.contextSummary?.trim() ? input.contextSummary.trim() : null,
      context,
      input.confidence ?? null,
      input.reportedById,
      now,
      now,
    )
  }

  static fromData(data: FacilityAvailabilityReportData): FacilityAvailabilityReport {
    const context = AvailabilityContext.create(data.contextDetails)
    const confidence = data.confidence ?? null

    return new FacilityAvailabilityReport(
      data.id,
      data.facilityId,
      mapStatus(data.status),
      data.validFrom,
      data.validUntil,
      data.note ?? null,
      data.contextSummary ?? null,
      context,
      confidence,
      data.reportedById,
      data.createdAt,
      data.updatedAt,
    )
  }

  getId(): string {
    return this.id
  }

  getFacilityId(): string {
    return this.facilityId
  }

  getStatus(): AvailabilityStatus {
    return this.status
  }

  getValidFrom(): Date {
    return this.validFrom
  }

  getValidUntil(): Date | null {
    return this.validUntil
  }

  getNote(): string | null {
    return this.note
  }

  getContextSummary(): string | null {
    return this.contextSummary
  }

  getContext(): AvailabilityContext {
    return this.context
  }

  getConfidence(): number | null {
    return this.confidence
  }

  getReportedById(): string {
    return this.reportedById
  }

  getCreatedAt(): Date {
    return this.createdAt
  }

  getUpdatedAt(): Date {
    return this.updatedAt
  }

  toPersistence(): FacilityAvailabilityReportData {
    return {
      id: this.id,
      facilityId: this.facilityId,
      status: this.status,
      validFrom: this.validFrom,
      validUntil: this.validUntil,
      note: this.note,
      contextSummary: this.contextSummary,
      contextDetails: this.context.toJSON(),
      confidence: this.confidence,
      reportedById: this.reportedById,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
