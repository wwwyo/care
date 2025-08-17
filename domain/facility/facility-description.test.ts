import { describe, expect, it } from 'bun:test'
import { FacilityDescription } from './facility-description'

describe('FacilityDescription', () => {
  describe('create', () => {
    it('有効な説明文を作成できる', () => {
      const description = FacilityDescription.create('これはテスト施設の説明文です。')
      expect(description).not.toBeNull()
      expect(description?.getValue()).toBe('これはテスト施設の説明文です。')
    })

    it('空文字の場合nullを返す', () => {
      const description = FacilityDescription.create('')
      expect(description).toBeNull()
    })

    it('nullの場合nullを返す', () => {
      const description = FacilityDescription.create(null)
      expect(description).toBeNull()
    })

    it('undefinedの場合nullを返す', () => {
      const description = FacilityDescription.create(undefined)
      expect(description).toBeNull()
    })

    it('500文字の説明文を作成できる', () => {
      const longDescription = 'あ'.repeat(500)
      const description = FacilityDescription.create(longDescription)
      expect(description).not.toBeNull()
      expect(description?.getValue()).toBe(longDescription)
    })

    it('501文字以上の場合nullを返す', () => {
      const tooLongDescription = 'あ'.repeat(501)
      const description = FacilityDescription.create(tooLongDescription)
      expect(description).toBeNull()
    })
  })

  describe('getSummary', () => {
    it('短い説明文の場合、全文を返す', () => {
      const description = FacilityDescription.create('短い説明文です。')
      expect(description?.getSummary()).toBe('短い説明文です。')
    })

    it('長い説明文の場合、指定文字数で切り詰めて...を付ける', () => {
      const longText = 'これは非常に長い説明文で、100文字を超えるものです。' + 'あ'.repeat(100)
      const description = FacilityDescription.create(longText)
      const summary = description?.getSummary(50)
      expect(summary).toBe(longText.substring(0, 50) + '...')
    })

    it('カスタム長さを指定できる', () => {
      const text = 'あ'.repeat(200)
      const description = FacilityDescription.create(text)
      const summary = description?.getSummary(30)
      expect(summary).toBe('あ'.repeat(30) + '...')
    })

    it('デフォルトは100文字', () => {
      const text = 'あ'.repeat(200)
      const description = FacilityDescription.create(text)
      const summary = description?.getSummary()
      expect(summary).toBe('あ'.repeat(100) + '...')
    })

    it('指定文字数ちょうどの場合、...を付けない', () => {
      const text = 'あ'.repeat(100)
      const description = FacilityDescription.create(text)
      const summary = description?.getSummary(100)
      expect(summary).toBe(text)
    })
  })

  describe('equals', () => {
    it('同じ値の場合trueを返す', () => {
      const desc1 = FacilityDescription.create('同じ説明文')
      const desc2 = FacilityDescription.create('同じ説明文')
      expect(desc1?.equals(desc2!)).toBe(true)
    })

    it('異なる値の場合falseを返す', () => {
      const desc1 = FacilityDescription.create('説明文1')
      const desc2 = FacilityDescription.create('説明文2')
      expect(desc1?.equals(desc2!)).toBe(false)
    })

    it('nullと比較した場合falseを返す', () => {
      const description = FacilityDescription.create('説明文')
      expect(description?.equals(null)).toBe(false)
    })
  })

  describe('toString', () => {
    it('文字列表現を返す', () => {
      const description = FacilityDescription.create('テスト説明文')
      expect(description?.toString()).toBe('テスト説明文')
    })
  })
})
