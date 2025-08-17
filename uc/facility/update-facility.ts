import type { FacilityRepository } from '@/domain/facility/repository'
import { facilityRepository } from '@/infra/repositories/facility-repository'

export type UpdateFacilityInput = {
  facilityId: string
  name: string
  nameKana?: string | null
  description?: string | null
  serviceType?: string | null
  phone?: string | null
  fax?: string | null
  email?: string | null
  website?: string | null
  address?: string | null
  postalCode?: string | null
  accessInfo?: string | null
}

export type UpdateFacilityError =
  | { type: 'NotFound'; message: string }
  | { type: 'ValidationError'; message: string }
  | { type: 'UnexpectedError'; message: string }

export async function updateFacility(
  input: UpdateFacilityInput,
): Promise<{ success: true } | UpdateFacilityError> {
  try {
    const repository: FacilityRepository = facilityRepository
    const facility = await repository.findById(input.facilityId)

    if (!facility) {
      return {
        type: 'NotFound',
        message: '施設が見つかりません',
      }
    }

    // 基本情報更新（ドメイン層でバリデーション）
    const updateSuccess = facility.updateBasicInfo({
      name: input.name,
      nameKana: input.nameKana,
      description: input.description,
      serviceType: input.serviceType,
    })

    if (!updateSuccess) {
      return {
        type: 'ValidationError',
        message: '入力内容に誤りがあります。施設名称を確認してください。',
      }
    }

    // 連絡先更新
    facility.updateContact({
      phone: input.phone,
      fax: input.fax,
      email: input.email,
      website: input.website,
    })

    // 場所情報更新
    facility.updateLocation({
      address: input.address,
      postalCode: input.postalCode,
      accessInfo: input.accessInfo,
    })

    await repository.save(facility)

    return { success: true }
  } catch (error) {
    console.error('Failed to update facility:', error)
    return {
      type: 'UnexpectedError',
      message: '施設情報の更新に失敗しました',
    }
  }
}
