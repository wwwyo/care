import { isPhoneNumber, PhoneNumber, type PhoneNumberError } from '../common/phone-number'

export interface EmergencyContactData {
  name: string
  relationship: string
  phoneNumber: string
}

export type EmergencyContactError =
  | { type: 'MissingName'; message: string }
  | { type: 'MissingRelationship'; message: string }
  | { type: 'MissingPhoneNumber'; message: string }
  | PhoneNumberError

export class EmergencyContact {
  private constructor(
    private readonly name: string,
    private readonly relationship: string,
    private readonly phoneNumber: PhoneNumber,
  ) {}

  static create(data: EmergencyContactData): EmergencyContact | EmergencyContactError {
    if (!data.name) {
      return { type: 'MissingName', message: '緊急連絡先の名前は必須です' }
    }
    if (!data.relationship) {
      return { type: 'MissingRelationship', message: '続柄は必須です' }
    }
    if (!data.phoneNumber) {
      return { type: 'MissingPhoneNumber', message: '緊急連絡先の電話番号は必須です' }
    }

    const phoneNumber = PhoneNumber.create(data.phoneNumber)
    if (!isPhoneNumber(phoneNumber)) {
      return phoneNumber
    }

    return new EmergencyContact(data.name, data.relationship, phoneNumber)
  }

  getName(): string {
    return this.name
  }

  getRelationship(): string {
    return this.relationship
  }

  getPhoneNumber(): string {
    return this.phoneNumber.toString()
  }

  toData(): EmergencyContactData {
    return {
      name: this.name,
      relationship: this.relationship,
      phoneNumber: this.phoneNumber.toString(),
    }
  }

  equals(other: EmergencyContact): boolean {
    return (
      this.name === other.name &&
      this.relationship === other.relationship &&
      this.phoneNumber.equals(other.phoneNumber)
    )
  }
}

// Type guard
export function isEmergencyContact(
  value: EmergencyContact | EmergencyContactError,
): value is EmergencyContact {
  return !(value as EmergencyContactError).type
}
