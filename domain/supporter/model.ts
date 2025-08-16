export type SupporterProfile = {
  id: string
  supporterId: string
  name: string
  nameKana?: string
  gender?: string
  birthDate?: Date
  phone?: string
  tenantId: string
}

export class Supporter {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly tenantId: string,
    public profile?: SupporterProfile,
  ) {}

  // ドメインロジック: プロフィール設定
  setProfile(profile: Omit<SupporterProfile, 'id' | 'supporterId' | 'tenantId'>): void {
    this.profile = {
      id: crypto.randomUUID(),
      supporterId: this.id,
      tenantId: this.tenantId,
      ...profile,
    }
  }

  // ドメインロジック: プロフィールが完了しているか
  isProfileComplete(): boolean {
    return !!this.profile && !!this.profile.name
  }

  // ファクトリメソッド
  static create(params: { userId: string; tenantId: string }): Supporter {
    return new Supporter(crypto.randomUUID(), params.userId, params.tenantId)
  }
}
