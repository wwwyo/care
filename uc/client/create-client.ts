import type { CreateClientParams } from '@/domain/client/model'
import { Client, type ClientError, isClient } from '@/domain/client/model'
import type { ClientRepository } from '@/domain/client/repository'

type SaveError = { type: 'SaveError'; message: string }

export type CreateClientResult = { type: 'success'; client: Client } | ClientError | SaveError

export async function createClient(
  params: CreateClientParams,
  repository: ClientRepository,
): Promise<CreateClientResult> {
  // ドメインモデルを作成
  const client = Client.create(params)

  // バリデーションエラーの場合は早期リターン
  if (!isClient(client)) {
    return client
  }

  // リポジトリに保存
  const saveResult = await repository.save(client)

  // 保存エラーの場合
  if (saveResult.type !== 'success') {
    return saveResult
  }

  return {
    type: 'success',
    client,
  }
}
