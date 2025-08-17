import { Slot, type SlotStatus } from '@/domain/slot/model'
import { facilityRepository } from '@/infra/repositories/facility-repository'
import { slotRepository } from '@/infra/repositories/slot-repository'

export type UpdateSlotStatusInput = {
  facilityId: string
  status: SlotStatus
  comment?: string
  updatedBy: string
}

export type UpdateSlotStatusError =
  | { type: 'NotFound'; message: string }
  | { type: 'ValidationError'; message: string }
  | { type: 'UnexpectedError'; message: string }

export async function updateSlotStatus(
  input: UpdateSlotStatusInput,
): Promise<{ success: true } | UpdateSlotStatusError> {
  try {
    // 施設が存在するか確認
    const facility = await facilityRepository.findById(input.facilityId)

    if (!facility) {
      return {
        type: 'NotFound',
        message: '施設が見つかりません',
      }
    }

    // コメントのバリデーション
    if (input.comment && input.comment.length > 100) {
      return {
        type: 'ValidationError',
        message: 'コメントは100文字以内で入力してください',
      }
    }

    // 既存のスロットを取得または新規作成
    let slot = await slotRepository.findByFacilityId(input.facilityId)

    if (slot) {
      // 既存スロットを更新
      slot.updateStatus(input.status, input.comment)
    } else {
      // 新規スロット作成
      slot = Slot.create(input.facilityId, input.status, input.updatedBy, input.comment)
    }

    await slotRepository.save(slot)

    return { success: true }
  } catch (error) {
    console.error('Failed to update slot status:', error)
    return {
      type: 'UnexpectedError',
      message: '空き状況の更新に失敗しました',
    }
  }
}
