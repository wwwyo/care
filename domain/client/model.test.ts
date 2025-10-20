import { describe, expect, it } from 'bun:test'
import { Client, isClient } from './model'

describe('Client', () => {
  describe('create', () => {
    it('最小限のデータでクライアントを作成できる', () => {
      const result = Client.create({
        tenantId: 'tenant-001',
        name: '山田太郎',
        nameKana: 'やまだたろう',
        birthDate: new Date('1990-01-01'),
      })

      expect(isClient(result)).toBe(true)
      if (!isClient(result)) return

      const data = result.toData()
      expect(data.nameKana).toBe('やまだたろう')
      expect(data.address).toBeUndefined()
      expect(data.phoneNumber).toBeUndefined()
      expect(data.emergencyContact).toBeUndefined()
    })

    it('オプションデータを含めて作成できる', () => {
      const result = Client.create({
        tenantId: 'tenant-001',
        name: '田中花子',
        nameKana: 'たなかはなこ',
        birthDate: new Date('1985-05-15'),
        gender: 'female',
        address: {
          prefecture: '東京都',
          city: '渋谷区',
          street: '1-2-3',
        },
        phoneNumber: '03-1234-5678',
        emergencyContact: {
          name: '田中一郎',
          relationship: '父',
          phoneNumber: '03-8765-4321',
        },
        disability: '精神障害',
        careLevel: '区分2',
        notes: 'メモ',
      })

      expect(isClient(result)).toBe(true)
      if (!isClient(result)) return

      const data = result.toData()
      expect(data.gender).toBe('female')
      expect(data.address).toEqual({
        prefecture: '東京都',
        city: '渋谷区',
        street: '1-2-3',
        postalCode: undefined,
        building: undefined,
      })
      expect(data.phoneNumber).toBe('03-1234-5678')
      expect(data.emergencyContact).toEqual({
        name: '田中一郎',
        relationship: '父',
        phoneNumber: '03-8765-4321',
      })
      expect(data.disability).toBe('精神障害')
      expect(data.careLevel).toBe('区分2')
      expect(data.notes).toBe('メモ')
    })
  })

  describe('update', () => {
    it('後から住所と電話番号を追加できる', () => {
      const created = Client.create({
        tenantId: 'tenant-001',
        name: '佐藤太郎',
      })
      expect(isClient(created)).toBe(true)
      if (!isClient(created)) return

      const updated = created.update({
        address: {
          prefecture: '千葉県',
          city: '千葉市',
          street: '4-5-6',
        },
        phoneNumber: '043-1234-5678',
      })

      expect(isClient(updated)).toBe(true)
      if (!isClient(updated)) return

      const data = updated.toData()
      expect(data.address).toEqual({
        prefecture: '千葉県',
        city: '千葉市',
        street: '4-5-6',
        postalCode: undefined,
        building: undefined,
      })
      expect(data.phoneNumber).toBe('043-1234-5678')
    })

    it('緊急連絡先を削除できる', () => {
      const created = Client.create({
        tenantId: 'tenant-001',
        name: '鈴木太郎',
        emergencyContact: {
          name: '鈴木花子',
          relationship: '母',
          phoneNumber: '090-0000-0000',
        },
      })
      expect(isClient(created)).toBe(true)
      if (!isClient(created)) return

      const updated = created.update({
        emergencyContact: null,
      })
      expect(isClient(updated)).toBe(true)
      if (!isClient(updated)) return

      expect(updated.toData().emergencyContact).toBeUndefined()
    })
  })

  describe('validate', () => {
    it('電話番号形式を検証する', () => {
      const valid = Client.create({
        tenantId: 'tenant-001',
        name: 'テスト太郎',
        phoneNumber: '090-1234-5678',
      })
      expect(isClient(valid)).toBe(true)

      const invalid = Client.create({
        tenantId: 'tenant-001',
        name: 'テスト太郎',
        phoneNumber: 'invalid-phone',
      })
      expect(isClient(invalid)).toBe(false)
      if (isClient(invalid)) return
      expect(invalid.type).toBe('InvalidPhoneNumber')
    })

    it('名前が空の場合エラーを返す', () => {
      const result = Client.create({
        tenantId: 'tenant-001',
        name: '',
      })
      expect(isClient(result)).toBe(false)
      if (isClient(result)) return
      expect(result.type).toBe('MissingName')
    })
  })
})
