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
  ) {}

  // ドメインロジック: 施設に割り当て
  assignToFacility(facilityId: string): void {
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
