import { Client } from '@/domain/client/model'
import { clientRepository } from '@/infra/repositories/client-repository'

export type SaveClientInput = {
  userId: string
}

export type SaveClientError = {
  type: 'DatabaseError'
  message: string
}

export async function saveClientUseCase(input: SaveClientInput): Promise<void | SaveClientError> {
  try {
    // Clientドメインモデルを作成
    const client = Client.create({
      userId: input.userId,
    })

    // リポジトリで永続化
    await clientRepository.save(client)
  } catch (error) {
    console.error(`❌ Client作成に失敗しました: userId=${input.userId}`, error)
    return {
      type: 'DatabaseError',
      message: error instanceof Error ? error.message : 'Database operation failed',
    }
  }
}
