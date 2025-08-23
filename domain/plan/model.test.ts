import { describe, expect, it } from 'bun:test'
import { Plan, PlanVersion } from './model'

describe('Plan', () => {
  describe('createNewVersion', () => {
    it('新規計画書の場合、バージョン1を作成する', () => {
      // 新規計画書を作成
      const plan = Plan.create({
        tenantId: 'tenant-1',
        clientId: 'client-1',
      })

      // 最初のバージョンを追加
      const result = plan.createNewVersion({
        createdBy: 'supporter-1',
        desiredLife: '自立した生活',
        troubles: '日常生活の困難',
        considerations: '配慮事項',
      })

      // エラーでないことを確認
      expect(result).toBeInstanceOf(Plan)
      const updatedPlan = result as Plan

      // バージョン1が作成されていることを確認
      expect(updatedPlan.versions.length).toBe(1)
      expect(updatedPlan.versions[0]?.versionNumber).toBe(1)
      expect(updatedPlan.versions[0]?.desiredLife).toBe('自立した生活')
      expect(updatedPlan.versions[0]?.troubles).toBe('日常生活の困難')
      expect(updatedPlan.versions[0]?.considerations).toBe('配慮事項')
    })

    it('既存バージョンがある場合、既存バージョンを保持しつつ新規バージョンを追加する', () => {
      // バージョン1がある計画書を作成
      const plan = Plan.create({
        tenantId: 'tenant-1',
        clientId: 'client-1',
      })

      const withVersion1 = plan.createNewVersion({
        createdBy: 'supporter-1',
        desiredLife: 'バージョン1の望む生活',
        troubles: 'バージョン1の困りごと',
        considerations: 'バージョン1の配慮事項',
      }) as Plan

      // バージョン2を追加
      const withVersion2 = withVersion1.createNewVersion({
        createdBy: 'supporter-1',
        desiredLife: 'バージョン2の望む生活',
        troubles: 'バージョン2の困りごと',
        considerations: 'バージョン2の配慮事項',
      })

      // エラーでないことを確認
      expect(withVersion2).toBeInstanceOf(Plan)
      const updatedPlan = withVersion2 as Plan

      // 2つのバージョンが存在することを確認
      expect(updatedPlan.versions.length).toBe(2)

      // バージョン1の内容が保持されていることを確認
      const version1 = updatedPlan.versions.find((v) => v.versionNumber === 1)
      expect(version1).toBeDefined()
      expect(version1?.desiredLife).toBe('バージョン1の望む生活')
      expect(version1?.troubles).toBe('バージョン1の困りごと')
      expect(version1?.considerations).toBe('バージョン1の配慮事項')

      // バージョン2が正しく追加されていることを確認
      const version2 = updatedPlan.versions.find((v) => v.versionNumber === 2)
      expect(version2).toBeDefined()
      expect(version2?.desiredLife).toBe('バージョン2の望む生活')
      expect(version2?.troubles).toBe('バージョン2の困りごと')
      expect(version2?.considerations).toBe('バージョン2の配慮事項')
    })

    it('複数バージョンを追加しても、すべてのバージョンが保持される', () => {
      let plan = Plan.create({
        tenantId: 'tenant-1',
        clientId: 'client-1',
      })

      // 5つのバージョンを連続で追加
      for (let i = 1; i <= 5; i++) {
        const result = plan.createNewVersion({
          createdBy: 'supporter-1',
          desiredLife: `バージョン${i}の望む生活`,
          troubles: `バージョン${i}の困りごと`,
          considerations: `バージョン${i}の配慮事項`,
        })
        expect(result).toBeInstanceOf(Plan)
        plan = result as Plan
      }

      // 5つのバージョンすべてが存在することを確認
      expect(plan.versions.length).toBe(5)

      // 各バージョンの内容が正しく保持されていることを確認
      for (let i = 1; i <= 5; i++) {
        const version = plan.versions.find((v) => v.versionNumber === i)
        expect(version).toBeDefined()
        expect(version?.desiredLife).toBe(`バージョン${i}の望む生活`)
        expect(version?.troubles).toBe(`バージョン${i}の困りごと`)
        expect(version?.considerations).toBe(`バージョン${i}の配慮事項`)
      }

      // バージョン番号が連続していることを確認
      const versionNumbers = plan.versions.map((v) => v.versionNumber).sort()
      expect(versionNumbers).toEqual([1, 2, 3, 4, 5])
    })

    it('バージョン番号は最大値から計算される（length依存ではない）', () => {
      // バージョン1, 2, 3を持つ計画書を作成
      const plan = Plan.fromPersistence({
        id: 'plan-1',
        tenantId: 'tenant-1',
        clientId: 'client-1',
        currentVersionId: 'version-3',
        status: 'draft',
        versions: [
          PlanVersion.fromPersistence({
            id: 'version-1',
            planId: 'plan-1',
            versionNumber: 1,
            versionType: 'draft',
            desiredLife: 'バージョン1',
            troubles: null,
            considerations: null,
            services: [],
            createdBy: 'supporter-1',
            reasonForUpdate: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
          PlanVersion.fromPersistence({
            id: 'version-3',
            planId: 'plan-1',
            versionNumber: 3, // バージョン2をスキップ
            versionType: 'draft',
            desiredLife: 'バージョン3',
            troubles: null,
            considerations: null,
            services: [],
            createdBy: 'supporter-1',
            reasonForUpdate: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      // 新しいバージョンを追加
      const result = plan.createNewVersion({
        createdBy: 'supporter-1',
        desiredLife: '新バージョン',
      })

      expect(result).toBeInstanceOf(Plan)
      const updatedPlan = result as Plan

      // バージョン4が作成されることを確認（lengthは2だが、最大値3の次は4）
      const newVersion = updatedPlan.versions[updatedPlan.versions.length - 1]
      expect(newVersion?.versionNumber).toBe(4)
    })

    it('サービス情報も含めて新規バージョンを作成できる', () => {
      const plan = Plan.create({
        tenantId: 'tenant-1',
        clientId: 'client-1',
      })

      const result = plan.createNewVersion({
        createdBy: 'supporter-1',
        desiredLife: '自立した生活',
        services: [
          {
            serviceCategory: 'daytime',
            serviceType: '生活介護',
            desiredAmount: '週5日',
            desiredLifeByService: 'サービスを通じた生活改善',
            achievementPeriod: '6ヶ月',
          },
          {
            serviceCategory: 'home',
            serviceType: '居宅介護',
            desiredAmount: '週3回',
          },
        ],
      })

      expect(result).toBeInstanceOf(Plan)
      const updatedPlan = result as Plan

      // サービスが追加されていることを確認
      const version = updatedPlan.versions[0]
      expect(version?.services.length).toBe(2)
      expect(version?.services[0]?.serviceCategory).toBe('daytime')
      expect(version?.services[0]?.serviceType).toBe('生活介護')
      expect(version?.services[0]?.desiredAmount).toBe('週5日')
      expect(version?.services[1]?.serviceCategory).toBe('home')
      expect(version?.services[1]?.serviceType).toBe('居宅介護')
    })

    it('計画書IDは変更されない', () => {
      const plan = Plan.create({
        tenantId: 'tenant-1',
        clientId: 'client-1',
      })
      const originalId = plan.id

      const withVersion1 = plan.createNewVersion({
        createdBy: 'supporter-1',
        desiredLife: 'バージョン1',
      }) as Plan

      const withVersion2 = withVersion1.createNewVersion({
        createdBy: 'supporter-1',
        desiredLife: 'バージョン2',
      }) as Plan

      const withVersion3 = withVersion2.createNewVersion({
        createdBy: 'supporter-1',
        desiredLife: 'バージョン3',
      }) as Plan

      // すべて同じ計画書IDであることを確認
      expect(withVersion1.id).toBe(originalId)
      expect(withVersion2.id).toBe(originalId)
      expect(withVersion3.id).toBe(originalId)
    })

    it('currentVersionIdが最新バージョンに更新される', () => {
      const plan = Plan.create({
        tenantId: 'tenant-1',
        clientId: 'client-1',
      })

      const withVersion1 = plan.createNewVersion({
        createdBy: 'supporter-1',
        desiredLife: 'バージョン1',
      }) as Plan

      const version1Id = withVersion1.versions[0]?.id
      expect(withVersion1.currentVersionId).toBe(version1Id)

      const withVersion2 = withVersion1.createNewVersion({
        createdBy: 'supporter-1',
        desiredLife: 'バージョン2',
      }) as Plan

      const version2Id = withVersion2.versions[1]?.id
      expect(withVersion2.currentVersionId).toBe(version2Id)
    })
  })

  describe('updateVersion', () => {
    it('確定版の更新はエラーを返す', () => {
      const plan = Plan.fromPersistence({
        id: 'plan-1',
        tenantId: 'tenant-1',
        clientId: 'client-1',
        currentVersionId: 'version-1',
        status: 'published',
        versions: [
          PlanVersion.fromPersistence({
            id: 'version-1',
            planId: 'plan-1',
            versionNumber: 1,
            versionType: 'published', // 確定版
            desiredLife: '元の内容',
            troubles: null,
            considerations: null,
            services: [],
            createdBy: 'supporter-1',
            reasonForUpdate: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const result = plan.updateVersion('version-1', {
        desiredLife: '更新しようとした内容',
      })

      // エラーが返されることを確認
      expect(result).not.toBeInstanceOf(Plan)
      expect(result).toEqual({
        type: 'ValidationError',
        message: '確定版は編集できません。新しいバージョンを作成してください。',
      })
    })

    it('下書き版は更新でき、既存バージョンが保持される', () => {
      const plan = Plan.fromPersistence({
        id: 'plan-1',
        tenantId: 'tenant-1',
        clientId: 'client-1',
        currentVersionId: 'version-2',
        status: 'draft',
        versions: [
          PlanVersion.fromPersistence({
            id: 'version-1',
            planId: 'plan-1',
            versionNumber: 1,
            versionType: 'published',
            desiredLife: 'バージョン1の内容',
            troubles: null,
            considerations: null,
            services: [],
            createdBy: 'supporter-1',
            reasonForUpdate: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
          PlanVersion.fromPersistence({
            id: 'version-2',
            planId: 'plan-1',
            versionNumber: 2,
            versionType: 'draft', // 下書き版
            desiredLife: '元の内容',
            troubles: '元の困りごと',
            considerations: null,
            services: [],
            createdBy: 'supporter-1',
            reasonForUpdate: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const result = plan.updateVersion('version-2', {
        desiredLife: '更新後の内容',
        troubles: '更新後の困りごと',
        considerations: '新しい配慮事項',
      })

      expect(result).toBeInstanceOf(Plan)
      const updatedPlan = result as Plan

      // バージョン数は変わらない
      expect(updatedPlan.versions.length).toBe(2)

      // バージョン1は変更されていない
      const version1 = updatedPlan.versions.find((v) => v.versionNumber === 1)
      expect(version1?.desiredLife).toBe('バージョン1の内容')

      // バージョン2が更新されている
      const version2 = updatedPlan.versions.find((v) => v.versionNumber === 2)
      expect(version2?.desiredLife).toBe('更新後の内容')
      expect(version2?.troubles).toBe('更新後の困りごと')
      expect(version2?.considerations).toBe('新しい配慮事項')
    })
  })
})
