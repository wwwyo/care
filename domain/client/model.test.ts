import { describe, expect, it } from 'bun:test'
import { Client, isClient } from './model'

describe('Client', () => {
  describe('create', () => {
    it('必須フィールドを持つクライアントを作成できる', () => {
      const result = Client.create({
        tenantId: 'tenant-456',
        name: '山田太郎',
        birthDate: new Date('1990-01-01'),
        gender: 'male',
        address: {
          prefecture: '東京都',
          city: '世田谷区',
          street: '1-2-3',
        },
        phoneNumber: '090-1234-5678',
        emergencyContact: {
          name: '山田花子',
          relationship: '妻',
          phoneNumber: '090-8765-4321',
        },
      })

      expect(isClient(result)).toBe(true)
      if (!isClient(result)) return

      expect(result.toData()).toEqual({
        id: expect.any(String),
        tenantId: 'tenant-456',
        name: '山田太郎',
        birthDate: new Date('1990-01-01'),
        gender: 'male',
        address: {
          prefecture: '東京都',
          city: '世田谷区',
          street: '1-2-3',
          postalCode: undefined,
          building: undefined,
        },
        phoneNumber: '090-1234-5678',
        emergencyContact: {
          name: '山田花子',
          relationship: '妻',
          phoneNumber: '090-8765-4321',
        },
        disability: undefined,
        careLevel: undefined,
        notes: undefined,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })
    })

    it('オプションフィールドを含むクライアントを作成できる', () => {
      const result = Client.create({
        tenantId: 'tenant-456',
        name: '田中一郎',
        birthDate: new Date('1985-05-15'),
        gender: 'male',
        address: {
          prefecture: '神奈川県',
          city: '横浜市',
          street: '1-2-3',
        },
        phoneNumber: '045-1234-5678',
        emergencyContact: {
          name: '田中二郎',
          relationship: '兄',
          phoneNumber: '045-8765-4321',
        },
        disability: '知的障害',
        careLevel: '区分3',
        notes: '週3回の就労継続支援B型を利用中',
      })

      expect(isClient(result)).toBe(true)
      if (!isClient(result)) return

      const data = result.toData()
      expect(data.disability).toBe('知的障害')
      expect(data.careLevel).toBe('区分3')
      expect(data.notes).toBe('週3回の就労継続支援B型を利用中')
    })
  })

  describe('update', () => {
    it('基本情報を更新できる', () => {
      const result = Client.create({
        tenantId: 'tenant-456',
        name: '佐藤太郎',
        birthDate: new Date('1995-03-20'),
        gender: 'male',
        address: {
          prefecture: '埼玉県',
          city: 'さいたま市',
          street: '1-2-3',
        },
        phoneNumber: '048-1234-5678',
        emergencyContact: {
          name: '佐藤花子',
          relationship: '母',
          phoneNumber: '048-8765-4321',
        },
      })

      expect(isClient(result)).toBe(true)
      if (!isClient(result)) return

      const updated = result.update({
        address: {
          prefecture: '埼玉県',
          city: 'さいたま市',
          street: '4-5-6',
        },
        phoneNumber: '048-1111-2222',
        careLevel: '区分4',
      })

      expect(isClient(updated)).toBe(true)
      if (!isClient(updated)) return

      const data = updated.toData()
      expect(data.address).toEqual({
        prefecture: '埼玉県',
        city: 'さいたま市',
        street: '4-5-6',
        postalCode: undefined,
        building: undefined,
      })
      expect(data.phoneNumber).toBe('048-1111-2222')
      expect(data.careLevel).toBe('区分4')
      expect(data.name).toBe('佐藤太郎') // 変更されていない
    })

    it('緊急連絡先を更新できる', () => {
      const result = Client.create({
        tenantId: 'tenant-456',
        name: '鈴木太郎',
        birthDate: new Date('2000-08-10'),
        gender: 'male',
        address: {
          prefecture: '千葉県',
          city: '千葉市',
          street: '1-2-3',
        },
        phoneNumber: '043-1234-5678',
        emergencyContact: {
          name: '鈴木花子',
          relationship: '母',
          phoneNumber: '043-8765-4321',
        },
      })

      expect(isClient(result)).toBe(true)
      if (!isClient(result)) return

      const updated = result.update({
        emergencyContact: {
          name: '鈴木次郎',
          relationship: '父',
          phoneNumber: '043-5555-6666',
        },
      })

      expect(isClient(updated)).toBe(true)
      if (!isClient(updated)) return

      const data = updated.toData()
      expect(data.emergencyContact).toEqual({
        name: '鈴木次郎',
        relationship: '父',
        phoneNumber: '043-5555-6666',
      })
    })
  })

  describe('validate', () => {
    it('有効な電話番号形式を検証する', () => {
      const validPhoneNumbers = ['090-1234-5678', '03-1234-5678', '0120-123-456']

      validPhoneNumbers.forEach((phoneNumber) => {
        const result = Client.create({
          tenantId: 'tenant-456',
          name: 'テスト太郎',
          birthDate: new Date('1990-01-01'),
          gender: 'male',
          address: {
            prefecture: '東京都',
            city: '港区',
            street: '1-1-1',
          },
          phoneNumber,
          emergencyContact: {
            name: 'テスト花子',
            relationship: '妻',
            phoneNumber: '090-0000-0000',
          },
        })
        expect(isClient(result)).toBe(true)
      })
    })

    it('無効な電話番号形式でエラーを返す', () => {
      const invalidPhoneNumbers = [
        '123456789',
        'abc-defg-hijk',
        '090-1234-567', // 桁数不足
      ]

      invalidPhoneNumbers.forEach((phoneNumber) => {
        const result = Client.create({
          tenantId: 'tenant-456',
          name: 'テスト太郎',
          birthDate: new Date('1990-01-01'),
          gender: 'male',
          address: {
            prefecture: '東京都',
            city: '港区',
            street: '1-1-1',
          },
          phoneNumber,
          emergencyContact: {
            name: 'テスト花子',
            relationship: '妻',
            phoneNumber: '090-0000-0000',
          },
        })
        expect(isClient(result)).toBe(false)
        if (isClient(result)) return
        expect(result.type).toBe('InvalidPhoneNumber')
      })
    })

    it('必須フィールドが不足している場合エラーを返す', () => {
      const result = Client.create({
        tenantId: 'tenant-456',
        name: '',
        birthDate: new Date('1990-01-01'),
        gender: 'male',
        address: {
          prefecture: '東京都',
          city: '港区',
          street: '1-1-1',
        },
        phoneNumber: '090-1234-5678',
        emergencyContact: {
          name: 'テスト花子',
          relationship: '妻',
          phoneNumber: '090-0000-0000',
        },
      })

      expect(isClient(result)).toBe(false)
      if (isClient(result)) return
      expect(result.type).toBe('MissingName')
      expect(result.message).toBe('名前は必須です')
    })
  })

  describe('fromData', () => {
    it('データベースのデータからクライアントを復元できる', () => {
      const dbData = {
        id: 'client-789',
        tenantId: 'tenant-456',
        name: '伊藤太郎',
        birthDate: new Date('1988-12-25'),
        gender: 'male' as const,
        address: {
          postalCode: '530-0001',
          prefecture: '大阪府',
          city: '大阪市北区',
          street: '梅田1-2-3',
          building: undefined,
        },
        phoneNumber: '06-1234-5678',
        emergencyContact: {
          name: '伊藤花子',
          relationship: '妻',
          phoneNumber: '06-8765-4321',
        },
        disability: '身体障害',
        careLevel: '区分2',
        notes: 'エレベーター必須',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
      }

      const result = Client.fromData(dbData)
      expect(isClient(result)).toBe(true)
      if (!isClient(result)) return
      expect(result.toData()).toEqual(dbData)
    })
  })
})
