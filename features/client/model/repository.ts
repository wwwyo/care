import type { Client } from './model'

/**
 * 利用者リポジトリインターフェース
 * インフラ層で実装される
 */
export interface ClientRepository {
  /**
   * 利用者を保存（新規作成または更新）
   */
  save: (client: Client) => Promise<{ type: 'success' } | { type: 'SaveError'; message: string }>

  /**
   * IDで利用者を取得
   */
  findById: (id: string) => Promise<Client | null>

  /**
   * サポーターIDで利用者を取得
   */
  findBySupporterId: (supporterId: string) => Promise<Client[]>

  /**
   * 利用者を削除
   */
  delete: (id: string) => Promise<void>
}
