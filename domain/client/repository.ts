import type { Client } from './model'

/**
 * クライアントリポジトリインターフェース
 * インフラ層で実装される
 */
export interface ClientRepository {
  /**
   * クライアントを保存（新規作成または更新）
   */
  save: (client: Client) => Promise<{ type: 'success' } | { type: 'SaveError'; message: string }>

  /**
   * IDでクライアントを取得
   */
  findById: (id: string) => Promise<Client | null>

  /**
   * サポーターIDでクライアントを取得
   */
  findBySupporterId: (supporterId: string) => Promise<Client[]>

  /**
   * クライアントを削除
   */
  delete: (id: string) => Promise<void>
}
