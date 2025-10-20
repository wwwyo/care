import type { FacilityAvailabilityReport } from '@/domain/availability/facility-availability-report'
import type { SupporterAvailabilityNote } from '@/domain/availability/supporter-availability-note'

export interface FacilityAvailabilityReportRepository {
  save(report: FacilityAvailabilityReport): Promise<void>
  findLatestByFacility(facilityId: string): Promise<FacilityAvailabilityReport | null>
  findAllByFacility(facilityId: string): Promise<FacilityAvailabilityReport[]>
}

export interface SupporterAvailabilityNoteRepository {
  save(note: SupporterAvailabilityNote): Promise<void>
  findActiveByFacility(
    facilityId: string,
    options?: { asOf?: Date },
  ): Promise<SupporterAvailabilityNote[]>
  findActiveByFacilityForClient(
    facilityId: string,
    clientId: string,
    options?: { asOf?: Date },
  ): Promise<SupporterAvailabilityNote[]>
}
