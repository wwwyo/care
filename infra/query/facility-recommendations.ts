import { type AvailabilityStatus, availabilityStatusSchema } from '@/domain/availability/status'
import type { Prisma } from '@/lib/generated/prisma'
import { prisma } from '@/lib/prisma'

export type FacilityAvailabilityScore = {
  status: AvailabilityStatus | null
  score: number | null
  percent: number | null
}

export type FacilityAvailabilityReportSummary = {
  status: AvailabilityStatus
  note: string | null
  contextSummary: string | null
  validFrom: string
  validUntil: string | null
  updatedAt: string
}

export type SupporterAvailabilityNoteSummary = {
  id: string
  status: AvailabilityStatus
  note: string | null
  contextSummary: string | null
  expiresAt: string
  createdAt: string
}

export type FacilityRecommendation = {
  id: string
  name: string
  serviceType: string | null
  city: string | null
  accessInfo: string | null
  availability: FacilityAvailabilityScore
  facilityReport: FacilityAvailabilityReportSummary | null
  supporterNotes: SupporterAvailabilityNoteSummary[]
}

const facilityStatusWeight = 0.7
const supporterStatusWeight = 0.4
const maxScore = facilityStatusWeight + supporterStatusWeight

const facilitySelect = {
  id: true,
  profile: {
    select: {
      name: true,
    },
  },
  services: {
    select: {
      serviceType: true,
    },
    take: 1,
  },
  location: {
    select: {
      addressCity: true,
      accessInfo: true,
    },
  },
  availabilityReports: {
    orderBy: { validFrom: 'desc' } as const,
    take: 1,
    select: {
      status: true,
      note: true,
      contextSummary: true,
      validFrom: true,
      validUntil: true,
      updatedAt: true,
    },
  },
  supporterAvailabilityNotes: {
    orderBy: { createdAt: 'desc' } as const,
    take: 5,
    select: {
      id: true,
      status: true,
      note: true,
      contextSummary: true,
      expiresAt: true,
      createdAt: true,
    },
  },
} satisfies Prisma.FacilitySelect

type FacilityRecord = Prisma.FacilityGetPayload<{ select: typeof facilitySelect }>

function statusToNumeric(status: AvailabilityStatus): number {
  switch (status) {
    case 'available':
      return 1
    case 'limited':
      return 0.5
    default:
      return 0
  }
}

function scoreToStatus(score: number): AvailabilityStatus {
  if (score >= 0.66) {
    return 'available'
  }
  if (score >= 0.33) {
    return 'limited'
  }
  return 'unavailable'
}

function buildAvailabilityScore(
  report: FacilityAvailabilityReportSummary | null,
  supporterNotes: SupporterAvailabilityNoteSummary[],
): FacilityAvailabilityScore {
  if (!report && supporterNotes.length === 0) {
    return { status: null, score: null, percent: null }
  }

  const facilityScore = report ? facilityStatusWeight * statusToNumeric(report.status) : 0
  const supporterNumericValues = supporterNotes.map((note) => statusToNumeric(note.status))
  const supporterAverage =
    supporterNumericValues.length > 0
      ? supporterNumericValues.reduce((sum, value) => sum + value, 0) /
        supporterNumericValues.length
      : 0

  const supporterScore = supporterAverage * supporterStatusWeight
  const combinedScore = Math.min((facilityScore + supporterScore) / maxScore, 1)

  const status = scoreToStatus(combinedScore)
  const percent = Math.round(combinedScore * 100)

  return {
    status,
    score: combinedScore,
    percent,
  }
}

function mapFacility(facility: FacilityRecord): FacilityRecommendation {
  const reportRecord = facility.availabilityReports[0] ?? null
  const report: FacilityAvailabilityReportSummary | null = reportRecord
    ? {
        status: availabilityStatusSchema.parse(reportRecord.status),
        note: reportRecord.note,
        contextSummary: reportRecord.contextSummary,
        validFrom: reportRecord.validFrom.toISOString(),
        validUntil: reportRecord.validUntil ? reportRecord.validUntil.toISOString() : null,
        updatedAt: reportRecord.updatedAt.toISOString(),
      }
    : null

  const supporterNotes: SupporterAvailabilityNoteSummary[] =
    facility.supporterAvailabilityNotes.map((note) => ({
      id: note.id,
      status: availabilityStatusSchema.parse(note.status),
      note: note.note,
      contextSummary: note.contextSummary,
      expiresAt: note.expiresAt.toISOString(),
      createdAt: note.createdAt.toISOString(),
    }))

  return {
    id: facility.id,
    name: facility.profile?.name ?? '施設名未設定',
    serviceType: facility.services?.[0]?.serviceType ?? null,
    city: facility.location?.addressCity ?? null,
    accessInfo: facility.location?.accessInfo ?? null,
    availability: buildAvailabilityScore(report, supporterNotes),
    facilityReport: report,
    supporterNotes,
  }
}

export async function getFacilityRecommendations(
  serviceType: string,
  limit = 4,
): Promise<FacilityRecommendation[]> {
  const now = new Date()
  const availabilityValidityFilter: Prisma.FacilityAvailabilityReportWhereInput = {
    OR: [{ validUntil: null }, { validUntil: { gte: now } }],
  }

  const facilities = await prisma.facility.findMany({
    where: {
      services: {
        some: {
          serviceType: serviceType as never,
        },
      },
    },
    select: {
      ...facilitySelect,
      availabilityReports: {
        ...facilitySelect.availabilityReports,
        where: availabilityValidityFilter,
      },
      supporterAvailabilityNotes: {
        ...facilitySelect.supporterAvailabilityNotes,
        where: {
          expiresAt: { gte: now },
        },
      },
    },
    take: limit,
  })

  return facilities.map(mapFacility)
}

export async function searchFacilitiesWithSlots(
  serviceTypes: string[],
  limit = 12,
): Promise<FacilityRecommendation[]> {
  if (serviceTypes.length === 0) {
    return []
  }

  const now = new Date()
  const availabilityValidityFilter: Prisma.FacilityAvailabilityReportWhereInput = {
    OR: [{ validUntil: null }, { validUntil: { gte: now } }],
  }

  const facilities = await prisma.facility.findMany({
    where: {
      services: {
        some: {
          serviceType: {
            in: serviceTypes as never[],
          },
        },
      },
    },
    select: {
      ...facilitySelect,
      availabilityReports: {
        ...facilitySelect.availabilityReports,
        where: availabilityValidityFilter,
      },
      supporterAvailabilityNotes: {
        ...facilitySelect.supporterAvailabilityNotes,
        where: {
          expiresAt: { gte: now },
        },
      },
    },
    take: limit,
  })

  return facilities.map(mapFacility)
}
