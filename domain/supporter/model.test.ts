import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { Supporter } from './model'

// crypto.randomUUID のモック
beforeEach(() => {
  let callCount = 0
  global.crypto = {
    randomUUID: mock(() => `test-uuid-${++callCount}`),
  } as unknown as Crypto
})

describe('Supporter', () => {
  describe('constructor', () => {
    test('正しくインスタンスを作成する', () => {
      const supporter = new Supporter('supporter-1', 'user-1', 'tenant-1')

      expect(supporter.id).toBe('supporter-1')
      expect(supporter.userId).toBe('user-1')
      expect(supporter.tenantId).toBe('tenant-1')
      expect(supporter.profile).toBeUndefined()
    })

    test('プロフィールありでインスタンスを作成する', () => {
      const profile = {
        id: 'profile-1',
        supporterId: 'supporter-1',
        name: '山田太郎',
        tenantId: 'tenant-1',
      }

      const supporter = new Supporter('supporter-1', 'user-1', 'tenant-1', profile)

      expect(supporter.profile).toEqual(profile)
    })
  })

  describe('setProfile', () => {
    test('プロフィールを設定する', () => {
      const supporter = new Supporter('supporter-1', 'user-1', 'tenant-1')

      supporter.setProfile({
        name: '山田太郎',
        nameKana: 'ヤマダタロウ',
        gender: '男性',
        birthDate: new Date('1990-01-01'),
        phone: '090-1234-5678',
      })

      expect(supporter.profile).toEqual({
        id: 'test-uuid-1',
        supporterId: 'supporter-1',
        tenantId: 'tenant-1',
        name: '山田太郎',
        nameKana: 'ヤマダタロウ',
        gender: '男性',
        birthDate: new Date('1990-01-01'),
        phone: '090-1234-5678',
      })
    })

    test('必須項目のみでプロフィールを設定する', () => {
      const supporter = new Supporter('supporter-1', 'user-1', 'tenant-1')

      supporter.setProfile({
        name: '山田太郎',
      })

      expect(supporter.profile).toEqual({
        id: 'test-uuid-1',
        supporterId: 'supporter-1',
        tenantId: 'tenant-1',
        name: '山田太郎',
      })
    })
  })

  describe('isProfileComplete', () => {
    test('プロフィールがない場合はfalseを返す', () => {
      const supporter = new Supporter('supporter-1', 'user-1', 'tenant-1')

      expect(supporter.isProfileComplete()).toBe(false)
    })

    test('プロフィールがあるが名前がない場合はfalseを返す', () => {
      const supporter = new Supporter('supporter-1', 'user-1', 'tenant-1', {
        id: 'profile-1',
        supporterId: 'supporter-1',
        name: '',
        tenantId: 'tenant-1',
      })

      expect(supporter.isProfileComplete()).toBe(false)
    })

    test('プロフィールがあり名前がある場合はtrueを返す', () => {
      const supporter = new Supporter('supporter-1', 'user-1', 'tenant-1', {
        id: 'profile-1',
        supporterId: 'supporter-1',
        name: '山田太郎',
        tenantId: 'tenant-1',
      })

      expect(supporter.isProfileComplete()).toBe(true)
    })
  })

  describe('create (ファクトリメソッド)', () => {
    test('新しいSupporterインスタンスを作成する', () => {
      const supporter = Supporter.create({
        userId: 'user-1',
        tenantId: 'tenant-1',
        name: 'テスト太郎',
      })

      expect(supporter.id).toBe('test-uuid-1')
      expect(supporter.userId).toBe('user-1')
      expect(supporter.tenantId).toBe('tenant-1')
      expect(supporter.profile).toBeDefined()
      expect(supporter.profile?.name).toBe('テスト太郎')
      expect(supporter.profile?.id).toBe('test-uuid-2')
    })
  })
})
