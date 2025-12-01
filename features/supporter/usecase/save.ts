import { getOrCreateDefaultTenant } from '@/features/supporter/infra/repository/tenant-repository'
import { Supporter } from '@/features/supporter/core/model'
import { supporterRepository } from '@/features/supporter/infra/repository/supporter-repository'

export type SaveSupporterInput = {
  userId: string
  email: string
  name: string
}

export type SaveSupporterError = {
  type: 'TenantCreationFailed' | 'DatabaseError'
  message: string
}

export async function saveSupporterUseCase(
  input: SaveSupporterInput,
): Promise<undefined | SaveSupporterError> {
  try {
    // デフォルトテナントを取得または作成
    const tenant = await getOrCreateDefaultTenant()

    // Supporterドメインモデルを作成
    const supporter = Supporter.create({
      userId: input.userId,
      tenantId: tenant.id,
      name: input.name,
    })

    // リポジトリで永続化
    await supporterRepository.save(supporter)
    return
  } catch (error) {
    console.error(`❌ Supporter作成に失敗しました: userId=${input.userId}`, error)
    return {
      type: 'DatabaseError',
      message: error instanceof Error ? error.message : 'Database operation failed',
    }
  }
}
