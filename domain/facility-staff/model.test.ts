import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { FacilityStaff } from './model'

// crypto.randomUUID のモック
beforeEach(() => {
  let callCount = 0
  global.crypto = {
    randomUUID: mock(() => `test-uuid-${++callCount}`),
  } as any
})

describe('FacilityStaff', () => {
  describe('constructor', () => {
    test('正しくインスタンスを作成する', () => {
      const staff = new FacilityStaff('staff-1', 'user-1')

      expect(staff.id).toBe('staff-1')
      expect(staff.userId).toBe('user-1')
      expect(staff.facilities).toEqual([])
    })

    test('施設ありでインスタンスを作成する', () => {
      const facilities = [
        {
          id: 'assignment-1',
          facilityStaffId: 'staff-1',
          facilityId: 'facility-1',
        },
      ]

      const staff = new FacilityStaff('staff-1', 'user-1', facilities)

      expect(staff.facilities).toEqual(facilities)
    })
  })

  describe('assignToFacility', () => {
    test('施設に割り当てる', () => {
      const staff = new FacilityStaff('staff-1', 'user-1')

      staff.assignToFacility('facility-1')

      expect(staff.facilities).toHaveLength(1)
      expect(staff.facilities[0]).toEqual({
        id: 'test-uuid-1',
        facilityStaffId: 'staff-1',
        facilityId: 'facility-1',
      })
    })

    test('既に割り当て済みの施設は重複して追加しない', () => {
      const staff = new FacilityStaff('staff-1', 'user-1')

      staff.assignToFacility('facility-1')
      staff.assignToFacility('facility-1')

      expect(staff.facilities).toHaveLength(1)
    })

    test('複数の施設に割り当てる', () => {
      const staff = new FacilityStaff('staff-1', 'user-1')

      staff.assignToFacility('facility-1')
      staff.assignToFacility('facility-2')

      expect(staff.facilities).toHaveLength(2)
      expect(staff.facilities[0]?.facilityId).toBe('facility-1')
      expect(staff.facilities[1]?.facilityId).toBe('facility-2')
    })
  })

  describe('belongsToFacility', () => {
    test('施設に所属している場合はtrueを返す', () => {
      const staff = new FacilityStaff('staff-1', 'user-1')
      staff.assignToFacility('facility-1')

      expect(staff.belongsToFacility('facility-1')).toBe(true)
    })

    test('施設に所属していない場合はfalseを返す', () => {
      const staff = new FacilityStaff('staff-1', 'user-1')

      expect(staff.belongsToFacility('facility-1')).toBe(false)
    })

    test('複数施設の所属を正しく判定する', () => {
      const staff = new FacilityStaff('staff-1', 'user-1')
      staff.assignToFacility('facility-1')
      staff.assignToFacility('facility-2')

      expect(staff.belongsToFacility('facility-1')).toBe(true)
      expect(staff.belongsToFacility('facility-2')).toBe(true)
      expect(staff.belongsToFacility('facility-3')).toBe(false)
    })
  })

  describe('create (ファクトリメソッド)', () => {
    test('新しいFacilityStaffインスタンスを作成する', () => {
      const staff = FacilityStaff.create({
        userId: 'user-1',
      })

      expect(staff.id).toBe('test-uuid-1')
      expect(staff.userId).toBe('user-1')
      expect(staff.facilities).toEqual([])
    })
  })
})
