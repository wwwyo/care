import { Plan, type PlanError, PlanVersion } from '@/domain/plan/model'
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

  // バージョンを探す
  const versionIndex = planResult.versions.findIndex((v) => v.id === input.versionId)
  if (versionIndex === -1) {
    return {
      type: 'NotFound',
      message: 'Version not found',
    }
  }

  const version = planResult.versions[versionIndex]
  if (!version) {
    return {
      type: 'NotFound',
      message: 'Version not found',
    }
  }

  let updatedPlan: Plan

  // 更新可能かチェック
  if (version.canUpdate()) {
    // 下書きの場合は現在のバージョンを更新
    const updateResult = version.update({
      desiredLife: input.desiredLife,
      troubles: input.troubles,
      considerations: input.considerations,
    })

    // PlanVersionのインスタンスでなければエラー
    if (!(updateResult instanceof PlanVersion)) {
      return updateResult
    }

    // 更新したバージョンで計画書を再構築
    const updatedVersions = [...planResult.versions]
    updatedVersions[versionIndex] = updateResult

    updatedPlan = Plan.fromPersistence({
      id: planResult.id,
      tenantId: planResult.tenantId,
      clientId: planResult.clientId,
      currentVersionId: planResult.currentVersionId,
      status: planResult.status,
      versions: updatedVersions,
      createdAt: planResult.createdAt,
      updatedAt: new Date(),
    })
  } else {
    // 確定版の場合は新しいバージョンを作成
    const newVersionResult = planResult.createNewVersion({
      createdBy: supporterId,
      desiredLife: input.desiredLife,
      troubles: input.troubles,
      considerations: input.considerations,
      reasonForUpdate: '確定版からの変更',
    })

    // Planのインスタンスでなければエラー
    if (!(newVersionResult instanceof Plan)) {
      return newVersionResult
    }

    updatedPlan = newVersionResult
  }

  // 保存
  const saveResult = await repository.save(updatedPlan)
  if (saveResult) {
    return saveResult
  }

  return updatedPlan
}
