import { Plan, type PlanError } from '@/features/plan/core/model'
import type { PlanRepository, PlanRepositoryError } from '@/features/plan/core/repository'
import { planRepository as defaultPlanRepository } from '@/features/plan/infra/repository/plan-repository'

type PublishPlanInput = {
  planId: string
  versionId: string
}

type PublishPlanError = PlanRepositoryError | PlanError

export async function publishPlanUseCase(
  input: PublishPlanInput,
  repository: PlanRepository = defaultPlanRepository,
): Promise<Plan | PublishPlanError> {
  // 計画書を取得
  const planResult = await repository.findById(input.planId)
  // Planのインスタンスでなければエラー
  if (!(planResult instanceof Plan)) {
    return planResult
  }

  // バージョンを探す
  const version = planResult.versions.find((v) => v.id === input.versionId)
  if (!version) {
    return {
      type: 'NotFound',
      message: 'Version not found',
    }
  }

  // すでに確定版の場合はエラー
  if (version.versionType === 'published') {
    return {
      type: 'ValidationError',
      message: 'Version is already published',
    }
  }

  // 計画書を確定版にする
  const publishResult = planResult.publish(input.versionId)
  // Planのインスタンスでなければエラー
  if (!(publishResult instanceof Plan)) {
    return publishResult
  }
  const publishedPlan = publishResult

  // 保存
  const saveResult = await repository.save(publishedPlan)
  if (saveResult) {
    return saveResult
  }

  return publishedPlan
}
