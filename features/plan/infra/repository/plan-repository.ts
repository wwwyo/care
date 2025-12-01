import { Plan, PlanService, PlanVersion } from '@/features/plan/core/model'
import type { PlanRepository, PlanRepositoryError } from '@/features/plan/core/repository'
import { Prisma } from '@/lib/generated/prisma/client'
import { prisma } from '@/lib/prisma'

async function save(plan: Plan): Promise<undefined | PlanRepositoryError> {
  try {
    await prisma.$transaction(async (tx) => {
      // Plan本体を保存/更新
      await tx.plan.upsert({
        where: { id: plan.id },
        create: {
          id: plan.id,
          tenantId: plan.tenantId,
          clientId: plan.clientId,
          currentVersionId: plan.currentVersionId,
          status: plan.status,
          createdAt: plan.createdAt,
          updatedAt: plan.updatedAt,
        },
        update: {
          currentVersionId: plan.currentVersionId,
          status: plan.status,
          updatedAt: plan.updatedAt,
        },
      })

      // バージョンを保存
      // 既存のバージョンIDを取得
      const existingVersionIds = await tx.planVersion.findMany({
        where: { planId: plan.id },
        select: { id: true },
      })
      const existingIdSet = new Set(existingVersionIds.map((v) => v.id))

      for (const version of plan.versions) {
        const isNewVersion = !existingIdSet.has(version.id)

        if (isNewVersion) {
          // 新規バージョンを作成
          await tx.planVersion.create({
            data: {
              id: version.id,
              planId: version.planId,
              versionNumber: version.versionNumber,
              versionType: version.versionType,
              desiredLife: version.desiredLife,
              troubles: version.troubles,
              considerations: version.considerations,
              createdBy: version.createdBy,
              reasonForUpdate: version.reasonForUpdate,
              createdAt: version.createdAt,
              updatedAt: version.updatedAt,
            },
          })

          // サービスを保存
          for (const service of version.services) {
            await tx.planService.create({
              data: {
                id: service.id,
                planVersionId: service.planVersionId,
                serviceCategory: service.serviceCategory,
                serviceType: service.serviceType,
                desiredAmount: service.desiredAmount,
                desiredLifeByService: service.desiredLifeByService,
                achievementPeriod: service.achievementPeriod,
                createdAt: service.createdAt,
                updatedAt: service.updatedAt,
              },
            })
          }
        } else {
          // 既存バージョンを更新
          await tx.planVersion.update({
            where: { id: version.id },
            data: {
              versionType: version.versionType,
              desiredLife: version.desiredLife,
              troubles: version.troubles,
              considerations: version.considerations,
              reasonForUpdate: version.reasonForUpdate,
              updatedAt: version.updatedAt,
            },
          })

          // サービスを更新（一旦削除して再作成）
          await tx.planService.deleteMany({
            where: { planVersionId: version.id },
          })

          for (const service of version.services) {
            await tx.planService.create({
              data: {
                id: service.id,
                planVersionId: service.planVersionId,
                serviceCategory: service.serviceCategory,
                serviceType: service.serviceType,
                desiredAmount: service.desiredAmount,
                desiredLifeByService: service.desiredLifeByService,
                achievementPeriod: service.achievementPeriod,
                createdAt: service.createdAt,
                updatedAt: service.updatedAt,
              },
            })
          }
        }
      }
    })
    return
  } catch (error) {
    console.error('Failed to save plan:', error)
    return {
      type: 'UnknownError',
      message: 'Failed to save plan',
    }
  }
}

