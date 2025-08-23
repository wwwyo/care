import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { type Plan, PlanVersion } from '@/domain/plan/model'
import type { PlanRepository } from '@/domain/plan/repository'
import { createPlanUseCase } from './create-plan'

describe('createPlanUseCase', () => {
  let mockPlanRepository: PlanRepository

  beforeEach(() => {
    mockPlanRepository = {
      save: mock(() => Promise.resolve()),
      delete: mock(() => Promise.resolve()),
      findById: mock(() => Promise.resolve({ type: 'NotFound', message: 'Not found' })),
      findByClientId: mock(() => Promise.resolve([])),
    }
  })

  it('新規計画書を作成できる', async () => {
    const result = await createPlanUseCase(
      {
        tenantId: 'tenant-123',
        clientId: 'client-456',
        supporterId: 'supporter-789',
        desiredLife: '毎日作業所に通いたい',
        troubles: '一人で通えない',
        considerations: '送迎が必要',
      },
      mockPlanRepository,
    )

    expect(result).not.toHaveProperty('type')
    expect(mockPlanRepository.save).toHaveBeenCalledTimes(1)

    const savedPlan = (mockPlanRepository.save as any).mock.calls[0][0] as Plan
    expect(savedPlan.tenantId).toBe('tenant-123')
    expect(savedPlan.clientId).toBe('client-456')
    expect(savedPlan.status).toBe('draft')
    expect(savedPlan.versions).toHaveLength(1)

    const version = savedPlan.versions[0]
    expect(version.versionNumber).toBe(1)
    expect(version.versionType).toBe('draft')
    expect(version.desiredLife).toBe('毎日作業所に通いたい')
    expect(version.troubles).toBe('一人で通えない')
    expect(version.considerations).toBe('送迎が必要')
    expect(version.createdBy).toBe('supporter-789')
  })

  it('最小限の情報でも計画書を作成できる', async () => {
    const result = await createPlanUseCase(
      {
        tenantId: 'tenant-123',
        clientId: 'client-456',
        supporterId: 'supporter-789',
      },
      mockPlanRepository,
    )

    expect(result).not.toHaveProperty('type')
    expect(mockPlanRepository.save).toHaveBeenCalledTimes(1)

    const savedPlan = (mockPlanRepository.save as any).mock.calls[0][0] as Plan
    const version = savedPlan.versions[0]
    expect(version.desiredLife).toBeNull()
    expect(version.troubles).toBeNull()
    expect(version.considerations).toBeNull()
  })

  it('リポジトリでエラーが発生した場合はエラーを返す', async () => {
    mockPlanRepository.save = mock(() =>
      Promise.resolve({
        type: 'UnknownError' as const,
        message: 'Database error',
      }),
    )

    const result = await createPlanUseCase(
      {
        tenantId: 'tenant-123',
        clientId: 'client-456',
        supporterId: 'supporter-789',
      },
      mockPlanRepository,
    )

    expect(result).toEqual({
      type: 'UnknownError',
      message: 'Database error',
    })
  })
})
