import { isPhoneNumber, PhoneNumber, type PhoneNumberError } from '../common/phone-number'
import { Address, type AddressData, type AddressError, isAddress } from './address'
import {
  EmergencyContact,
  type EmergencyContactData,
  type EmergencyContactError,
  isEmergencyContact,
} from './emergency-contact'

export interface ClientData {
  id: string
  tenantId: string
  name: string
  nameKana?: string | null
  birthDate?: Date
  gender?: 'male' | 'female' | 'other' | null
  address?: AddressData | null
  phoneNumber?: string | null
  emergencyContact?: EmergencyContactData | null
  disability?: string
  careLevel?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateClientParams {
  tenantId: string
  name: string
  nameKana?: string | null
  birthDate?: Date
  gender?: 'male' | 'female' | 'other'
  address?: AddressData
  phoneNumber?: string
  emergencyContact?: EmergencyContactData
  disability?: string
  careLevel?: string
  notes?: string
}

export interface UpdateClientParams {
  name?: string
  nameKana?: string | null
  birthDate?: Date
  gender?: 'male' | 'female' | 'other'
  address?: AddressData | null
  phoneNumber?: string | null
  emergencyContact?: EmergencyContactData | null
  disability?: string
  careLevel?: string
  notes?: string
}

export type ClientError =
  | { type: 'MissingName'; message: string }
  | PhoneNumberError
  | AddressError
  | EmergencyContactError

export class Client {
  private constructor(
    private readonly id: string,
    private readonly tenantId: string,
    private readonly name: string,
    private readonly nameKana: string | null,
    private readonly birthDate: Date | undefined,
    private readonly gender: 'male' | 'female' | 'other' | null,
    private readonly address: Address | null,
    private readonly phoneNumber: PhoneNumber | null,
    private readonly emergencyContact: EmergencyContact | null,
    private readonly disability: string | undefined,
    private readonly careLevel: string | undefined,
    private readonly notes: string | undefined,
    private readonly createdAt: Date,
    private readonly updatedAt: Date,
  ) {}

  static create(params: CreateClientParams): Client | ClientError {
    if (!params.name) {
      return { type: 'MissingName', message: '名前は必須です' }
    }

    let phoneNumber: PhoneNumber | null = null
    if (typeof params.phoneNumber === 'string') {
      const createdPhoneNumber = PhoneNumber.create(params.phoneNumber)
      if (!isPhoneNumber(createdPhoneNumber)) {
        return createdPhoneNumber
      }
      phoneNumber = createdPhoneNumber
    }

    let address: Address | null = null
    if (params.address) {
      const createdAddress = Address.create(params.address)
      if (!isAddress(createdAddress)) {
        return createdAddress
      }
      address = createdAddress
    }

    let emergencyContact: EmergencyContact | null = null
    if (params.emergencyContact) {
      const createdEmergencyContact = EmergencyContact.create(params.emergencyContact)
      if (!isEmergencyContact(createdEmergencyContact)) {
        return createdEmergencyContact
      }
      emergencyContact = createdEmergencyContact
    }

    const now = new Date()
    return new Client(
      Client.generateId(),
      params.tenantId,
      params.name,
      params.nameKana ?? null,
      params.birthDate,
      params.gender ?? null,
      address,
      phoneNumber,
      emergencyContact,
      params.disability,
      params.careLevel,
      params.notes,
      now,
      now,
    )
  }

  static fromData(data: ClientData): Client | ClientError {
    let phoneNumber: PhoneNumber | null = null
    if (data.phoneNumber) {
      const createdPhoneNumber = PhoneNumber.fromString(data.phoneNumber)
      if (!isPhoneNumber(createdPhoneNumber)) {
        return createdPhoneNumber
      }
      phoneNumber = createdPhoneNumber
    }

    let address: Address | null = null
    if (data.address) {
      const createdAddress = Address.create(data.address)
      if (!isAddress(createdAddress)) {
        return createdAddress
      }
      address = createdAddress
    }

    let emergencyContact: EmergencyContact | null = null
    if (data.emergencyContact) {
      const createdEmergencyContact = EmergencyContact.create(data.emergencyContact)
      if (!isEmergencyContact(createdEmergencyContact)) {
        return createdEmergencyContact
      }
      emergencyContact = createdEmergencyContact
    }

    return new Client(
      data.id,
      data.tenantId,
      data.name,
      data.nameKana ?? null,
      data.birthDate,
      data.gender ?? null,
      address,
      phoneNumber,
      emergencyContact,
      data.disability,
      data.careLevel,
      data.notes,
      data.createdAt,
      data.updatedAt,
    )
  }

  update(params: UpdateClientParams): Client | ClientError {
    let phoneNumber: PhoneNumber | null = this.phoneNumber
    if (params.phoneNumber !== undefined) {
      if (params.phoneNumber === null) {
        phoneNumber = null
      } else {
        const createdPhoneNumber = PhoneNumber.create(params.phoneNumber)
        if (!isPhoneNumber(createdPhoneNumber)) {
          return createdPhoneNumber as PhoneNumberError
        }
        phoneNumber = createdPhoneNumber
      }
    }

    let address: Address | null = this.address
    if (params.address !== undefined) {
      if (params.address === null) {
        address = null
      } else {
        const createdAddress = Address.create(params.address)
        if (!isAddress(createdAddress)) {
          return createdAddress as AddressError
        }
        address = createdAddress
      }
    }

    let emergencyContact: EmergencyContact | null = this.emergencyContact
    if (params.emergencyContact !== undefined) {
      if (params.emergencyContact === null) {
        emergencyContact = null
      } else {
        const createdEmergencyContact = EmergencyContact.create(params.emergencyContact)
        if (!isEmergencyContact(createdEmergencyContact)) {
          return createdEmergencyContact as EmergencyContactError
        }
        emergencyContact = createdEmergencyContact
      }
    }

    return new Client(
      this.id,
      this.tenantId,
      params.name ?? this.name,
      params.nameKana ?? this.nameKana,
      params.birthDate ?? this.birthDate,
      params.gender ?? this.gender,
      address,
      phoneNumber,
      emergencyContact,
      params.disability ?? this.disability,
      params.careLevel ?? this.careLevel,
      params.notes ?? this.notes,
      this.createdAt,
      new Date(),
    )
  }

  toData(): ClientData {
    return {
      id: this.id,
      tenantId: this.tenantId,
      name: this.name,
      nameKana: this.nameKana ?? undefined,
      birthDate: this.birthDate,
      gender: this.gender ?? undefined,
      address: this.address?.toData(),
      phoneNumber: this.phoneNumber?.toString(),
      emergencyContact: this.emergencyContact?.toData(),
      disability: this.disability,
      careLevel: this.careLevel,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }

  private static generateId(): string {
    return crypto.randomUUID()
  }
}

// Type guard
export function isClient(value: Client | ClientError): value is Client {
  return !(value as ClientError).type
}