async function findById(id: string): Promise<Plan | PlanRepositoryError> {
  try {
    const planData = await prisma.plan.findUnique({
      where: { id },
      include: {
        versions: {
          include: {
            services: true,
          },
          orderBy: {
            versionNumber: 'asc',
          },
        },
      },
    })

    if (!planData) {
      return {
        type: 'NotFound',
        message: 'Plan not found',
      }
    }

    const versions = planData.versions.map((versionData) => {
      const services = versionData.services.map((serviceData) =>
        PlanService.fromPersistence({
          id: serviceData.id,
          planVersionId: serviceData.planVersionId,
          serviceCategory: serviceData.serviceCategory as
            | 'home'
            | 'residential'
            | 'daytime'
            | 'other'
            | 'child',
          serviceType: serviceData.serviceType,
          desiredAmount: serviceData.desiredAmount,
          desiredLifeByService: serviceData.desiredLifeByService,
          achievementPeriod: serviceData.achievementPeriod,
          createdAt: serviceData.createdAt,
          updatedAt: serviceData.updatedAt,
        }),
      )

      return PlanVersion.fromPersistence({
        id: versionData.id,
        planId: versionData.planId,
        versionNumber: versionData.versionNumber,
        versionType: versionData.versionType as 'draft' | 'published',
        desiredLife: versionData.desiredLife,
        troubles: versionData.troubles,
        considerations: versionData.considerations,
        services,
        createdBy: versionData.createdBy,
        reasonForUpdate: versionData.reasonForUpdate,
        createdAt: versionData.createdAt,
        updatedAt: versionData.updatedAt,
      })
    })

    return Plan.fromPersistence({
      id: planData.id,
      tenantId: planData.tenantId,
      clientId: planData.clientId,
      currentVersionId: planData.currentVersionId,
      status: planData.status as 'draft' | 'published',
      versions,
      createdAt: planData.createdAt,
      updatedAt: planData.updatedAt,
    })
  } catch (error) {
    console.error('Failed to find plan by id:', error)
    return {
      type: 'UnknownError',
      message: 'Failed to find plan',
    }
  }
}

async function findByClientId(clientId: string): Promise<Plan[] | PlanRepositoryError> {
  try {
    const plansData = await prisma.plan.findMany({
      where: { clientId },
      include: {
        versions: {
          include: {
            services: true,
          },
          orderBy: {
            versionNumber: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const plans = plansData.map((planData) => {
      const versions = planData.versions.map((versionData) => {
        const services = versionData.services.map((serviceData) =>
          PlanService.fromPersistence({
            id: serviceData.id,
            planVersionId: serviceData.planVersionId,
            serviceCategory: serviceData.serviceCategory as
              | 'home'
              | 'residential'
              | 'daytime'
              | 'other'
              | 'child',
            serviceType: serviceData.serviceType,
            desiredAmount: serviceData.desiredAmount,
            desiredLifeByService: serviceData.desiredLifeByService,
            achievementPeriod: serviceData.achievementPeriod,
            createdAt: serviceData.createdAt,
            updatedAt: serviceData.updatedAt,
          }),
        )

        return PlanVersion.fromPersistence({
          id: versionData.id,
          planId: versionData.planId,
          versionNumber: versionData.versionNumber,
          versionType: versionData.versionType as 'draft' | 'published',
          desiredLife: versionData.desiredLife,
          troubles: versionData.troubles,
          considerations: versionData.considerations,
          services,
          createdBy: versionData.createdBy,
          reasonForUpdate: versionData.reasonForUpdate,
          createdAt: versionData.createdAt,
          updatedAt: versionData.updatedAt,
        })
      })

      return Plan.fromPersistence({
        id: planData.id,
        tenantId: planData.tenantId,
        clientId: planData.clientId,
        currentVersionId: planData.currentVersionId,
        status: planData.status as 'draft' | 'published',
        versions,
        createdAt: planData.createdAt,
        updatedAt: planData.updatedAt,
      })
    })

    return plans
  } catch (error) {
    console.error('Failed to find plans by client id:', error)
    return {
      type: 'UnknownError',
      message: 'Failed to find plans',
    }
  }
}

async function deletePlan(id: string): Promise<undefined | PlanRepositoryError> {
  try {
    const result = await prisma.plan.delete({
      where: { id },
    })

    if (!result) {
      return {
        type: 'NotFound',
        message: 'Plan not found',
      }
    }
    return
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return {
        type: 'NotFound',
        message: 'Plan not found',
      }
    }
    console.error('Failed to delete plan:', error)
    return {
      type: 'UnknownError',
      message: 'Failed to delete plan',
    }
  }
}

export const planRepository: PlanRepository = {
  save,
  delete: deletePlan,
  findById,
  findByClientId,
}
