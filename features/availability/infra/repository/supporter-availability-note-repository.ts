import { AvailabilityContext } from '@/features/availability/model/context'
import type { SupporterAvailabilityNoteRepository } from '@/features/availability/model/repository'
import { SupporterAvailabilityNote } from '@/features/availability/model/supporter-availability-note'
import { prisma } from '@/lib/prisma'

type SupporterAvailabilityRecord = NonNullable<Awaited<ReturnType<typeof prisma.supporterAvailabilityNote.findFirst>>>

type SupporterAvailabilityListRecord = Awaited<ReturnType<typeof prisma.supporterAvailabilityNote.findMany>>[number]

function toDomain(record: SupporterAvailabilityRecord | SupporterAvailabilityListRecord): SupporterAvailabilityNote {
  const contextDetails = AvailabilityContext.create(record.contextDetails ?? []).toJSON()

  return SupporterAvailabilityNote.fromData({
    id: record.id,
    facilityId: record.facilityId,
    supporterId: record.supporterId,
    planId: record.planId,
    clientId: record.clientId,
    status: record.status,
    intent: record.intent,
    note: record.note,
    contextSummary: record.contextSummary,
    contextDetails,
    expiresAt: record.expiresAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  })
}

async function save(note: SupporterAvailabilityNote): Promise<void> {
  const data = note.toPersistence()

  await prisma.supporterAvailabilityNote.create({
    data,
  })
}

async function findActiveByFacility(
  facilityId: string,
  options?: { asOf?: Date },
): Promise<SupporterAvailabilityNote[]> {
  const now = options?.asOf ?? new Date()

  const records = await prisma.supporterAvailabilityNote.findMany({
    where: {
      facilityId,
      expiresAt: {
        gte: now,
      },
    },
    orderBy: [{ createdAt: 'desc' }, { updatedAt: 'desc' }],
  })

  return records.map(toDomain)
}

async function findActiveByFacilityForClient(
  facilityId: string,
  clientId: string,
  options?: { asOf?: Date },
): Promise<SupporterAvailabilityNote[]> {
  const now = options?.asOf ?? new Date()

  const records = await prisma.supporterAvailabilityNote.findMany({
    where: {
      facilityId,
      clientId,
      expiresAt: {
        gte: now,
      },
    },
    orderBy: [{ createdAt: 'desc' }, { updatedAt: 'desc' }],
  })

  return records.map(toDomain)
}

export const supporterAvailabilityNoteRepository: SupporterAvailabilityNoteRepository = {
  save,
  findActiveByFacility,
  findActiveByFacilityForClient,
}
