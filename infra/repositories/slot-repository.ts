import { Slot, type SlotData } from '@/domain/slot/model'
import type { SlotRepository } from '@/domain/slot/repository'
import { prisma } from '@/lib/prisma'

async function findByFacilityId(facilityId: string): Promise<Slot | null> {
  const slot = await prisma.slot.findFirst({
    where: { facilityId },
    orderBy: { updatedAt: 'desc' },
  })

  if (!slot) {
    return null
  }

  return Slot.fromData(slot as SlotData)
}

async function save(slot: Slot): Promise<void> {
  const facilityId = slot.getFacilityId()

  // ドメインモデルから必要なデータを取得
  const slotData = {
    status: slot.getStatus(),
    comment: slot.getComment(),
    updatedBy: slot.getUpdatedBy(),
    updatedAt: slot.getUpdatedAt(),
  }

  // 既存のスロットを確認
  const existingSlot = await prisma.slot.findFirst({
    where: { facilityId },
  })

  if (existingSlot) {
    // 既存のスロットを更新
    await prisma.slot.update({
      where: { id: existingSlot.id },
      data: slotData,
    })
  } else {
    // 新規スロットを作成
    await prisma.slot.create({
      data: {
        id: slot.getId(),
        facilityId,
        ...slotData,
      },
    })
  }
}

async function deleteById(id: string): Promise<void> {
  await prisma.slot.delete({
    where: { id },
  })
}

/**
 * スロットリポジトリの実装
 */
export const slotRepository: SlotRepository = {
  findByFacilityId,
  save,
  delete: deleteById,
}
