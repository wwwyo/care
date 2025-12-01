import type { Facility } from './model'

/**
 * 施設リポジトリインターフェース
 * インフラ層で実装される
 */
export interface FacilityRepository {
  /**
   * IDで施設を取得
   */
  findById: (id: string) => Promise<Facility | null>

  /**
   * スタッフユーザーIDで施設を取得
   */
  findByStaffUserId: (userId: string) => Promise<Facility | null>

  /**
   * 施設を保存（新規作成または更新）
   */
  save: (facility: Facility) => Promise<void>

  /**
   * 施設を削除
   */
  delete: (id: string) => Promise<void>
}
