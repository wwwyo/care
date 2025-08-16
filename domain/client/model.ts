export type ClientProfile = {
  id: string
  clientId: string
  name: string
  nameKana?: string
  gender?: string
  birthDate?: Date
  phone?: string
}

export type ClientAddress = {
  id: string
  clientId: string
  postalCode?: string
  prefecture?: string
  city?: string
  street?: string
  building?: string
}

export class Client {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public profile?: ClientProfile,
    public addresses: ClientAddress[] = [],
  ) {}

  // ドメインロジック: プロフィール設定
  setProfile(profile: Omit<ClientProfile, 'id' | 'clientId'>): void {
    this.profile = {
      id: crypto.randomUUID(),
      clientId: this.id,
      ...profile,
    }
  }

  // ドメインロジック: 住所追加
  addAddress(address: Omit<ClientAddress, 'id' | 'clientId'>): void {
    this.addresses.push({
      id: crypto.randomUUID(),
      clientId: this.id,
      ...address,
    })
  }

  // ドメインロジック: メイン住所取得
  getPrimaryAddress(): ClientAddress | undefined {
    return this.addresses[0]
  }

  // ドメインロジック: プロフィールが完了しているか
  isProfileComplete(): boolean {
    return !!this.profile && !!this.profile.name && this.addresses.length > 0
  }

  // ファクトリメソッド
  static create(params: { userId: string; name: string }): Client {
    const client = new Client(crypto.randomUUID(), params.userId)
    // プロフィールを初期設定
    client.setProfile({ name: params.name })
    return client
  }
}
