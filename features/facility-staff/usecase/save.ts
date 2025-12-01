import { FacilityStaff } from '@/features/facility-staff/core/model'
import { facilityStaffRepository } from '@/features/facility-staff/infra/repository/facility-staff-repository'

export type SaveFacilityStaffInput = {
  userId: string
  email: string
  name: string
}

export type SaveFacilityStaffError = {
  type: 'DatabaseError'
  message: string
}

export async function saveFacilityStaffUseCase(
  input: SaveFacilityStaffInput,
): Promise<undefined | SaveFacilityStaffError> {
  try {
    // FacilityStaffドメインモデルを作成
    const facilityStaff = FacilityStaff.create({
      userId: input.userId,
    })

    // リポジトリで永続化
    await facilityStaffRepository.save(facilityStaff)
    return
  } catch (error) {
    console.error(`❌ FacilityStaff作成に失敗しました: userId=${input.userId}`, error)
    return {
      type: 'DatabaseError',
      message: error instanceof Error ? error.message : 'Database operation failed',
    }
  }
}
