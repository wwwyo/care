import { describe, expect, it } from 'bun:test'
import { ServiceType } from './service-type'

describe('ServiceType', () => {
  describe('create', () => {
    it('有効なサービス種別を作成できる', () => {
      const serviceType = ServiceType.create('生活介護')
      expect(serviceType).not.toBeNull()
      expect(serviceType?.getValue()).toBe('生活介護')
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
      const serviceType1 = ServiceType.create('生活介護')
      const serviceType2 = ServiceType.create('生活介護')
      expect(serviceType1?.equals(serviceType2!)).toBe(true)
    })

    it('異なる値の場合falseを返す', () => {
      const serviceType1 = ServiceType.create('生活介護')
      const serviceType2 = ServiceType.create('就労継続支援A型')
      expect(serviceType1?.equals(serviceType2!)).toBe(false)
    })

    it('nullと比較した場合falseを返す', () => {
      const serviceType = ServiceType.create('生活介護')
      expect(serviceType?.equals(null)).toBe(false)
    })
  })

  describe('isEmploymentService', () => {
    it('就労継続支援A型の場合trueを返す', () => {
      const serviceType = ServiceType.create('就労継続支援A型')
      expect(serviceType?.isEmploymentService()).toBe(true)
    })

    it('就労継続支援B型の場合trueを返す', () => {
      const serviceType = ServiceType.create('就労継続支援B型')
      expect(serviceType?.isEmploymentService()).toBe(true)
    })

    it('就労移行支援の場合trueを返す', () => {
      const serviceType = ServiceType.create('就労移行支援')
      expect(serviceType?.isEmploymentService()).toBe(true)
    })

    it('生活介護の場合falseを返す', () => {
      const serviceType = ServiceType.create('生活介護')
      expect(serviceType?.isEmploymentService()).toBe(false)
    })

    it('児童発達支援の場合falseを返す', () => {
      const serviceType = ServiceType.create('児童発達支援')
      expect(serviceType?.isEmploymentService()).toBe(false)
    })
  })

  describe('isChildService', () => {
    it('児童発達支援の場合trueを返す', () => {
      const serviceType = ServiceType.create('児童発達支援')
      expect(serviceType?.isChildService()).toBe(true)
    })

    it('放課後等デイサービスの場合trueを返す', () => {
      const serviceType = ServiceType.create('放課後等デイサービス')
      expect(serviceType?.isChildService()).toBe(true)
    })

    it('生活介護の場合falseを返す', () => {
      const serviceType = ServiceType.create('生活介護')
      expect(serviceType?.isChildService()).toBe(false)
    })

    it('就労継続支援A型の場合falseを返す', () => {
      const serviceType = ServiceType.create('就労継続支援A型')
      expect(serviceType?.isChildService()).toBe(false)
    })
  })

  describe('toString', () => {
    it('文字列表現を返す', () => {
      const serviceType = ServiceType.create('生活介護')
      expect(serviceType?.toString()).toBe('生活介護')
    })
  })
})
