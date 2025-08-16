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
      const client = new Client('client-1', 'user-1')

      expect(client.id).toBe('client-1')
      expect(client.userId).toBe('user-1')
      expect(client.profile).toBeUndefined()
      expect(client.addresses).toEqual([])
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

      const client = new Client('client-1', 'user-1', profile, addresses)

      expect(client.profile).toEqual(profile)
      expect(client.addresses).toEqual(addresses)
    })
  })

  describe('setProfile', () => {
    test('プロフィールを設定する', () => {
      const client = new Client('client-1', 'user-1')

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
      const client = new Client('client-1', 'user-1')

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
      const client = new Client('client-1', 'user-1')

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
      const client = new Client('client-1', 'user-1')

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

  describe('getPrimaryAddress', () => {
    test('住所がない場合はundefinedを返す', () => {
      const client = new Client('client-1', 'user-1')

      expect(client.getPrimaryAddress()).toBeUndefined()
    })

    test('最初の住所を返す', () => {
      const client = new Client('client-1', 'user-1')

      client.addAddress({ city: '東京都' })
      client.addAddress({ city: '大阪府' })

      const primaryAddress = client.getPrimaryAddress()
      expect(primaryAddress?.city).toBe('東京都')
    })
  })

  describe('isProfileComplete', () => {
    test('プロフィールがない場合はfalseを返す', () => {
      const client = new Client('client-1', 'user-1')

      expect(client.isProfileComplete()).toBe(false)
    })

    test('プロフィールはあるが名前がない場合はfalseを返す', () => {
      const client = new Client('client-1', 'user-1')
      client.setProfile({ name: '' })

      expect(client.isProfileComplete()).toBe(false)
    })

    test('プロフィールと名前はあるが住所がない場合はfalseを返す', () => {
      const client = new Client('client-1', 'user-1')
      client.setProfile({ name: '山田太郎' })

      expect(client.isProfileComplete()).toBe(false)
    })

    test('プロフィール、名前、住所がすべてある場合はtrueを返す', () => {
      const client = new Client('client-1', 'user-1')
      client.setProfile({ name: '山田太郎' })
      client.addAddress({ city: '東京都' })

      expect(client.isProfileComplete()).toBe(true)
    })
  })

  describe('create (ファクトリメソッド)', () => {
    test('新しいClientインスタンスを作成する', () => {
      const client = Client.create({
        userId: 'user-1',
      })

      expect(client.id).toBe('test-uuid-1')
      expect(client.userId).toBe('user-1')
      expect(client.profile).toBeUndefined()
      expect(client.addresses).toEqual([])
    })
  })
})
