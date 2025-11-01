import { describe, expect, it } from 'bun:test'
import { Facility, type FacilityData, isFacility } from './model'

describe('Facility', () => {
  const validFacilityData: FacilityData = {
    id: 'facility-1',
    profile: {
      id: 'profile-1',
      facilityId: 'facility-1',
      name: 'テスト施設',
      nameKana: 'テストシセツ',
      description: 'これはテスト施設の説明文です。',
      capacity: null,
      wamId: null,
      officialId: null,
      corporationId: null,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    services: [
      {
        id: 'service-1',
        facilityId: 'facility-1',
        serviceType: 'DAILY_LIFE_SUPPORT',
        createdAt: new Date('2024-01-01'),
      },
    ],
    contacts: [
      {
        id: 'contact-1',
        facilityId: 'facility-1',
        contactType: 'main',
        name: null,
        phone: '03-1234-5678',
        fax: '03-1234-5679',
        email: 'test@example.com',
        website: 'https://example.com',
        createdAt: new Date('2024-01-01'),
      },
    ],
    location: {
      id: 'location-1',
      facilityId: 'facility-1',
      postalCode: '150-0001',
      addressCity: '東京都渋谷区',
      addressDetail: '1-1-1',
      building: null,
      accessInfo: '駅から徒歩5分',
      latitude: null,
      longitude: null,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
  }

  describe('create', () => {
    it('有効なデータで施設を作成できる', () => {
      const facility = Facility.create(validFacilityData)
      expect(facility).not.toBeNull()
      expect(facility?.getId()).toBe('facility-1')
      expect(facility?.getName()).toBe('テスト施設')
    })

    it('施設名がない場合nullを返す', () => {
      const invalidData: FacilityData = {
        ...validFacilityData,
        profile: {
          ...validFacilityData.profile!,
          name: '',
        },
      }
      const facility = Facility.create(invalidData)
      expect(facility).toBeNull()
    })

    it('無効なサービス種別の場合でも作成できる', () => {
      const invalidData: FacilityData = {
        ...validFacilityData,
        services: [
          {
            id: 'service-1',
            facilityId: 'facility-1',
            serviceType: '無効なサービス' as never,
            createdAt: new Date('2024-01-01'),
          },
        ],
      }
      const facility = Facility.create(invalidData)
      expect(facility).not.toBeNull()
      expect(facility?.getServiceType()).toBeNull() // 無効なサービス種別はnullになる
    })

    it('profileがnullの場合でも施設名がnullでnullを返す', () => {
      const invalidData: FacilityData = {
        ...validFacilityData,
        profile: null,
      }
      const facility = Facility.create(invalidData)
      expect(facility).toBeNull()
    })

    it('contactsが空配列の場合でも作成できる', () => {
      const dataWithNoContacts = {
        ...validFacilityData,
        contacts: [],
      }
      const facility = Facility.create(dataWithNoContacts)
      expect(facility).not.toBeNull()
      expect(facility?.getPhone()).toBeNull()
      expect(facility?.getEmail()).toBeNull()
    })

    it('locationがnullの場合でも作成できる', () => {
      const dataWithNullLocation = {
        ...validFacilityData,
        location: null,
      }
      const facility = Facility.create(dataWithNullLocation)
      expect(facility).not.toBeNull()
      expect(facility?.getAddress()).toBeNull()
      expect(facility?.getPostalCode()).toBeNull()
    })
  })

  describe('updateBasicInfo', () => {
    it('有効なデータで基本情報を更新できる', () => {
      const facility = Facility.create(validFacilityData)
      expect(facility).not.toBeNull()

      const result = facility!.updateBasicInfo({
        name: '更新された施設名',
        nameKana: 'コウシンサレタシセツメイ',
        description: '新しい説明文です。',
        serviceType: 'EMPLOYMENT_SUPPORT_A',
      })

      expect(isFacility(result)).toBe(true)
      if (isFacility(result)) {
        expect(result.getName()).toBe('更新された施設名')
        expect(result.getNameKana()).toBe('コウシンサレタシセツメイ')
        expect(result.getDescription()).toBe('新しい説明文です。')
        expect(result.getServiceType()).toBe('EMPLOYMENT_SUPPORT_A')
        // 元のインスタンスは変更されていない
        expect(facility!.getName()).toBe('テスト施設')
      }
    })

    it('無効な施設名の場合エラーを返す', () => {
      const facility = Facility.create(validFacilityData)
      expect(facility).not.toBeNull()

      const result = facility!.updateBasicInfo({
        name: '', // 空文字は無効
        nameKana: 'コウシンサレタシセツメイ',
        description: '新しい説明文です。',
        serviceType: '就労継続支援A型',
      })

      expect(isFacility(result)).toBe(false)
      if (!isFacility(result)) {
        expect(result.type).toBe('InvalidName')
        expect(result.message).toBe('施設名が無効です')
      }
      // 元のインスタンスは変更されていない
      expect(facility!.getName()).toBe('テスト施設')
    })

    it('無効なカナ名の場合も更新できるがnullになる', () => {
      const facility = Facility.create(validFacilityData)
      expect(facility).not.toBeNull()

      const result = facility!.updateBasicInfo({
        name: '更新された施設名',
        nameKana: 'ひらがな', // ひらがなは無効
        description: '新しい説明文です。',
        serviceType: '就労継続支援A型',
      })

      expect(isFacility(result)).toBe(true)
      if (isFacility(result)) {
        expect(result.getName()).toBe('更新された施設名')
        expect(result.getNameKana()).toBeNull() // 無効なカナ名はnullになる
      }
    })

    it('無効なサービス種別の場合も更新できるがnullになる', () => {
      const facility = Facility.create(validFacilityData)
      expect(facility).not.toBeNull()

      const result = facility!.updateBasicInfo({
        name: '更新された施設名',
        nameKana: 'コウシンサレタシセツメイ',
        description: '新しい説明文です。',
        serviceType: '無効なサービス',
      })

      expect(isFacility(result)).toBe(true)
      if (isFacility(result)) {
        expect(result.getName()).toBe('更新された施設名')
        expect(result.getServiceType()).toBeNull() // 無効なサービス種別はnullになる
      }
    })

    it('説明文が501文字以上の場合も更新できるがnullになる', () => {
      const facility = Facility.create(validFacilityData)
      expect(facility).not.toBeNull()

      const result = facility!.updateBasicInfo({
        name: '更新された施設名',
        nameKana: 'コウシンサレタシセツメイ',
        description: 'あ'.repeat(501),
        serviceType: '就労継続支援A型',
      })

      expect(isFacility(result)).toBe(true)
      if (isFacility(result)) {
        expect(result.getName()).toBe('更新された施設名')
        expect(result.getDescription()).toBeNull() // 501文字以上はnullになる
      }
    })

    it('null値を許可する', () => {
      const facility = Facility.create(validFacilityData)
      expect(facility).not.toBeNull()

      const result = facility!.updateBasicInfo({
        name: '更新された施設名',
        nameKana: null,
        description: null,
        serviceType: null,
      })

      expect(isFacility(result)).toBe(true)
      if (isFacility(result)) {
        expect(result.getName()).toBe('更新された施設名')
        expect(result.getNameKana()).toBeNull()
        expect(result.getDescription()).toBeNull()
        expect(result.getServiceType()).toBeNull()
      }
    })
  })

  describe('updateContact', () => {
    it('有効なデータで連絡先を更新できる', () => {
      const facility = Facility.create(validFacilityData)
      expect(facility).not.toBeNull()

      const updated = facility!.updateContact({
        phone: '090-1234-5678',
        fax: '03-9876-5432',
        email: 'new@example.com',
        website: 'https://new-example.com',
      })

      expect(updated.getPhone()).toBe('090-1234-5678')
      expect(updated.getFax()).toBe('03-9876-5432')
      expect(updated.getEmail()).toBe('new@example.com')
      expect(updated.getWebsite()).toBe('https://new-example.com')
      // 元のインスタンスは変更されていない
      expect(facility!.getPhone()).toBe('03-1234-5678')
    })

    it('バリデーションなしで値を更新できる', () => {
      const facility = Facility.create(validFacilityData)
      expect(facility).not.toBeNull()

      // 現在のモデルではバリデーションを行わない
      const updated = facility!.updateContact({
        phone: '123', // 短い値でも受け入れる
        email: 'invalid-email', // @がなくても受け入れる
      })

      expect(updated.getPhone()).toBe('123')
      expect(updated.getEmail()).toBe('invalid-email')
    })

    it('null値を許可する', () => {
      const facility = Facility.create(validFacilityData)
      expect(facility).not.toBeNull()

      const updated = facility!.updateContact({
        phone: null,
        fax: null,
        email: null,
        website: null,
      })

      expect(updated.getPhone()).toBeNull()
      expect(updated.getFax()).toBeNull()
      expect(updated.getEmail()).toBeNull()
      expect(updated.getWebsite()).toBeNull()
    })
  })

  describe('updateLocation', () => {
    it('有効なデータで所在地を更新できる', () => {
      const facility = Facility.create(validFacilityData)
      expect(facility).not.toBeNull()

      const updated = facility!.updateLocation({
        addressCity: '大阪府大阪市北区',
        addressDetail: '2-2-2',
        postalCode: '530-0001',
        accessInfo: 'バス停から徒歩3分',
      })

      expect(updated.getAddress()).toBe('大阪府大阪市北区2-2-2')
      expect(updated.getPostalCode()).toBe('530-0001')
      expect(updated.getAccessInfo()).toBe('バス停から徒歩3分')
      // 元のインスタンスは変更されていない
      expect(facility!.getAddress()).toBe('東京都渋谷区1-1-1')
    })

    it('バリデーションなしで値を更新できる', () => {
      const facility = Facility.create(validFacilityData)
      expect(facility).not.toBeNull()

      // 現在のモデルではバリデーションを行わない
      const updated = facility!.updateLocation({
        addressCity: 'あ'.repeat(128),
        addressDetail: 'あ'.repeat(128), // 長い値でも受け入れる
        postalCode: '123456', // フォーマットが違っても受け入れる
        accessInfo: 'バス停から徒歩3分',
      })

      expect(updated.getAddressCity()).toBe('あ'.repeat(128))
      expect(updated.getAddressDetail()).toBe('あ'.repeat(128))
      expect(updated.getPostalCode()).toBe('123456')
      expect(updated.getAccessInfo()).toBe('バス停から徒歩3分')
    })

    it('null値を許可する', () => {
      const facility = Facility.create(validFacilityData)
      expect(facility).not.toBeNull()

      const updated = facility!.updateLocation({
        addressCity: null,
        addressDetail: null,
        postalCode: null,
        accessInfo: null,
      })

      expect(updated.getAddress()).toBeNull()
      expect(updated.getPostalCode()).toBeNull()
      expect(updated.getAccessInfo()).toBeNull()
    })
  })

  describe('getters', () => {
    it('すべてのgetterが正しく動作する', () => {
      const facility = Facility.create(validFacilityData)
      expect(facility).not.toBeNull()

      expect(facility!.getId()).toBe('facility-1')
      expect(facility!.getName()).toBe('テスト施設')
      expect(facility!.getNameKana()).toBe('テストシセツ')
      expect(facility!.getDescription()).toBe('これはテスト施設の説明文です。')
      expect(facility!.getServiceType()).toBe('DAILY_LIFE_SUPPORT')
      expect(facility!.getPhone()).toBe('03-1234-5678')
      expect(facility!.getFax()).toBe('03-1234-5679')
      expect(facility!.getEmail()).toBe('test@example.com')
      expect(facility!.getWebsite()).toBe('https://example.com')
      expect(facility!.getAddress()).toBe('東京都渋谷区1-1-1')
      expect(facility!.getPostalCode()).toBe('150-0001')
      expect(facility!.getAccessInfo()).toBe('駅から徒歩5分')
    })

    it('nullのプロパティに対してgetterがnullを返す', () => {
      const dataWithNulls: FacilityData = {
        ...validFacilityData,
        profile: {
          ...validFacilityData.profile!,
          name: 'テスト施設',
          nameKana: null,
          description: null,
        },
        services: [],
        contacts: [],
        location: null,
      }
      const facility = Facility.create(dataWithNulls)
      expect(facility).not.toBeNull()

      expect(facility!.getNameKana()).toBeNull()
      expect(facility!.getDescription()).toBeNull()
      expect(facility!.getServiceType()).toBeNull()
      expect(facility!.getPhone()).toBeNull()
      expect(facility!.getFax()).toBeNull()
      expect(facility!.getEmail()).toBeNull()
      expect(facility!.getWebsite()).toBeNull()
      expect(facility!.getAddress()).toBeNull()
      expect(facility!.getPostalCode()).toBeNull()
      expect(facility!.getAccessInfo()).toBeNull()
    })
  })

  describe('isEmploymentFacility', () => {
    it('就労継続支援A型の場合trueを返す', () => {
      const data: FacilityData = {
        ...validFacilityData,
        services: [
          {
            id: 'service-1',
            facilityId: 'facility-1',
            serviceType: 'EMPLOYMENT_SUPPORT_A',
            createdAt: new Date('2024-01-01'),
          },
        ],
      }
      const facility = Facility.create(data)
      expect(facility?.isEmploymentFacility()).toBe(true)
    })

    it('就労継続支援B型の場合trueを返す', () => {
      const data: FacilityData = {
        ...validFacilityData,
        services: [
          {
            id: 'service-1',
            facilityId: 'facility-1',
            serviceType: 'EMPLOYMENT_SUPPORT_B',
            createdAt: new Date('2024-01-01'),
          },
        ],
      }
      const facility = Facility.create(data)
      expect(facility?.isEmploymentFacility()).toBe(true)
    })

    it('就労移行支援の場合trueを返す', () => {
      const data: FacilityData = {
        ...validFacilityData,
        services: [
          {
            id: 'service-1',
            facilityId: 'facility-1',
            serviceType: 'EMPLOYMENT_TRANSITION',
            createdAt: new Date('2024-01-01'),
          },
        ],
      }
      const facility = Facility.create(data)
      expect(facility?.isEmploymentFacility()).toBe(true)
    })

    it('生活介護の場合falseを返す', () => {
      const facility = Facility.create(validFacilityData)
      expect(facility?.isEmploymentFacility()).toBe(false)
    })

    it('サービス種別がnullの場合falseを返す', () => {
      const data: FacilityData = {
        ...validFacilityData,
        services: [],
      }
      const facility = Facility.create(data)
      expect(facility?.isEmploymentFacility()).toBe(false)
    })
  })

  describe('isChildCareFacility', () => {
    it('現在、児童向けサービスは未定義のためfalseを返す', () => {
      const facility = Facility.create(validFacilityData)
      expect(facility?.isChildCareFacility()).toBe(false)
    })

    it('サービス種別がnullの場合falseを返す', () => {
      const data: FacilityData = {
        ...validFacilityData,
        services: [],
      }
      const facility = Facility.create(data)
      expect(facility?.isChildCareFacility()).toBe(false)
    })
  })
})
