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

export type ClientSupporter = {
  id: string
  clientId: string
  supporterId: string
  createdAt: Date
  updatedAt: Date
}

export class Client {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public profile?: ClientProfile,
    public addresses: ClientAddress[] = [],
    public supporters: ClientSupporter[] = [],
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

  // ドメインロジック: サポーターを追加
  addSupporter(supporterId: string): void {
    // 既に追加されている場合は追加しない
    if (this.supporters.some((s) => s.supporterId === supporterId)) {
      return
    }

    this.supporters.push({
      id: crypto.randomUUID(),
      clientId: this.id,
      supporterId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

  // ファクトリメソッド
  static create(params: { tenantId: string; name: string; supporterId?: string }): Client {
    const client = new Client(crypto.randomUUID(), params.tenantId)
    // プロフィールを初期設定
    client.setProfile({ name: params.name })
    // サポーターが指定されていれば追加
    if (params.supporterId) {
      client.addSupporter(params.supporterId)
    }
    return client
  }
}
