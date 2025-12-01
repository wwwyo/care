import { AvailabilityContext } from '@/features/availability/model/context'
import { FacilityAvailabilityReport } from '@/features/availability/model/facility-availability-report'
import type { FacilityAvailabilityReportRepository } from '@/features/availability/model/repository'
import { prisma } from '@/lib/prisma'

type FacilityAvailabilityRecord = NonNullable<
  Awaited<ReturnType<typeof prisma.facilityAvailabilityReport.findFirst>>
>

type FacilityAvailabilityListRecord = Awaited<
  ReturnType<typeof prisma.facilityAvailabilityReport.findMany>
>[number]

function toDomain(
  record: FacilityAvailabilityRecord | FacilityAvailabilityListRecord,
): FacilityAvailabilityReport {
  const contextDetails = AvailabilityContext.create(record.contextDetails ?? []).toJSON()

  return FacilityAvailabilityReport.fromData({
    id: record.id,
    facilityId: record.facilityId,
    status: record.status,
    validFrom: record.validFrom,
    validUntil: record.validUntil,
    note: record.note,
    contextSummary: record.contextSummary,
    contextDetails,
    confidence: record.confidence,
    reportedById: record.reportedById,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  })
}

async function save(report: FacilityAvailabilityReport): Promise<void> {
  const data = report.toPersistence()

  await prisma.facilityAvailabilityReport.create({
    data,
  })
}

async function findLatestByFacility(
  facilityId: string,
): Promise<FacilityAvailabilityReport | null> {
  const now = new Date()

  const record = await prisma.facilityAvailabilityReport.findFirst({
    where: {
      facilityId,
      OR: [{ validUntil: null }, { validUntil: { gte: now } }],
    },
    orderBy: [{ validFrom: 'desc' }, { createdAt: 'desc' }],
  })

  if (!record) {
    return null
  }

  return toDomain(record)
}

async function findAllByFacility(facilityId: string): Promise<FacilityAvailabilityReport[]> {
  const now = new Date()

  const records = await prisma.facilityAvailabilityReport.findMany({
    where: {
      facilityId,
      OR: [{ validUntil: null }, { validUntil: { gte: now } }],
    },
    orderBy: [{ validFrom: 'desc' }, { createdAt: 'desc' }],
  })

  return records.map(toDomain)
}

export const facilityAvailabilityReportRepository: FacilityAvailabilityReportRepository = {
  save,
  findLatestByFacility,
  findAllByFacility,
}
