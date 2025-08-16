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
  userId: string
  tenantId: string
  name: string
  birthDate: Date
  gender: 'male' | 'female' | 'other'
  address: AddressData
  phoneNumber: string
  emergencyContact: EmergencyContactData
  disability?: string
  careLevel?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateClientParams {
  userId: string
  tenantId: string
  name: string
  birthDate: Date
  gender: 'male' | 'female' | 'other'
  address: AddressData
  phoneNumber: string
  emergencyContact: EmergencyContactData
  disability?: string
  careLevel?: string
  notes?: string
}

export interface UpdateClientParams {
  name?: string
  address?: AddressData
  phoneNumber?: string
  emergencyContact?: EmergencyContactData
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
    private readonly userId: string,
    private readonly tenantId: string,
    private readonly name: string,
    private readonly birthDate: Date,
    private readonly gender: 'male' | 'female' | 'other',
    private readonly address: Address,
    private readonly phoneNumber: PhoneNumber,
    private readonly emergencyContact: EmergencyContact,
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

    const phoneNumber = PhoneNumber.create(params.phoneNumber)
    if (!isPhoneNumber(phoneNumber)) {
      return phoneNumber
    }

    const address = Address.create(params.address)
    if (!isAddress(address)) {
      return address
    }

    const emergencyContact = EmergencyContact.create(params.emergencyContact)
    if (!isEmergencyContact(emergencyContact)) {
      return emergencyContact
    }

    const now = new Date()
    return new Client(
      Client.generateId(),
      params.userId,
      params.tenantId,
      params.name,
      params.birthDate,
      params.gender,
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
    const phoneNumber = PhoneNumber.fromString(data.phoneNumber)
    if (!isPhoneNumber(phoneNumber)) {
      return phoneNumber
    }

    const address = Address.create(data.address)
    if (!isAddress(address)) {
      return address
    }

    const emergencyContact = EmergencyContact.create(data.emergencyContact)
    if (!isEmergencyContact(emergencyContact)) {
      return emergencyContact
    }

    return new Client(
      data.id,
      data.userId,
      data.tenantId,
      data.name,
      data.birthDate,
      data.gender,
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
    const phoneNumber = params.phoneNumber
      ? PhoneNumber.create(params.phoneNumber)
      : this.phoneNumber

    if (params.phoneNumber && !isPhoneNumber(phoneNumber)) {
      return phoneNumber as PhoneNumberError
    }

    const address = params.address ? Address.create(params.address) : this.address

    if (params.address && !isAddress(address)) {
      return address as AddressError
    }

    const emergencyContact = params.emergencyContact
      ? EmergencyContact.create(params.emergencyContact)
      : this.emergencyContact

    if (params.emergencyContact && !isEmergencyContact(emergencyContact)) {
      return emergencyContact as EmergencyContactError
    }

    return new Client(
      this.id,
      this.userId,
      this.tenantId,
      params.name ?? this.name,
      this.birthDate,
      this.gender,
      address as Address,
      phoneNumber as PhoneNumber,
      emergencyContact as EmergencyContact,
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
      userId: this.userId,
      tenantId: this.tenantId,
      name: this.name,
      birthDate: this.birthDate,
      gender: this.gender,
      address: this.address.toData(),
      phoneNumber: this.phoneNumber.toString(),
      emergencyContact: this.emergencyContact.toData(),
      disability: this.disability,
      careLevel: this.careLevel,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }

  private static generateId(): string {
    return `client-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
  }
}

// Type guard
export function isClient(value: Client | ClientError): value is Client {
  return !(value as ClientError).type
}
