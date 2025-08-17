import { describe, expect, it } from 'bun:test'
import { Facility, type FacilityData } from './model'

describe('Facility', () => {
  const validFacilityData: FacilityData = {
    id: 'facility-1',
    profile: {
      id: 'profile-1',
      facilityId: 'facility-1',
      name: 'テスト施設',
      nameKana: 'テストシセツ',
      description: 'これはテスト施設の説明文です。',
      serviceType: '生活介護',
      capacity: null,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
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
      prefecture: '東京都',
      city: '渋谷区',
      street: '1-1-1',
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
        profile: {
          ...validFacilityData.profile!,
          serviceType: '無効なサービス',
        },
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
        serviceType: '就労継続支援A型',
      })

      expect(result).toBe(true)
      expect(facility!.getName()).toBe('更新された施設名')
      expect(facility!.getNameKana()).toBe('コウシンサレタシセツメイ')
      expect(facility!.getDescription()).toBe('新しい説明文です。')
      expect(facility!.getServiceType()).toBe('就労継続支援A型')
    })

    it('無効な施設名の場合falseを返す', () => {
      const facility = Facility.create(validFacilityData)
      expect(facility).not.toBeNull()

      const result = facility!.updateBasicInfo({
        name: '', // 空文字は無効
        nameKana: 'コウシンサレタシセツメイ',
        description: '新しい説明文です。',
        serviceType: '就労継続支援A型',
      })

      expect(result).toBe(false)
      // 元の値が保持されている
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

      expect(result).toBe(true)
      expect(facility!.getName()).toBe('更新された施設名')
      expect(facility!.getNameKana()).toBeNull() // 無効なカナ名はnullになる
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

      expect(result).toBe(true)
      expect(facility!.getName()).toBe('更新された施設名')
      expect(facility!.getServiceType()).toBeNull() // 無効なサービス種別はnullになる
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

      expect(result).toBe(true)
      expect(facility!.getName()).toBe('更新された施設名')
      expect(facility!.getDescription()).toBeNull() // 501文字以上はnullになる
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

      expect(result).toBe(true)
      expect(facility!.getName()).toBe('更新された施設名')
      expect(facility!.getNameKana()).toBeNull()
      expect(facility!.getDescription()).toBeNull()
      expect(facility!.getServiceType()).toBeNull()
    })
  })

  describe('updateContact', () => {
    it('有効なデータで連絡先を更新できる', () => {
      const facility = Facility.create(validFacilityData)
      expect(facility).not.toBeNull()

      facility!.updateContact({
        phone: '090-1234-5678',
        fax: '03-9876-5432',
        email: 'new@example.com',
        website: 'https://new-example.com',
      })

      expect(facility!.getPhone()).toBe('090-1234-5678')
      expect(facility!.getFax()).toBe('03-9876-5432')
      expect(facility!.getEmail()).toBe('new@example.com')
      expect(facility!.getWebsite()).toBe('https://new-example.com')
    })

    it('バリデーションなしで値を更新できる', () => {
      const facility = Facility.create(validFacilityData)
      expect(facility).not.toBeNull()

      // 現在のモデルではバリデーションを行わない
      facility!.updateContact({
        phone: '123', // 短い値でも受け入れる
        email: 'invalid-email', // @がなくても受け入れる
      })

      expect(facility!.getPhone()).toBe('123')
      expect(facility!.getEmail()).toBe('invalid-email')
    })

    it('null値を許可する', () => {
      const facility = Facility.create(validFacilityData)
      expect(facility).not.toBeNull()

      facility!.updateContact({
        phone: null,
        fax: null,
        email: null,
        website: null,
      })

      expect(facility!.getPhone()).toBeNull()
      expect(facility!.getFax()).toBeNull()
      expect(facility!.getEmail()).toBeNull()
      expect(facility!.getWebsite()).toBeNull()
    })
  })

  describe('updateLocation', () => {
    it('有効なデータで所在地を更新できる', () => {
      const facility = Facility.create(validFacilityData)
      expect(facility).not.toBeNull()

      facility!.updateLocation({
        address: '大阪府大阪市北区2-2-2',
        postalCode: '530-0001',
        accessInfo: 'バス停から徒歩3分',
      })

      expect(facility!.getAddress()).toBe('大阪府大阪市北区2-2-2')
      expect(facility!.getPostalCode()).toBe('530-0001')
      expect(facility!.getAccessInfo()).toBe('バス停から徒歩3分')
    })

    it('バリデーションなしで値を更新できる', () => {
      const facility = Facility.create(validFacilityData)
      expect(facility).not.toBeNull()

      // 現在のモデルではバリデーションを行わない
      facility!.updateLocation({
        address: 'あ'.repeat(256), // 長い値でも受け入れる
        postalCode: '123456', // フォーマットが違っても受け入れる
        accessInfo: 'バス停から徒歩3分',
      })

      expect(facility!.getAddress()).toBe('あ'.repeat(256))
      expect(facility!.getPostalCode()).toBe('123456')
      expect(facility!.getAccessInfo()).toBe('バス停から徒歩3分')
    })

    it('null値を許可する', () => {
      const facility = Facility.create(validFacilityData)
      expect(facility).not.toBeNull()

      facility!.updateLocation({
        address: null,
        postalCode: null,
        accessInfo: null,
      })

      expect(facility!.getAddress()).toBeNull()
      expect(facility!.getPostalCode()).toBeNull()
      expect(facility!.getAccessInfo()).toBeNull()
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
      expect(facility!.getServiceType()).toBe('生活介護')
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
          serviceType: null,
        },
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
        profile: {
          ...validFacilityData.profile!,
          serviceType: '就労継続支援A型',
        },
      }
      const facility = Facility.create(data)
      expect(facility?.isEmploymentFacility()).toBe(true)
    })

    it('就労継続支援B型の場合trueを返す', () => {
      const data: FacilityData = {
        ...validFacilityData,
        profile: {
          ...validFacilityData.profile!,
          serviceType: '就労継続支援B型',
        },
      }
      const facility = Facility.create(data)
      expect(facility?.isEmploymentFacility()).toBe(true)
    })

    it('就労移行支援の場合trueを返す', () => {
      const data: FacilityData = {
        ...validFacilityData,
        profile: {
          ...validFacilityData.profile!,
          serviceType: '就労移行支援',
        },
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
        profile: {
          ...validFacilityData.profile!,
          serviceType: null,
        },
      }
      const facility = Facility.create(data)
      expect(facility?.isEmploymentFacility()).toBe(false)
    })
  })

  describe('isChildCareFacility', () => {
    it('児童発達支援の場合trueを返す', () => {
      const data: FacilityData = {
        ...validFacilityData,
        profile: {
          ...validFacilityData.profile!,
          serviceType: '児童発達支援',
        },
      }
      const facility = Facility.create(data)
      expect(facility?.isChildCareFacility()).toBe(true)
    })

    it('放課後等デイサービスの場合trueを返す', () => {
      const data: FacilityData = {
        ...validFacilityData,
        profile: {
          ...validFacilityData.profile!,
          serviceType: '放課後等デイサービス',
        },
      }
      const facility = Facility.create(data)
      expect(facility?.isChildCareFacility()).toBe(true)
    })

    it('生活介護の場合falseを返す', () => {
      const facility = Facility.create(validFacilityData)
      expect(facility?.isChildCareFacility()).toBe(false)
    })

    it('サービス種別がnullの場合falseを返す', () => {
      const data: FacilityData = {
        ...validFacilityData,
        profile: {
          ...validFacilityData.profile!,
          serviceType: null,
        },
      }
      const facility = Facility.create(data)
      expect(facility?.isChildCareFacility()).toBe(false)
    })
  })
})
