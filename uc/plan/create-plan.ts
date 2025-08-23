import { Plan, type PlanError } from '@/domain/plan/model'
import type { PlanRepository, PlanRepositoryError } from '@/domain/plan/repository'
import { planRepository as defaultPlanRepository } from '@/infra/repositories/plan-repository'

type ServiceInput = {
  serviceCategory: string
  serviceType: string
  desiredAmount?: string
  desiredLifeByService?: string
  achievementPeriod?: string
}

type CreatePlanInput = {
  tenantId: string
  clientId: string
  supporterId: string
  desiredLife?: string
  troubles?: string
  considerations?: string
  services?: ServiceInput[]
}

type CreatePlanError = PlanRepositoryError | PlanError

/**
 * クライアントの計画書を作成または新しいバージョンを追加
 * - 既存の計画書がある場合: 新しいバージョンを追加
 * - 既存の計画書がない場合: 新規計画書を作成（バージョン1）
 */
export async function createPlanUseCase(
  input: CreatePlanInput,
  repository: PlanRepository = defaultPlanRepository,
): Promise<Plan | CreatePlanError> {
  // 既存の計画書を確認
  const existingPlansResult = await repository.findByClientId(input.clientId)

  let plan: Plan

  if (!('type' in existingPlansResult) && existingPlansResult.length > 0) {
    // 既存の計画書がある場合
    plan = existingPlansResult[0] as Plan
  } else {
    // 新規計画書を作成
    plan = Plan.create({
      tenantId: input.tenantId,
      clientId: input.clientId,
    })
  }

  // 新しいバージョンを作成（サービスも含めて）
  const newPlanResult = plan.createNewVersion({
    createdBy: input.supporterId,
    desiredLife: input.desiredLife,
    troubles: input.troubles,
    considerations: input.considerations,
    reasonForUpdate: '新規作成',
    services: input.services,
  })

  if (!(newPlanResult instanceof Plan)) {
    return newPlanResult
  }

  plan = newPlanResult

  // 保存
  const saveResult = await repository.save(plan)
  if (saveResult) {
    return saveResult
  }

  return plan
}
