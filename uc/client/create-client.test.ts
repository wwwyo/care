import { describe, expect, it, vi } from 'bun:test'
import { createClient } from './create-client'

describe('createClient', () => {
  it('新規クライアントを作成できる', async () => {
    const mockSave = vi.fn().mockResolvedValue({ type: 'success' })
    const mockRepository = {
      save: mockSave,
      findById: vi.fn(),
      findAll: vi.fn(),
    }

    const result = await createClient(
      {
        tenantId: 'tenant-123',
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
      },
      mockRepository,
    )

    expect(result.type).toBe('success')
    if (result.type !== 'success') return

    expect(result.client.toData().name).toBe('山田太郎')
    expect(result.client.toData().phoneNumber).toBe('090-1234-5678')
    expect(mockSave).toHaveBeenCalledTimes(1)
  })

  it('障害とケアレベルを含むクライアントを作成できる', async () => {
    const mockSave = vi.fn().mockResolvedValue({ type: 'success' })
    const mockRepository = {
      save: mockSave,
      findById: vi.fn(),
      findAll: vi.fn(),
    }

    const result = await createClient(
      {
        tenantId: 'tenant-123',
        name: '佐藤太郎',
        birthDate: new Date('1985-05-15'),
        gender: 'male',
        address: {
          prefecture: '埼玉県',
          city: 'さいたま市',
          street: '3-4-5',
        },
        phoneNumber: '048-1234-5678',
        emergencyContact: {
          name: '佐藤花子',
          relationship: '母',
          phoneNumber: '048-8765-4321',
        },
        disability: '知的障害',
        careLevel: '区分3',
        notes: '週3回の就労継続支援B型を利用中',
      },
      mockRepository,
    )

    expect(result.type).toBe('success')
    if (result.type !== 'success') return

    const data = result.client.toData()
    expect(data.disability).toBe('知的障害')
    expect(data.careLevel).toBe('区分3')
    expect(data.notes).toBe('週3回の就労継続支援B型を利用中')
  })

  it('無効な電話番号でエラーを返す', async () => {
    const mockRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
    }

    const result = await createClient(
      {
        tenantId: 'tenant-123',
        name: '田中太郎',
        birthDate: new Date('1990-01-01'),
        gender: 'male',
        address: {
          prefecture: '千葉県',
          city: '千葉市',
          street: '5-6-7',
        },
        phoneNumber: '123-456', // 無効な電話番号
        emergencyContact: {
          name: '田中花子',
          relationship: '妻',
          phoneNumber: '043-8765-4321',
        },
      },
      mockRepository,
    )

    expect(result.type).toBe('InvalidPhoneNumber')
    expect(mockRepository.save).not.toHaveBeenCalled()
  })

  it('必須フィールドが不足している場合エラーを返す', async () => {
    const mockRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
    }

    const result = await createClient(
      {
        tenantId: 'tenant-123',
        name: '', // 空の名前
        birthDate: new Date('1990-01-01'),
        gender: 'male',
        address: {
          prefecture: '東京都',
          city: '港区',
          street: '1-1-1',
        },
        phoneNumber: '03-1234-5678',
        emergencyContact: {
          name: '緊急連絡先',
          relationship: '友人',
          phoneNumber: '03-8765-4321',
        },
      },
      mockRepository,
    )

    expect(result.type).toBe('MissingName')
    expect(mockRepository.save).not.toHaveBeenCalled()
  })

  it('リポジトリ保存エラーを処理する', async () => {
    const mockSave = vi.fn().mockResolvedValue({
      type: 'SaveError',
      message: 'データベース接続エラー',
    })
    const mockRepository = {
      save: mockSave,
      findById: vi.fn(),
      findAll: vi.fn(),
    }

    const result = await createClient(
      {
        tenantId: 'tenant-123',
        name: '鈴木太郎',
        birthDate: new Date('1995-03-20'),
        gender: 'male',
        address: {
          prefecture: '神奈川県',
          city: '横浜市',
          street: '8-9-10',
        },
        phoneNumber: '045-1234-5678',
        emergencyContact: {
          name: '鈴木花子',
          relationship: '妹',
          phoneNumber: '045-8765-4321',
        },
      },
      mockRepository,
    )

    expect(result.type).toBe('SaveError')
    if (result.type === 'SaveError') {
      expect(result.message).toBe('データベース接続エラー')
    }
  })
})
