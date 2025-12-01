import type { FacilityStaff } from './model'

export interface FacilityStaffRepository {
  save(facilityStaff: FacilityStaff): Promise<void>
  findById(id: string): Promise<FacilityStaff | null>
  findByUserId(userId: string): Promise<FacilityStaff | null>
}
