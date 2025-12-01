import { describe, expect, it } from 'bun:test'
import { FacilityName, FacilityNameKana } from './facility-name'

describe('FacilityName', () => {
  describe('create', () => {
    it('有効な施設名を作成できる', () => {
      const name = FacilityName.create('テスト施設')
      expect(name).not.toBeNull()
      expect(name?.getValue()).toBe('テスト施設')
    })

    it('空文字の場合nullを返す', () => {
      const name = FacilityName.create('')
      expect(name).toBeNull()
    })

    it('nullの場合nullを返す', () => {
      const name = FacilityName.create(null)
      expect(name).toBeNull()
    })

    it('undefinedの場合nullを返す', () => {
      const name = FacilityName.create(undefined)
      expect(name).toBeNull()
    })

    it('255文字の施設名を作成できる', () => {
      const longName = 'あ'.repeat(255)
      const name = FacilityName.create(longName)
      expect(name).not.toBeNull()
      expect(name?.getValue()).toBe(longName)
    })

    it('256文字以上の場合nullを返す', () => {
      const tooLongName = 'あ'.repeat(256)
      const name = FacilityName.create(tooLongName)
      expect(name).toBeNull()
    })
  })

  describe('equals', () => {
    it('同じ値の場合trueを返す', () => {
      const name1 = FacilityName.create('テスト施設')
      const name2 = FacilityName.create('テスト施設')
      expect(name1?.equals(name2!)).toBe(true)
    })

    it('異なる値の場合falseを返す', () => {
      const name1 = FacilityName.create('テスト施設1')
      const name2 = FacilityName.create('テスト施設2')
      expect(name1?.equals(name2!)).toBe(false)
    })

    it('nullと比較した場合falseを返す', () => {
      const name = FacilityName.create('テスト施設')
      expect(name?.equals(null)).toBe(false)
    })
  })

  describe('toString', () => {
    it('文字列表現を返す', () => {
      const name = FacilityName.create('テスト施設')
      expect(name?.toString()).toBe('テスト施設')
    })
  })
})

describe('FacilityNameKana', () => {
  describe('create', () => {
    it('有効なカタカナ名を作成できる', () => {
      const nameKana = FacilityNameKana.create('テストシセツ')
      expect(nameKana).not.toBeNull()
      expect(nameKana?.getValue()).toBe('テストシセツ')
    })

    it('ひらがなが含まれる場合nullを返す', () => {
      const nameKana = FacilityNameKana.create('てすとシセツ')
      expect(nameKana).toBeNull()
    })

    it('漢字が含まれる場合nullを返す', () => {
      const nameKana = FacilityNameKana.create('テスト施設')
      expect(nameKana).toBeNull()
    })

    it('英数字が含まれる場合nullを返す', () => {
      const nameKana = FacilityNameKana.create('テスト123')
      expect(nameKana).toBeNull()
    })

    it('空文字の場合nullを返す', () => {
      const nameKana = FacilityNameKana.create('')
      expect(nameKana).toBeNull()
    })

    it('nullの場合nullを返す', () => {
      const nameKana = FacilityNameKana.create(null)
      expect(nameKana).toBeNull()
    })

    it('undefinedの場合nullを返す', () => {
      const nameKana = FacilityNameKana.create(undefined)
      expect(nameKana).toBeNull()
    })

    it('スペースを含むカタカナ名を作成できる', () => {
      const nameKana = FacilityNameKana.create('テスト　シセツ')
      expect(nameKana).not.toBeNull()
      expect(nameKana?.getValue()).toBe('テスト　シセツ')
    })

    it('長音符を含むカタカナ名を作成できる', () => {
      const nameKana = FacilityNameKana.create('テストシセツー')
      expect(nameKana).not.toBeNull()
      expect(nameKana?.getValue()).toBe('テストシセツー')
    })

    it('255文字のカタカナ名を作成できる', () => {
      const longName = 'ア'.repeat(255)
      const nameKana = FacilityNameKana.create(longName)
      expect(nameKana).not.toBeNull()
      expect(nameKana?.getValue()).toBe(longName)
    })

    it('256文字以上の場合nullを返す', () => {
      const tooLongName = 'ア'.repeat(256)
      const nameKana = FacilityNameKana.create(tooLongName)
      expect(nameKana).toBeNull()
    })
  })

  describe('equals', () => {
    it('同じ値の場合trueを返す', () => {
      const name1 = FacilityNameKana.create('テストシセツ')
      const name2 = FacilityNameKana.create('テストシセツ')
      expect(name1?.equals(name2!)).toBe(true)
    })

    it('異なる値の場合falseを返す', () => {
      const name1 = FacilityNameKana.create('テストシセツ')
      const name2 = FacilityNameKana.create('テストシセツニ')
      expect(name1?.equals(name2!)).toBe(false)
    })

    it('nullと比較した場合falseを返す', () => {
      const name = FacilityNameKana.create('テストシセツ')
      expect(name?.equals(null)).toBe(false)
    })
  })

  describe('toString', () => {
    it('文字列表現を返す', () => {
      const nameKana = FacilityNameKana.create('テストシセツ')
      expect(nameKana?.toString()).toBe('テストシセツ')
    })
  })
})
