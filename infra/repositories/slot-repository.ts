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

  await prisma.slot.upsert({
    where: { facilityId },
    update: slotData,
    create: {
      id: slot.getId(),
      facilityId,
      ...slotData,
    },
  })
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
