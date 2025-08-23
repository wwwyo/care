import { describe, expect, it } from 'bun:test'
import { Plan, PlanService, PlanVersion } from './model'

describe('Plan', () => {
  describe('create', () => {
    it('新規Planを作成できる', () => {
      const plan = Plan.create({
        tenantId: 'tenant-123',
        clientId: 'client-456',
      })

      expect(plan.id).toBeDefined()
      expect(plan.tenantId).toBe('tenant-123')
      expect(plan.clientId).toBe('client-456')
      expect(plan.status).toBe('draft')
      expect(plan.currentVersionId).toBeNull()
      expect(plan.versions).toEqual([])
    })
  })

  describe('addVersion', () => {
    it('バージョンを追加できる', () => {
      const plan = Plan.create({
        tenantId: 'tenant-123',
        clientId: 'client-456',
      })

      const version = PlanVersion.create({
        planId: plan.id,
        versionNumber: 1,
        createdBy: 'supporter-789',
      })

      const result = plan.addVersion(version)

      expect(result).not.toHaveProperty('type')
      const updatedPlan = result as Plan
      expect(updatedPlan.versions).toHaveLength(1)
      expect(updatedPlan.versions[0]).toBe(version)
      expect(updatedPlan.currentVersionId).toBe(version.id)
    })

    it('バージョン番号が連続していない場合はエラー', () => {
      const plan = Plan.create({
        tenantId: 'tenant-123',
        clientId: 'client-456',
      })

      const version = PlanVersion.create({
        planId: plan.id,
        versionNumber: 2, // 1をスキップ
        createdBy: 'supporter-789',
      })

      const result = plan.addVersion(version)
      expect(result).toEqual({
        type: 'ValidationError',
        message: 'Version number must be sequential',
      })
    })
  })

  describe('publish', () => {
    it('下書きを確定版として公開できる', () => {
      const plan = Plan.create({
        tenantId: 'tenant-123',
        clientId: 'client-456',
      })

      const version = PlanVersion.create({
        planId: plan.id,
        versionNumber: 1,
        createdBy: 'supporter-789',
      })

      const addResult = plan.addVersion(version)
      expect(addResult).not.toHaveProperty('type')
      const planWithVersion = addResult as Plan

      const publishResult = planWithVersion.publish(version.id)
      expect(publishResult).not.toHaveProperty('type')
      const publishedPlan = publishResult as Plan

      expect(publishedPlan.status).toBe('published')
      const publishedVersion = publishedPlan.versions.find((v) => v.id === version.id)
      expect(publishedVersion?.versionType).toBe('published')
    })

    it('存在しないバージョンIDの場合はエラー', () => {
      const plan = Plan.create({
        tenantId: 'tenant-123',
        clientId: 'client-456',
      })

      const result = plan.publish('invalid-id')
      expect(result).toEqual({
        type: 'NotFound',
        message: 'Version not found',
      })
    })
  })
})

