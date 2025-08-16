import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { Client } from './model'

// crypto.randomUUID のモック
beforeEach(() => {
  let callCount = 0
  global.crypto = {
    randomUUID: mock(() => `test-uuid-${++callCount}`),
  } as any
})

describe('Client', () => {
  describe('constructor', () => {
    test('正しくインスタンスを作成する', () => {
      const client = new Client('client-1', 'tenant-1')

      expect(client.id).toBe('client-1')
      expect(client.tenantId).toBe('tenant-1')
      expect(client.profile).toBeUndefined()
      expect(client.addresses).toEqual([])
      expect(client.supporters).toEqual([])
    })

    test('プロフィールと住所ありでインスタンスを作成する', () => {
      const profile = {
        id: 'profile-1',
        clientId: 'client-1',
        name: '山田太郎',
      }
      const addresses = [
        {
          id: 'address-1',
          clientId: 'client-1',
          city: '東京都',
        },
      ]
      const supporters = [
        {
          id: 'cs-1',
          clientId: 'client-1',
          supporterId: 'supporter-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      const client = new Client('client-1', 'tenant-1', profile, addresses, supporters)

      expect(client.profile).toEqual(profile)
      expect(client.addresses).toEqual(addresses)
      expect(client.supporters).toEqual(supporters)
    })
  })

  describe('setProfile', () => {
    test('プロフィールを設定する', () => {
      const client = new Client('client-1', 'tenant-1')

      client.setProfile({
        name: '山田太郎',
        nameKana: 'ヤマダタロウ',
        gender: '男性',
        birthDate: new Date('1990-01-01'),
        phone: '090-1234-5678',
      })

      expect(client.profile).toEqual({
        id: 'test-uuid-1',
        clientId: 'client-1',
        name: '山田太郎',
        nameKana: 'ヤマダタロウ',
        gender: '男性',
        birthDate: new Date('1990-01-01'),
        phone: '090-1234-5678',
      })
    })

    test('必須項目のみでプロフィールを設定する', () => {
      const client = new Client('client-1', 'tenant-1')

      client.setProfile({
        name: '山田太郎',
      })

      expect(client.profile).toEqual({
        id: 'test-uuid-1',
        clientId: 'client-1',
        name: '山田太郎',
      })
    })
  })

  describe('addAddress', () => {
    test('住所を追加する', () => {
      const client = new Client('client-1', 'tenant-1')

      client.addAddress({
        postalCode: '100-0001',
        prefecture: '東京都',
        city: '千代田区',
        street: '千代田1-1',
        building: 'ビル101',
      })

      expect(client.addresses).toHaveLength(1)
      expect(client.addresses[0]).toEqual({
        id: 'test-uuid-1',
        clientId: 'client-1',
        postalCode: '100-0001',
        prefecture: '東京都',
        city: '千代田区',
        street: '千代田1-1',
        building: 'ビル101',
      })
    })

    test('複数の住所を追加する', () => {
      const client = new Client('client-1', 'tenant-1')

      client.addAddress({
        city: '東京都',
      })
      client.addAddress({
        city: '大阪府',
      })

      expect(client.addresses).toHaveLength(2)
      expect(client.addresses[0]?.city).toBe('東京都')
      expect(client.addresses[1]?.city).toBe('大阪府')
    })
  })

  describe('addSupporter', () => {
    test('サポーターを追加する', () => {
      const client = new Client('client-1', 'tenant-1')

      client.addSupporter('supporter-1')

      expect(client.supporters).toHaveLength(1)
      expect(client.supporters[0]?.supporterId).toBe('supporter-1')
    })

    test('同じサポーターを重複して追加しない', () => {
      const client = new Client('client-1', 'tenant-1')

      client.addSupporter('supporter-1')
      client.addSupporter('supporter-1')

      expect(client.supporters).toHaveLength(1)
    })

    test('複数のサポーターを追加する', () => {
      const client = new Client('client-1', 'tenant-1')

      client.addSupporter('supporter-1')
      client.addSupporter('supporter-2')
      client.addSupporter('supporter-3')

      expect(client.supporters).toHaveLength(3)
      expect(client.supporters[0]?.supporterId).toBe('supporter-1')
      expect(client.supporters[1]?.supporterId).toBe('supporter-2')
      expect(client.supporters[2]?.supporterId).toBe('supporter-3')
    })
  })

  describe('getPrimaryAddress', () => {
    test('住所がない場合はundefinedを返す', () => {
      const client = new Client('client-1', 'tenant-1')

      expect(client.getPrimaryAddress()).toBeUndefined()
    })

    test('最初の住所を返す', () => {
      const client = new Client('client-1', 'tenant-1')

      client.addAddress({ city: '東京都' })
      client.addAddress({ city: '大阪府' })

      const primaryAddress = client.getPrimaryAddress()
      expect(primaryAddress?.city).toBe('東京都')
    })
  })

  describe('isProfileComplete', () => {
    test('プロフィールがない場合はfalseを返す', () => {
      const client = new Client('client-1', 'tenant-1')

      expect(client.isProfileComplete()).toBe(false)
    })

    test('プロフィールはあるが名前がない場合はfalseを返す', () => {
      const client = new Client('client-1', 'tenant-1')
      client.setProfile({ name: '' })

      expect(client.isProfileComplete()).toBe(false)
    })

    test('プロフィールと名前はあるが住所がない場合はfalseを返す', () => {
      const client = new Client('client-1', 'tenant-1')
      client.setProfile({ name: '山田太郎' })

      expect(client.isProfileComplete()).toBe(false)
    })

    test('プロフィール、名前、住所がすべてある場合はtrueを返す', () => {
      const client = new Client('client-1', 'tenant-1')
      client.setProfile({ name: '山田太郎' })
      client.addAddress({ city: '東京都' })

      expect(client.isProfileComplete()).toBe(true)
    })
  })

  describe('create (ファクトリメソッド)', () => {
    test('新しいClientインスタンスを作成する', () => {
      const client = Client.create({
        tenantId: 'tenant-1',
        name: 'テスト花子',
      })

      expect(client.id).toBe('test-uuid-1')
      expect(client.tenantId).toBe('tenant-1')
      expect(client.profile).toBeDefined()
      expect(client.profile?.name).toBe('テスト花子')
      expect(client.profile?.id).toBe('test-uuid-2')
      expect(client.addresses).toEqual([])
      expect(client.supporters).toEqual([])
    })

    test('サポーター付きでClientインスタンスを作成する', () => {
      const client = Client.create({
        tenantId: 'tenant-1',
        name: 'テスト花子',
        supporterId: 'supporter-1',
      })

      expect(client.id).toBe('test-uuid-1')
      expect(client.tenantId).toBe('tenant-1')
      expect(client.supporters).toHaveLength(1)
      expect(client.supporters[0]?.supporterId).toBe('supporter-1')
    })
  })
})
