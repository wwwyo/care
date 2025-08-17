export interface AddressData {
  postalCode?: string
  prefecture: string
  city: string
  street?: string
  building?: string
}

export type AddressError =
  | { type: 'MissingPrefecture'; message: string }
  | { type: 'MissingCity'; message: string }
  | { type: 'MissingStreet'; message: string }
  | { type: 'InvalidPostalCode'; message: string }
  | { type: 'InvalidAddressFormat'; message: string }

export class Address {
  private constructor(
    private readonly postalCode: string | undefined,
    private readonly prefecture: string,
    private readonly city: string,
    private readonly street: string | undefined,
    private readonly building: string | undefined,
  ) {}

  static create(data: AddressData): Address | AddressError {
    if (!data.prefecture) {
      return { type: 'MissingPrefecture', message: '都道府県は必須です' }
    }
    if (!data.city) {
      return { type: 'MissingCity', message: '市区町村は必須です' }
    }
    // streetはオプショナルとして扱う

    if (data.postalCode) {
      const postalCodeValidation = Address.validatePostalCode(data.postalCode)
      if (postalCodeValidation) {
        return postalCodeValidation
      }
    }

    return new Address(data.postalCode, data.prefecture, data.city, data.street, data.building)
  }

  static fromString(fullAddress: string): Address | AddressError {
    // 簡易的な住所パース（実際にはより高度なパーサーが必要）
    if (!fullAddress || fullAddress.trim().length === 0) {
      return { type: 'InvalidAddressFormat', message: '住所が入力されていません' }
    }

    // 都道府県を抽出
    // 京都府、東京都、北海道、〇〇県のパターンに対応
    const prefectureMatch = fullAddress.match(/^(東京都|北海道|大阪府|京都府|.{2,3}県)/)
    if (!prefectureMatch || !prefectureMatch[1]) {
      return { type: 'InvalidAddressFormat', message: '都道府県が含まれていません' }
    }
    const prefecture = prefectureMatch[1]

    // 残りの部分から市区町村以降を抽出
    const remaining = fullAddress.substring(prefecture.length).trim()
    if (!remaining) {
      return { type: 'InvalidAddressFormat', message: '市区町村・番地が含まれていません' }
    }

    // 市区町村と番地を簡易的に分割
    const cityMatch = remaining.match(/^(.+?[市区町村])/)
    let city: string
    let street: string

    if (cityMatch?.[1]) {
      city = cityMatch[1]
      const remainingAfterCity = remaining.substring(city.length).trim()
      street = remainingAfterCity || ''
    } else {
      // 市区町村が見つからない場合は、残り全体を市区町村として扱う
      city = remaining
      street = ''
    }

    return new Address(undefined, prefecture, city, street, undefined)
  }

  toString(): string {
    let address = `${this.prefecture}${this.city}`
    if (this.street) {
      address += this.street
    }
    if (this.building) {
      address += ` ${this.building}`
    }
    return address
  }

  toStringWithPostalCode(): string {
    if (this.postalCode) {
      return `〒${this.postalCode} ${this.toString()}`
    }
    return this.toString()
  }

  toData(): AddressData {
    return {
      postalCode: this.postalCode,
      prefecture: this.prefecture,
      city: this.city,
      street: this.street,
      building: this.building,
    }
  }

  equals(other: Address): boolean {
    return (
      this.postalCode === other.postalCode &&
      this.prefecture === other.prefecture &&
      this.city === other.city &&
      this.street === other.street &&
      this.building === other.building
    )
  }

  private static validatePostalCode(postalCode: string): AddressError | null {
    // 日本の郵便番号形式（7桁、ハイフンあり/なし）
    const postalCodeRegex = /^\d{3}-?\d{4}$/
    if (!postalCodeRegex.test(postalCode)) {
      return { type: 'InvalidPostalCode', message: `無効な郵便番号形式です: ${postalCode}` }
    }
    return null
  }
}

// Type guard
export function isAddress(value: Address | AddressError): value is Address {
  return !(value as AddressError).type
}
