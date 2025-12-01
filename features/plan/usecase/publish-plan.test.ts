import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { Plan, PlanVersion } from '@/features/plan/core/model'
import type { PlanRepository } from '@/features/plan/core/repository'
import { publishPlanUseCase } from './publish-plan'

describe('publishPlanUseCase', () => {
  let mockPlanRepository: PlanRepository
  let existingPlan: Plan

  beforeEach(() => {
    // 既存の計画書を作成
    const plan = Plan.create({
      tenantId: 'tenant-123',
      clientId: 'client-456',
    })

    if ('type' in plan) {
      throw new Error('Failed to create plan')
    }

    existingPlan = plan

    const version = PlanVersion.create({
      planId: existingPlan.id,
      versionNumber: 1,
      createdBy: 'supporter-789',
      desiredLife: '毎日作業所に通いたい',
      troubles: '一人で通えない',
      considerations: '送迎が必要',
    })

    const planWithVersion = existingPlan.addVersion(version)
    if ('type' in planWithVersion) {
      throw new Error('Failed to add version')
    }

    existingPlan = planWithVersion

    mockPlanRepository = {
      save: mock(() => Promise.resolve(undefined)),
      delete: mock(() => Promise.resolve(undefined)),
      findById: mock(() => Promise.resolve(existingPlan)),
      findByClientId: mock(() => Promise.resolve([])),
    }
  })

  it('下書きの計画書を確定版にできる', async () => {
    const result = await publishPlanUseCase(
      {
        planId: existingPlan.id,
        versionId: existingPlan.versions[0]?.id ?? '',
      },
      mockPlanRepository,
    )

    expect(result).not.toHaveProperty('type')
    expect(mockPlanRepository.save).toHaveBeenCalledTimes(1)

    const savedPlan = (mockPlanRepository.save as ReturnType<typeof mock>).mock
      .calls[0]?.[0] as Plan
    expect(savedPlan.status).toBe('published')

    const publishedVersion = savedPlan.versions[0]
    expect(publishedVersion?.versionType).toBe('published')
  })

  it('存在しない計画書IDの場合はNotFoundエラー', async () => {
    mockPlanRepository.findById = mock(() =>
      Promise.resolve({
        type: 'NotFound' as const,
        message: 'Plan not found',
      }),
    )

    const result = await publishPlanUseCase(
      {
        planId: 'non-existent',
        versionId: 'version-123',
      },
      mockPlanRepository,
    )

    expect(result).toEqual({
      type: 'NotFound',
      message: 'Plan not found',
    })
  })

  it('存在しないバージョンIDの場合はNotFoundエラー', async () => {
    const result = await publishPlanUseCase(
      {
        planId: existingPlan.id,
        versionId: 'non-existent-version',
      },
      mockPlanRepository,
    )

    expect(result).toEqual({
      type: 'NotFound',
      message: 'Version not found',
    })
  })

  it('すでに確定版の場合はValidationError', async () => {
    // 確定版の計画書を作成
    const publishedPlan = existingPlan.publish(existingPlan.versions[0]?.id ?? '')
    if ('type' in publishedPlan) {
      throw new Error('Failed to publish plan')
    }
    mockPlanRepository.findById = mock(() => Promise.resolve(publishedPlan))

    const result = await publishPlanUseCase(
      {
        planId: publishedPlan.id,
        versionId: publishedPlan.versions[0]?.id ?? '',
      },
      mockPlanRepository,
    )

    expect(result).toEqual({
      type: 'ValidationError',
      message: 'Version is already published',
    })
  })

  it('リポジトリでエラーが発生した場合はエラーを返す', async () => {
    mockPlanRepository.save = mock(() =>
      Promise.resolve({
        type: 'UnknownError' as const,
        message: 'Database error',
      }),
    )

    const result = await publishPlanUseCase(
      {
        planId: existingPlan.id,
        versionId: existingPlan.versions[0]?.id ?? '',
      },
      mockPlanRepository,
    )

    expect(result).toEqual({
      type: 'UnknownError',
      message: 'Database error',
    })
  })
})
