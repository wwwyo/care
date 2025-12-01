import { describe, expect, it } from 'bun:test'
import { Address, isAddress } from './address'

describe('Address', () => {
  describe('create', () => {
    it('必須フィールドが揃っている場合に成功する', () => {
      const result = Address.create({
        prefecture: '東京都',
        city: '港区',
        street: '六本木1-1-1',
      })
      expect(isAddress(result)).toBe(true)
    })

    it('streetがundefinedでも成功する', () => {
      const result = Address.create({
        prefecture: '東京都',
        city: '港区',
      })
      expect(isAddress(result)).toBe(true)
    })

    it('郵便番号とビル名を含む場合に成功する', () => {
      const result = Address.create({
        postalCode: '106-0032',
        prefecture: '東京都',
        city: '港区',
        street: '六本木1-1-1',
        building: 'テストビル3F',
      })
      expect(isAddress(result)).toBe(true)
    })

    it('都道府県が欠けている場合はエラーを返す', () => {
      const result = Address.create({
        prefecture: '',
        city: '港区',
        street: '六本木1-1-1',
      })
      expect(isAddress(result)).toBe(false)
      if (isAddress(result)) return
      expect(result.type).toBe('MissingPrefecture')
    })

    it('市区町村が欠けている場合はエラーを返す', () => {
      const result = Address.create({
        prefecture: '東京都',
        city: '',
        street: '六本木1-1-1',
      })
      expect(isAddress(result)).toBe(false)
      if (isAddress(result)) return
      expect(result.type).toBe('MissingCity')
    })

    it('無効な郵便番号形式の場合はエラーを返す', () => {
      const result = Address.create({
        postalCode: '123456',
        prefecture: '東京都',
        city: '港区',
        street: '六本木1-1-1',
      })
      expect(isAddress(result)).toBe(false)
      if (isAddress(result)) return
      expect(result.type).toBe('InvalidPostalCode')
    })
  })

  describe('fromString', () => {
    it('都道府県と市区町村と番地を含む住所をパースできる', () => {
      const result = Address.fromString('東京都港区六本木1-1-1')
      expect(isAddress(result)).toBe(true)
      if (!isAddress(result)) return
      const data = result.toData()
      expect(data.prefecture).toBe('東京都')
      expect(data.city).toBe('港区')
      expect(data.street).toBe('六本木1-1-1')
    })

    it('都道府県と市区町村のみの住所をパースできる', () => {
      const result = Address.fromString('東京都港区')
      expect(isAddress(result)).toBe(true)
      if (!isAddress(result)) return
      const data = result.toData()
      expect(data.prefecture).toBe('東京都')
      expect(data.city).toBe('港区')
      expect(data.street).toBeUndefined()
    })

    it('市を含む住所をパースできる', () => {
      const result = Address.fromString('大阪府大阪市北区梅田')
      expect(isAddress(result)).toBe(true)
      if (!isAddress(result)) return
      const data = result.toData()
      expect(data.prefecture).toBe('大阪府')
      expect(data.city).toBe('大阪市')
      expect(data.street).toBe('北区梅田')
    })

    it('府を含む住所をパースできる', () => {
      const result = Address.fromString('京都府京都市')
      expect(isAddress(result)).toBe(true)
      if (!isAddress(result)) return
      const data = result.toData()
      expect(data.prefecture).toBe('京都府')
      expect(data.city).toBe('京都市')
      expect(data.street).toBeUndefined()
    })

    it('道を含む住所をパースできる', () => {
      const result = Address.fromString('北海道札幌市中央区')
      expect(isAddress(result)).toBe(true)
      if (!isAddress(result)) return
      const data = result.toData()
      expect(data.prefecture).toBe('北海道')
      expect(data.city).toBe('札幌市')
      expect(data.street).toBe('中央区')
    })

    it('空文字列の場合はエラーを返す', () => {
      const result = Address.fromString('')
      expect(isAddress(result)).toBe(false)
      if (isAddress(result)) return
      expect(result.type).toBe('InvalidAddressFormat')
      expect(result.message).toBe('住所が入力されていません')
    })

    it('都道府県が含まれていない場合はエラーを返す', () => {
      const result = Address.fromString('港区六本木1-1-1')
      expect(isAddress(result)).toBe(false)
      if (isAddress(result)) return
      expect(result.type).toBe('InvalidAddressFormat')
      expect(result.message).toBe('都道府県が含まれていません')
    })

    it('都道府県のみの場合はエラーを返す', () => {
      const result = Address.fromString('東京都')
      expect(isAddress(result)).toBe(false)
      if (isAddress(result)) return
      expect(result.type).toBe('InvalidAddressFormat')
      expect(result.message).toBe('市区町村・番地が含まれていません')
    })

    it('市区町村が見つからない場合は残り全体を市区町村として扱う', () => {
      const result = Address.fromString('東京都千代田区霞が関')
      expect(isAddress(result)).toBe(true)
      if (!isAddress(result)) return
      const data = result.toData()
      expect(data.prefecture).toBe('東京都')
      expect(data.city).toBe('千代田区')
      expect(data.street).toBe('霞が関')
    })
  })

  describe('toString', () => {
    it('基本的な住所を文字列に変換できる', () => {
      const address = Address.create({
        prefecture: '東京都',
        city: '港区',
        street: '六本木1-1-1',
      })
      if (!isAddress(address)) return
      expect(address.toString()).toBe('東京都港区六本木1-1-1')
    })

    it('streetがundefinedの場合も正しく文字列に変換できる', () => {
      const address = Address.create({
        prefecture: '東京都',
        city: '港区',
      })
      if (!isAddress(address)) return
      expect(address.toString()).toBe('東京都港区')
    })

    it('ビル名を含む住所を文字列に変換できる', () => {
      const address = Address.create({
        prefecture: '東京都',
        city: '港区',
        street: '六本木1-1-1',
        building: 'テストビル3F',
      })
      if (!isAddress(address)) return
      expect(address.toString()).toBe('東京都港区六本木1-1-1 テストビル3F')
    })
  })

  describe('toStringWithPostalCode', () => {
    it('郵便番号を含む住所を文字列に変換できる', () => {
      const address = Address.create({
        postalCode: '106-0032',
        prefecture: '東京都',
        city: '港区',
        street: '六本木1-1-1',
      })
      if (!isAddress(address)) return
      expect(address.toStringWithPostalCode()).toBe('〒106-0032 東京都港区六本木1-1-1')
    })

    it('郵便番号がない場合は通常の文字列を返す', () => {
      const address = Address.create({
        prefecture: '東京都',
        city: '港区',
        street: '六本木1-1-1',
      })
      if (!isAddress(address)) return
      expect(address.toStringWithPostalCode()).toBe('東京都港区六本木1-1-1')
    })
  })

  describe('equals', () => {
    it('同じ住所の場合はtrueを返す', () => {
      const address1 = Address.create({
        prefecture: '東京都',
        city: '港区',
        street: '六本木1-1-1',
      })
      const address2 = Address.create({
        prefecture: '東京都',
        city: '港区',
        street: '六本木1-1-1',
      })
      if (!isAddress(address1) || !isAddress(address2)) return
      expect(address1.equals(address2)).toBe(true)
    })

    it('異なる住所の場合はfalseを返す', () => {
      const address1 = Address.create({
        prefecture: '東京都',
        city: '港区',
        street: '六本木1-1-1',
      })
      const address2 = Address.create({
        prefecture: '東京都',
        city: '渋谷区',
        street: '恵比寿1-1-1',
      })
      if (!isAddress(address1) || !isAddress(address2)) return
      expect(address1.equals(address2)).toBe(false)
    })

    it('streetがundefinedの場合も正しく比較できる', () => {
      const address1 = Address.create({
        prefecture: '東京都',
        city: '港区',
      })
      const address2 = Address.create({
        prefecture: '東京都',
        city: '港区',
      })
      if (!isAddress(address1) || !isAddress(address2)) return
      expect(address1.equals(address2)).toBe(true)
    })
  })
})
