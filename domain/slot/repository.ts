import type { Slot } from './model'

/**
 * スロットリポジトリインターフェース
 * インフラ層で実装される
 */
export interface SlotRepository {
  /**
   * 施設IDでスロットを取得
   */
  findByFacilityId: (facilityId: string) => Promise<Slot | null>

  /**
   * スロットを保存（新規作成または更新）
   */
  save: (slot: Slot) => Promise<void>

  /**
   * スロットを削除
   */
  delete: (id: string) => Promise<void>
}
