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
      expect(staff.roles).toEqual([])
    })

    test('施設とロールありでインスタンスを作成する', () => {
      const facilities = [
        {
          id: 'assignment-1',
          facilityStaffId: 'staff-1',
          facilityId: 'facility-1',
        },
      ]
      const roles = [
        {
          id: 'role-1',
          facilityStaffId: 'staff-1',
          facilityId: 'facility-1',
          role: 'admin' as const,
        },
      ]

      const staff = new FacilityStaff('staff-1', 'user-1', facilities, roles)

      expect(staff.facilities).toEqual(facilities)
      expect(staff.roles).toEqual(roles)
    })
  })

  describe('assignToFacility', () => {
    test('施設に割り当てる（デフォルトロール）', () => {
      const staff = new FacilityStaff('staff-1', 'user-1')

      staff.assignToFacility('facility-1')

      expect(staff.facilities).toHaveLength(1)
      expect(staff.facilities[0]).toEqual({
        id: 'test-uuid-1',
        facilityStaffId: 'staff-1',
        facilityId: 'facility-1',
      })

      expect(staff.roles).toHaveLength(1)
      expect(staff.roles[0]).toEqual({
        id: 'test-uuid-2',
        facilityStaffId: 'staff-1',
        facilityId: 'facility-1',
        role: 'staff',
      })
    })

    test('施設に管理者として割り当てる', () => {
      const staff = new FacilityStaff('staff-1', 'user-1')

      staff.assignToFacility('facility-1', 'admin')

      expect(staff.roles[0]?.role).toBe('admin')
    })

    test('施設に閲覧者として割り当てる', () => {
      const staff = new FacilityStaff('staff-1', 'user-1')

      staff.assignToFacility('facility-1', 'viewer')

      expect(staff.roles[0]?.role).toBe('viewer')
    })

    test('既に割り当て済みの施設は重複して追加しない', () => {
      const staff = new FacilityStaff('staff-1', 'user-1')

      staff.assignToFacility('facility-1', 'staff')
      staff.assignToFacility('facility-1', 'admin')

      expect(staff.facilities).toHaveLength(1)
      expect(staff.roles).toHaveLength(1)
      expect(staff.roles[0]?.role).toBe('staff')
    })

    test('複数の施設に割り当てる', () => {
      const staff = new FacilityStaff('staff-1', 'user-1')

      staff.assignToFacility('facility-1', 'admin')
      staff.assignToFacility('facility-2', 'staff')

      expect(staff.facilities).toHaveLength(2)
      expect(staff.roles).toHaveLength(2)
      expect(staff.facilities[0]?.facilityId).toBe('facility-1')
      expect(staff.facilities[1]?.facilityId).toBe('facility-2')
      expect(staff.roles[0]?.role).toBe('admin')
      expect(staff.roles[1]?.role).toBe('staff')
    })
  })

  describe('getRoleForFacility', () => {
    test('施設のロールを取得する', () => {
      const staff = new FacilityStaff('staff-1', 'user-1')
      staff.assignToFacility('facility-1', 'admin')

      const role = staff.getRoleForFacility('facility-1')

      expect(role?.role).toBe('admin')
    })

    test('割り当てられていない施設の場合はundefinedを返す', () => {
      const staff = new FacilityStaff('staff-1', 'user-1')

      const role = staff.getRoleForFacility('facility-1')

      expect(role).toBeUndefined()
    })
  })

  describe('isAdminForFacility', () => {
    test('管理者権限を持つ場合はtrueを返す', () => {
      const staff = new FacilityStaff('staff-1', 'user-1')
      staff.assignToFacility('facility-1', 'admin')

      expect(staff.isAdminForFacility('facility-1')).toBe(true)
    })

    test('スタッフ権限の場合はfalseを返す', () => {
      const staff = new FacilityStaff('staff-1', 'user-1')
      staff.assignToFacility('facility-1', 'staff')

      expect(staff.isAdminForFacility('facility-1')).toBe(false)
    })

    test('閲覧者権限の場合はfalseを返す', () => {
      const staff = new FacilityStaff('staff-1', 'user-1')
      staff.assignToFacility('facility-1', 'viewer')

      expect(staff.isAdminForFacility('facility-1')).toBe(false)
    })

    test('割り当てられていない施設の場合はfalseを返す', () => {
      const staff = new FacilityStaff('staff-1', 'user-1')

      expect(staff.isAdminForFacility('facility-1')).toBe(false)
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
      expect(staff.roles).toEqual([])
    })
  })
})
