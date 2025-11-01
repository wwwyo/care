import { describe, expect, it } from 'bun:test'
import { ServiceType } from './service-type'

describe('ServiceType', () => {
  describe('create', () => {
    it('有効なサービス種別を作成できる', () => {
      const serviceType = ServiceType.create('DAILY_LIFE_SUPPORT')
      expect(serviceType).not.toBeNull()
      expect(serviceType?.getValue()).toBe('DAILY_LIFE_SUPPORT')
    })

    it('無効なサービス種別の場合nullを返す', () => {
      const serviceType = ServiceType.create('無効なサービス')
      expect(serviceType).toBeNull()
    })

    it('nullの場合nullを返す', () => {
      const serviceType = ServiceType.create(null)
      expect(serviceType).toBeNull()
    })

    it('undefinedの場合nullを返す', () => {
      const serviceType = ServiceType.create(undefined)
      expect(serviceType).toBeNull()
    })

    it('空文字の場合nullを返す', () => {
      const serviceType = ServiceType.create('')
      expect(serviceType).toBeNull()
    })
  })

  describe('equals', () => {
    it('同じ値の場合trueを返す', () => {
      const serviceType1 = ServiceType.create('DAILY_LIFE_SUPPORT')
      const serviceType2 = ServiceType.create('DAILY_LIFE_SUPPORT')
      expect(serviceType1?.equals(serviceType2!)).toBe(true)
    })

    it('異なる値の場合falseを返す', () => {
      const serviceType1 = ServiceType.create('DAILY_LIFE_SUPPORT')
      const serviceType2 = ServiceType.create('EMPLOYMENT_SUPPORT_A')
      expect(serviceType1?.equals(serviceType2!)).toBe(false)
    })

    it('nullと比較した場合falseを返す', () => {
      const serviceType = ServiceType.create('DAILY_LIFE_SUPPORT')
      expect(serviceType?.equals(null)).toBe(false)
    })
  })

  describe('isEmploymentService', () => {
    it('就労継続支援A型の場合trueを返す', () => {
      const serviceType = ServiceType.create('EMPLOYMENT_SUPPORT_A')
      expect(serviceType?.isEmploymentService()).toBe(true)
    })

    it('就労継続支援B型の場合trueを返す', () => {
      const serviceType = ServiceType.create('EMPLOYMENT_SUPPORT_B')
      expect(serviceType?.isEmploymentService()).toBe(true)
    })

    it('就労移行支援の場合trueを返す', () => {
      const serviceType = ServiceType.create('EMPLOYMENT_TRANSITION')
      expect(serviceType?.isEmploymentService()).toBe(true)
    })

    it('生活介護の場合falseを返す', () => {
      const serviceType = ServiceType.create('DAILY_LIFE_SUPPORT')
      expect(serviceType?.isEmploymentService()).toBe(false)
    })

    it('相談支援の場合falseを返す', () => {
      const serviceType = ServiceType.create('PLAN_CONSULTATION_SUPPORT')
      expect(serviceType?.isEmploymentService()).toBe(false)
    })
  })

  describe('isChildService', () => {
    it('現在、児童向けサービスは未定義のため常にfalseを返す', () => {
      const serviceType = ServiceType.create('DAILY_LIFE_SUPPORT')
      expect(serviceType?.isChildService()).toBe(false)
    })

    it('就労継続支援A型の場合falseを返す', () => {
      const serviceType = ServiceType.create('EMPLOYMENT_SUPPORT_A')
      expect(serviceType?.isChildService()).toBe(false)
    })
  })

  describe('isConsultationService', () => {
    it('地域相談支援(地域移行支援)の場合trueを返す', () => {
      const serviceType = ServiceType.create('COMMUNITY_TRANSITION_SUPPORT')
      expect(serviceType?.isConsultationService()).toBe(true)
    })

    it('地域相談支援(地域定着支援)の場合trueを返す', () => {
      const serviceType = ServiceType.create('COMMUNITY_SETTLEMENT_SUPPORT')
      expect(serviceType?.isConsultationService()).toBe(true)
    })

    it('計画相談支援の場合trueを返す', () => {
      const serviceType = ServiceType.create('PLAN_CONSULTATION_SUPPORT')
      expect(serviceType?.isConsultationService()).toBe(true)
    })

    it('障害児相談支援の場合trueを返す', () => {
      const serviceType = ServiceType.create('DISABLED_CHILD_CONSULTATION_SUPPORT')
      expect(serviceType?.isConsultationService()).toBe(true)
    })

    it('生活介護の場合falseを返す', () => {
      const serviceType = ServiceType.create('DAILY_LIFE_SUPPORT')
      expect(serviceType?.isConsultationService()).toBe(false)
    })
  })

  describe('toString', () => {
    it('文字列表現を返す', () => {
      const serviceType = ServiceType.create('DAILY_LIFE_SUPPORT')
      expect(serviceType?.toString()).toBe('DAILY_LIFE_SUPPORT')
    })
  })
})
