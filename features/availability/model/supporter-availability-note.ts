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

export type SupporterAvailabilityNoteData = {
  id: string
  facilityId: string
  supporterId: string
  planId: string | null
  clientId: string | null
  status: string
  intent: string | null
  note: string | null
  contextSummary: string | null
  contextDetails: AvailabilityContextData
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}

const intentSchema = z.string().trim().max(30).optional()

type SupporterAvailabilityNoteCreateInput = {
  facilityId: string
  supporterId: string
  status: AvailabilityStatus
  planId?: string | null
  clientId?: string | null
  intent?: string | null
  note?: string | null
  contextSummary?: string | null
  contextDetails?: AvailabilityContextData
  expiresAt: Date
}

export class SupporterAvailabilityNote {
  private constructor(
    private readonly id: string,
    private readonly facilityId: string,
    private readonly supporterId: string,
    private readonly planId: string | null,
    private readonly clientId: string | null,
    private readonly status: AvailabilityStatus,
    private readonly intent: string | null,
    private readonly note: string | null,
    private readonly contextSummary: string | null,
    private readonly context: AvailabilityContext,
    private readonly expiresAt: Date,
    private readonly createdAt: Date,
    private readonly updatedAt: Date,
  ) {}

  static create(input: SupporterAvailabilityNoteCreateInput): SupporterAvailabilityNote {
    availabilityStatusSchema.parse(input.status)
    intentSchema.parse(input.intent ?? undefined)

    const context = AvailabilityContext.create(input.contextDetails ?? [])
    const now = new Date()

    return new SupporterAvailabilityNote(
      crypto.randomUUID(),
      input.facilityId,
      input.supporterId,
      input.planId ?? null,
      input.clientId ?? null,
      input.status,
      input.intent?.trim() ? input.intent.trim() : 'general',
      input.note?.trim() ? input.note.trim() : null,
      input.contextSummary?.trim() ? input.contextSummary.trim() : null,
      context,
      input.expiresAt,
      now,
      now,
    )
  }

  static fromData(data: SupporterAvailabilityNoteData): SupporterAvailabilityNote {
    const context = AvailabilityContext.create(data.contextDetails)

    return new SupporterAvailabilityNote(
      data.id,
      data.facilityId,
      data.supporterId,
      data.planId,
      data.clientId,
      mapStatus(data.status),
      data.intent ?? 'general',
      data.note ?? null,
      data.contextSummary ?? null,
      context,
      data.expiresAt,
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

  getSupporterId(): string {
    return this.supporterId
  }

  getPlanId(): string | null {
    return this.planId
  }

  getClientId(): string | null {
    return this.clientId
  }

  getStatus(): AvailabilityStatus {
    return this.status
  }

  getIntent(): string | null {
    return this.intent
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

  getExpiresAt(): Date {
    return this.expiresAt
  }

  getCreatedAt(): Date {
    return this.createdAt
  }

  getUpdatedAt(): Date {
    return this.updatedAt
  }

  toPersistence(): SupporterAvailabilityNoteData {
    return {
      id: this.id,
      facilityId: this.facilityId,
      supporterId: this.supporterId,
      planId: this.planId,
      clientId: this.clientId,
      status: this.status,
      intent: this.intent,
      note: this.note,
      contextSummary: this.contextSummary,
      contextDetails: this.context.toJSON(),
      expiresAt: this.expiresAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
