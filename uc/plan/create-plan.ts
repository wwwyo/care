import { Plan, type PlanError, PlanService, PlanVersion } from '@/domain/plan/model'
import type { PlanRepository, PlanRepositoryError } from '@/domain/plan/repository'
import { ServiceCategory } from '@/domain/plan/service-category'
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
  let version: PlanVersion

  if (!('type' in existingPlansResult) && existingPlansResult.length > 0) {
    // 既存の計画書がある場合、新しいバージョンを追加
    const existingPlan = existingPlansResult[0]
    if (!existingPlan) {
      return {
        type: 'NotFound',
        message: 'Plan not found',
      }
    }

    const newPlanResult = existingPlan.createNewVersion({
      createdBy: input.supporterId,
      desiredLife: input.desiredLife,
      troubles: input.troubles,
      considerations: input.considerations,
      reasonForUpdate: '新規作成',
    })

    if (!(newPlanResult instanceof Plan)) {
      return newPlanResult
    }

    plan = newPlanResult
    version = plan.versions[plan.versions.length - 1] as PlanVersion
  } else {
    // 新規計画書を作成
    plan = Plan.create({
      tenantId: input.tenantId,
      clientId: input.clientId,
    })

    version = PlanVersion.create({
      planId: plan.id,
      versionNumber: 1,
      createdBy: input.supporterId,
      desiredLife: input.desiredLife,
      troubles: input.troubles,
      considerations: input.considerations,
    })

    const addResult = plan.addVersion(version)
    if (!(addResult instanceof Plan)) {
      return addResult
    }
    plan = addResult
  }

  // サービスを追加
  if (input.services && input.services.length > 0 && version) {
    let updatedVersion = version
    for (const serviceInput of input.services) {
      // ServiceCategoryのValue Objectを使って適切な値に変換
      const serviceCategory = ServiceCategory.fromString(serviceInput.serviceCategory)

      const service = PlanService.create({
        planVersionId: updatedVersion.id,
        serviceCategory,
        serviceType: serviceInput.serviceType,
        desiredAmount: serviceInput.desiredAmount,
        desiredLifeByService: serviceInput.desiredLifeByService,
        achievementPeriod: serviceInput.achievementPeriod,
      })

      const addServiceResult = updatedVersion.addService(service)
      if (!(addServiceResult instanceof PlanVersion)) {
        return addServiceResult
      }
      updatedVersion = addServiceResult
    }

    // 更新されたバージョンでplanを再構築
    const versionIndex = plan.versions.findIndex((v) => v.id === version.id)
    if (versionIndex !== -1) {
      const updatedVersions = [...plan.versions]
      updatedVersions[versionIndex] = updatedVersion

      plan = Plan.fromPersistence({
        id: plan.id,
        tenantId: plan.tenantId,
        clientId: plan.clientId,
        currentVersionId: plan.currentVersionId,
        status: plan.status,
        versions: updatedVersions,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
      })
    }
  }

  // 保存
  const saveResult = await repository.save(plan)
  if (saveResult) {
    return saveResult
  }

  return plan
}