describe('PlanVersion', () => {
  describe('create', () => {
    it('新規PlanVersionを作成できる', () => {
      const version = PlanVersion.create({
        planId: 'plan-123',
        versionNumber: 1,
        createdBy: 'supporter-789',
      })

      expect(version.id).toBeDefined()
      expect(version.planId).toBe('plan-123')
      expect(version.versionNumber).toBe(1)
      expect(version.versionType).toBe('draft')
      expect(version.createdBy).toBe('supporter-789')
      expect(version.desiredLife).toBeNull()
      expect(version.troubles).toBeNull()
      expect(version.considerations).toBeNull()
      expect(version.services).toEqual([])
    })

    it('初期値を指定して作成できる', () => {
      const version = PlanVersion.create({
        planId: 'plan-123',
        versionNumber: 1,
        createdBy: 'supporter-789',
        desiredLife: '毎日作業所に通いたい',
        troubles: '一人で通えない',
        considerations: '送迎が必要',
      })

      expect(version.desiredLife).toBe('毎日作業所に通いたい')
      expect(version.troubles).toBe('一人で通えない')
      expect(version.considerations).toBe('送迎が必要')
    })
  })

  describe('update', () => {
    it('下書きの内容を更新できる', () => {
      const version = PlanVersion.create({
        planId: 'plan-123',
        versionNumber: 1,
        createdBy: 'supporter-789',
      })

      const result = version.update({
        desiredLife: '働きたい',
        troubles: '体力がない',
      })

      expect(result).not.toHaveProperty('type')
      const updated = result as PlanVersion
      expect(updated.desiredLife).toBe('働きたい')
      expect(updated.troubles).toBe('体力がない')
      expect(updated.id).toBe(version.id) // IDは変わらない
    })

    it('確定版は更新できない', () => {
      const version = PlanVersion.create({
        planId: 'plan-123',
        versionNumber: 1,
        createdBy: 'supporter-789',
      })

      const publishResult = version.publish()
      expect(publishResult).toBeInstanceOf(PlanVersion)
      const published = publishResult as PlanVersion

      const updateResult = published.update({
        desiredLife: '変更したい',
      })

      expect(updateResult).toEqual({
        type: 'ValidationError',
        message: 'Cannot update published version',
      })
    })
  })

  describe('addService', () => {
    it('サービスを追加できる', () => {
      const version = PlanVersion.create({
        planId: 'plan-123',
        versionNumber: 1,
        createdBy: 'supporter-789',
      })

      const service = PlanService.create({
        planVersionId: version.id,
        serviceCategory: 'daytime',
        serviceType: '就労継続支援B型',
        desiredAmount: '週5日',
        desiredLifeByService: '働く習慣をつけたい',
        achievementPeriod: '継続',
      })

      const result = version.addService(service)

      expect(result).not.toHaveProperty('type')
      const updated = result as PlanVersion
      expect(updated.services).toHaveLength(1)
      expect(updated.services[0]).toBe(service)
    })
  })

  describe('removeService', () => {
    it('サービスを削除できる', () => {
      const version = PlanVersion.create({
        planId: 'plan-123',
        versionNumber: 1,
        createdBy: 'supporter-789',
      })

      const service = PlanService.create({
        planVersionId: version.id,
        serviceCategory: 'daytime',
        serviceType: '就労継続支援B型',
      })

      const addResult = version.addService(service)
      expect(addResult).not.toHaveProperty('type')
      const withService = addResult as PlanVersion

      const removeResult = withService.removeService(service.id)
      expect(removeResult).not.toHaveProperty('type')
      const withoutService = removeResult as PlanVersion

      expect(withoutService.services).toHaveLength(0)
    })
  })

  describe('publish', () => {
    it('下書きを確定版にできる', () => {
      const version = PlanVersion.create({
        planId: 'plan-123',
        versionNumber: 1,
        createdBy: 'supporter-789',
      })

      const result = version.publish()
      expect(result).not.toHaveProperty('type')
      const published = result as PlanVersion

      expect(published.versionType).toBe('published')
      expect(published.id).toBe(version.id)
    })

    it('すでに確定版の場合はエラー', () => {
      const version = PlanVersion.create({
        planId: 'plan-123',
        versionNumber: 1,
        createdBy: 'supporter-789',
      })

      const publishResult = version.publish()
      expect(publishResult).toBeInstanceOf(PlanVersion)
      const published = publishResult as PlanVersion

      const secondPublishResult = published.publish()
      expect(secondPublishResult).toEqual({
        type: 'ValidationError',
        message: 'Version is already published',
      })
    })
  })
})

describe('PlanService', () => {
  describe('create', () => {
    it('新規PlanServiceを作成できる', () => {
      const service = PlanService.create({
        planVersionId: 'version-123',
        serviceCategory: 'daytime',
        serviceType: '生活介護',
      })

      expect(service.id).toBeDefined()
      expect(service.planVersionId).toBe('version-123')
      expect(service.serviceCategory).toBe('daytime')
      expect(service.serviceType).toBe('生活介護')
      expect(service.desiredAmount).toBeNull()
      expect(service.desiredLifeByService).toBeNull()
      expect(service.achievementPeriod).toBeNull()
    })

    it('全フィールドを指定して作成できる', () => {
      const service = PlanService.create({
        planVersionId: 'version-123',
        serviceCategory: 'home',
        serviceType: '家事援助',
        desiredAmount: '週3回',
        desiredLifeByService: '清潔な環境で生活したい',
        achievementPeriod: '3ヶ月後',
      })

      expect(service.desiredAmount).toBe('週3回')
      expect(service.desiredLifeByService).toBe('清潔な環境で生活したい')
      expect(service.achievementPeriod).toBe('3ヶ月後')
    })
  })

  describe('update', () => {
    it('内容を更新できる', () => {
      const service = PlanService.create({
        planVersionId: 'version-123',
        serviceCategory: 'daytime',
        serviceType: '生活介護',
      })

      const updated = service.update({
        desiredAmount: '週5日',
        achievementPeriod: '継続',
      })

      expect(updated.desiredAmount).toBe('週5日')
      expect(updated.achievementPeriod).toBe('継続')
      expect(updated.serviceCategory).toBe('daytime') // 変更されていない
      expect(updated.serviceType).toBe('生活介護') // 変更されていない
    })
  })
})
