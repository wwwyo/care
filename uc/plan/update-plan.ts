import { Plan, type PlanError } from '@/domain/plan/model'
import type { PlanRepository, PlanRepositoryError } from '@/domain/plan/repository'
import { planRepository as defaultPlanRepository } from '@/infra/repositories/plan-repository'
import { requireRealm } from '@/lib/auth/helpers'
import { prisma } from '@/lib/prisma'

type ServiceInput = {
  id?: string
  serviceCategory: string
  serviceType: string
  desiredAmount?: string
  desiredLifeByService?: string
  achievementPeriod?: string
}

type UpdatePlanInput = {
  planId: string
  versionId: string
  desiredLife?: string
  troubles?: string
  considerations?: string
  services?: ServiceInput[]
}

type UpdatePlanError = PlanRepositoryError | PlanError

export async function updatePlanUseCase(
  input: UpdatePlanInput & { supporterId?: string },
  repository: PlanRepository = defaultPlanRepository,
): Promise<Plan | UpdatePlanError> {
  // サポーターIDを取得（テスト時は外部から注入、実行時はセッションから取得）
  let supporterId = input.supporterId
  if (!supporterId) {
    const session = await requireRealm('supporter')
    const supporter = await prisma.supporter.findFirst({
      where: {
        userId: session.user.id,
      },
    })

    if (!supporter) {
      return {
        type: 'NotFound',
        message: 'Supporter not found',
      }
    }
    supporterId = supporter.id
  }

  // 計画書を取得
  const planResult = await repository.findById(input.planId)
  // Planのインスタンスでなければエラー
  if (!(planResult instanceof Plan)) {
    return planResult
  }

  // ドメインモデルに更新ロジックを委譲
  const updatedPlan = planResult.updateVersion(input.versionId, {
    desiredLife: input.desiredLife,
    troubles: input.troubles,
    considerations: input.considerations,
    services: input.services,
  })

  // Planのインスタンスでなければエラー
  if (!(updatedPlan instanceof Plan)) {
    return updatedPlan
  }

  // 保存
  const saveResult = await repository.save(updatedPlan)
  if (saveResult) {
    return saveResult
  }

  return updatedPlan
}
