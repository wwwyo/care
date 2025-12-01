export type PhoneNumberError = {
  type: 'InvalidPhoneNumber'
  message: string
}

export class PhoneNumber {
  private constructor(private readonly value: string) {}

  static create(value: string): PhoneNumber | PhoneNumberError {
    const validationResult = PhoneNumber.validate(value)
    if (validationResult) {
      return validationResult
    }
    return new PhoneNumber(value)
  }

  static fromString(value: string): PhoneNumber | PhoneNumberError {
    return PhoneNumber.create(value)
  }

  toString(): string {
    return this.value
  }

  equals(other: PhoneNumber): boolean {
    return this.value === other.value
  }

  private static validate(phoneNumber: string): PhoneNumberError | null {
    // 日本の電話番号形式を検証
    // 携帯電話: 090-1234-5678 (3-4-4形式)
    const mobileRegex = /^0[789]0-\d{4}-\d{4}$/
    // 固定電話: 03-1234-5678 (2-4-4形式)
    const tokyoRegex = /^0[1-9]-\d{4}-\d{4}$/
    // 一般的な市外局番: 045-123-4567 (3-3-4形式)
    const cityRegex = /^0\d{2}-\d{3,4}-\d{4}$/
    // フリーダイヤル: 0120-123-456 (4-3-3形式)
    const tollFreeRegex = /^0120-\d{3}-\d{3}$/

    const isValid =
      mobileRegex.test(phoneNumber) ||
      tokyoRegex.test(phoneNumber) ||
      cityRegex.test(phoneNumber) ||
      tollFreeRegex.test(phoneNumber)

    if (!isValid) {
      return {
        type: 'InvalidPhoneNumber',
        message: `無効な電話番号形式です: ${phoneNumber}`,
      }
    }

    return null
  }
}

// Type guard
export function isPhoneNumber(value: PhoneNumber | PhoneNumberError): value is PhoneNumber {
  return !(value as PhoneNumberError).type
}
