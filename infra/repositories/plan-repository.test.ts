import { beforeEach, describe, expect, it } from 'bun:test'
import { Plan, PlanService, PlanVersion } from '@/domain/plan/model'
import { prisma } from '@/lib/prisma'
import { planRepository } from './plan-repository'

describe.skip('PlanRepository', () => {
  let testTenantId: string
  let testClientId: string
  let testSupporterId: string

  beforeEach(async () => {
    // 各テストで新しいUUIDを生成
    testTenantId = crypto.randomUUID()
    testClientId = crypto.randomUUID()
    testSupporterId = crypto.randomUUID()
    // テスト用のテナント、クライアント、サポーターを作成
    await prisma.tenant.create({
      data: {
        id: testTenantId,
        name: 'Test Tenant',
      },
    })

    await prisma.client.create({
      data: {
        id: testClientId,
        tenantId: testTenantId,
      },
    })

    // テスト用のユーザーとサポーターを作成
    const testUserId = crypto.randomUUID()
    await prisma.user.create({
      data: {
        id: testUserId,
        name: 'Test User',
        email: `test-${crypto.randomUUID()}@example.com`,
        emailVerified: true,
        realm: 'local',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    await prisma.supporter.create({
      data: {
        id: testSupporterId,
        tenantId: testTenantId,
        userId: testUserId,
      },
    })
  })

  describe('save', () => {
    it('新規Planを保存できる', async () => {
      const plan = Plan.create({
        tenantId: testTenantId,
        clientId: testClientId,
      })

      const result = await planRepository.save(plan)
      expect(result).toBeUndefined()

      // 保存されたことを確認
      const saved = await prisma.plan.findUnique({
        where: { id: plan.id },
      })
      expect(saved).toBeDefined()
      expect(saved?.tenantId).toBe(testTenantId)
      expect(saved?.clientId).toBe(testClientId)
    })

    it('Planとバージョンを一緒に保存できる', async () => {
      const plan = Plan.create({
        tenantId: testTenantId,
        clientId: testClientId,
      })

      const version = PlanVersion.create({
        planId: plan.id,
        versionNumber: 1,
        createdBy: testSupporterId,
        desiredLife: '毎日作業所に通いたい',
        troubles: '一人で通えない',
        considerations: '送迎が必要',
      })

      const service = PlanService.create({
        planVersionId: version.id,
        serviceCategory: 'daytime',
        serviceType: '就労継続支援B型',
        desiredAmount: '週5日',
        desiredLifeByService: '働く習慣をつけたい',
        achievementPeriod: '継続',
      })

      const versionWithService = version.addService(service)
      if ('type' in versionWithService) {
        throw new Error(versionWithService.message)
      }

      const planWithVersion = plan.addVersion(versionWithService)
      if ('type' in planWithVersion) {
        throw new Error(planWithVersion.message)
      }

      const result = await planRepository.save(planWithVersion)
      expect(result).toBeUndefined()

      // 保存されたことを確認
      const saved = await prisma.plan.findUnique({
        where: { id: plan.id },
        include: {
          versions: {
            include: {
              services: true,
            },
          },
        },
      })

      expect(saved).toBeDefined()
      expect(saved?.versions).toHaveLength(1)
      expect(saved?.versions[0]?.desiredLife).toBe('毎日作業所に通いたい')
      expect(saved?.versions[0]?.services).toHaveLength(1)
      expect(saved?.versions[0]?.services[0]?.serviceType).toBe('就労継続支援B型')
    })

    it('既存のPlanを更新できる', async () => {
      const plan = Plan.create({
        tenantId: testTenantId,
        clientId: testClientId,
      })

      // 最初の保存
      await planRepository.save(plan)

      // バージョンを追加して更新
      const version = PlanVersion.create({
        planId: plan.id,
        versionNumber: 1,
        createdBy: testSupporterId,
      })

      const updatedPlan = plan.addVersion(version)
      if ('type' in updatedPlan) {
        throw new Error(updatedPlan.message)
      }
      const result = await planRepository.save(updatedPlan)
      expect(result).toBeUndefined()

      // 更新されたことを確認
      const saved = await prisma.plan.findUnique({
        where: { id: plan.id },
        include: {
          versions: true,
        },
      })

      expect(saved?.currentVersionId).toBe(version.id)
      expect(saved?.versions).toHaveLength(1)
    })
  })

  describe('findById', () => {
    it('IDでPlanを取得できる', async () => {
      const plan = Plan.create({
        tenantId: testTenantId,
        clientId: testClientId,
      })

      await planRepository.save(plan)

      const result = await planRepository.findById(plan.id)

      if ('type' in result) {
        throw new Error('Unexpected error')
      }

      expect(result.id).toBe(plan.id)
      expect(result.tenantId).toBe(testTenantId)
      expect(result.clientId).toBe(testClientId)
    })

    it('存在しないIDの場合はNotFoundエラー', async () => {
      const result = await planRepository.findById('non-existent-id')

      expect(result).toEqual({
        type: 'NotFound',
        message: 'Plan not found',
      })
    })
  })

  describe('findByClientId', () => {
    it('クライアントIDでPlanリストを取得できる', async () => {
      const plan1 = Plan.create({
        tenantId: testTenantId,
        clientId: testClientId,
      })

      const plan2 = Plan.create({
        tenantId: testTenantId,
        clientId: testClientId,
      })

      await planRepository.save(plan1)
      await planRepository.save(plan2)

      const result = await planRepository.findByClientId(testClientId)

      if ('type' in result) {
        throw new Error('Unexpected error')
      }

      expect(result).toHaveLength(2)
      expect(result.map((p) => p.id)).toContain(plan1.id)
      expect(result.map((p) => p.id)).toContain(plan2.id)
    })

    it('該当するPlanがない場合は空配列を返す', async () => {
      const result = await planRepository.findByClientId('non-existent-client')

      if ('type' in result) {
        throw new Error('Unexpected error')
      }

      expect(result).toEqual([])
    })
  })

  describe('delete', () => {
    it('Planを削除できる', async () => {
      const plan = Plan.create({
        tenantId: testTenantId,
        clientId: testClientId,
      })

      await planRepository.save(plan)

      const result = await planRepository.delete(plan.id)
      expect(result).toBeUndefined()

      // 削除されたことを確認
      const deleted = await prisma.plan.findUnique({
        where: { id: plan.id },
      })
      expect(deleted).toBeNull()
    })

    it('存在しないIDの場合はNotFoundエラー', async () => {
      const result = await planRepository.delete('non-existent-id')

      expect(result).toEqual({
        type: 'NotFound',
        message: 'Plan not found',
      })
    })
  })
})
