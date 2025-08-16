export type FacilityStaffRole = {
  id: string
  facilityStaffId: string
  facilityId: string
  role: 'admin' | 'staff' | 'viewer'
}

export type FacilityAssignment = {
  id: string
  facilityStaffId: string
  facilityId: string
}

export class FacilityStaff {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public facilities: FacilityAssignment[] = [],
    public roles: FacilityStaffRole[] = [],
  ) {}

  // ドメインロジック: 施設に割り当て
  assignToFacility(facilityId: string, role: 'admin' | 'staff' | 'viewer' = 'staff'): void {
    // 既に割り当て済みの場合はスキップ
    if (this.facilities.some((f) => f.facilityId === facilityId)) {
      return
    }

    // 施設割り当て追加
    this.facilities.push({
      id: crypto.randomUUID(),
      facilityStaffId: this.id,
      facilityId,
    })

    // ロール追加
    this.roles.push({
      id: crypto.randomUUID(),
      facilityStaffId: this.id,
      facilityId,
      role,
    })
  }

  // ドメインロジック: 特定施設のロール取得
  getRoleForFacility(facilityId: string): FacilityStaffRole | undefined {
    return this.roles.find((r) => r.facilityId === facilityId)
  }

  // ドメインロジック: 管理者権限を持つか
  isAdminForFacility(facilityId: string): boolean {
    const role = this.getRoleForFacility(facilityId)
    return role?.role === 'admin'
  }

  // ドメインロジック: 施設に所属しているか
  belongsToFacility(facilityId: string): boolean {
    return this.facilities.some((f) => f.facilityId === facilityId)
  }

  // ファクトリメソッド
  static create(params: { userId: string }): FacilityStaff {
    return new FacilityStaff(crypto.randomUUID(), params.userId)
  }
}
