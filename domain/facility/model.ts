import type { FacilityContact, FacilityLocation, FacilityProfile } from '@/lib/generated/prisma'
import { FacilityDescription } from './facility-description'
import { FacilityName, FacilityNameKana } from './facility-name'
import { ServiceType } from './service-type'

export type FacilityData = {
  id: string
  profile: FacilityProfile | null
  location: FacilityLocation | null
  contacts: FacilityContact[]
}

export class Facility {
  private constructor(
    private readonly id: string,
    private name: FacilityName,
    private nameKana: FacilityNameKana | null,
    private description: FacilityDescription | null,
    private serviceType: ServiceType | null,
    private address: string | null,
    private postalCode: string | null,
    private phone: string | null,
    private fax: string | null,
    private email: string | null,
    private website: string | null,
    private accessInfo: string | null,
    private latitude: number | null,
    private longitude: number | null,
  ) {}

  static create(data: FacilityData): Facility | null {
    const mainContact = data.contacts.find((c) => c.contactType === 'main')
    const address = data.location
      ? [data.location.prefecture, data.location.city, data.location.street, data.location.building]
          .filter(Boolean)
          .join('')
      : null

    // 必須項目のバリデーション
    const name = FacilityName.create(data.profile?.name)
    if (!name) return null

    return new Facility(
      data.id,
      name,
      FacilityNameKana.create(data.profile?.nameKana),
      FacilityDescription.create(data.profile?.description),
      ServiceType.create(data.profile?.serviceType),
      address,
      data.location?.postalCode ?? null,
      mainContact?.phone ?? null,
      mainContact?.fax ?? null,
      mainContact?.email ?? null,
      mainContact?.website ?? null,
      data.location?.accessInfo ?? null,
      data.location?.latitude ? Number(data.location.latitude) : null,
      data.location?.longitude ? Number(data.location.longitude) : null,
    )
  }

  getId(): string {
    return this.id
  }

  getName(): string {
    return this.name.getValue()
  }

  getNameKana(): string | null {
    return this.nameKana?.getValue() ?? null
  }

  getDescription(): string | null {
    return this.description?.getValue() ?? null
  }

  getServiceType(): string | null {
    return this.serviceType?.getValue() ?? null
  }

  getAddress(): string | null {
    return this.address
  }

  getPhone(): string | null {
    return this.phone
  }

  getEmail(): string | null {
    return this.email
  }

  getWebsite(): string | null {
    return this.website
  }

  getAccessInfo(): string | null {
    return this.accessInfo
  }

  getCoordinates(): { lat: number; lng: number } | null {
    if (this.latitude === null || this.longitude === null) {
      return null
    }
    return { lat: this.latitude, lng: this.longitude }
  }

  updateBasicInfo(params: {
    name: string
    nameKana?: string | null
    description?: string | null
    serviceType?: string | null
  }): boolean {
    const newName = FacilityName.create(params.name)
    if (!newName) return false

    this.name = newName

    if (params.nameKana !== undefined) {
      this.nameKana = FacilityNameKana.create(params.nameKana)
    }

    if (params.description !== undefined) {
      this.description = FacilityDescription.create(params.description)
    }

    if (params.serviceType !== undefined) {
      this.serviceType = ServiceType.create(params.serviceType)
    }

    return true
  }

  updateContact(params: {
    phone?: string | null
    fax?: string | null
    email?: string | null
    website?: string | null
  }): void {
    if (params.phone !== undefined) this.phone = params.phone
    if (params.fax !== undefined) this.fax = params.fax
    if (params.email !== undefined) this.email = params.email
    if (params.website !== undefined) this.website = params.website
  }

  updateLocation(params: {
    address?: string | null
    postalCode?: string | null
    accessInfo?: string | null
    latitude?: number | null
    longitude?: number | null
  }): void {
    if (params.address !== undefined) this.address = params.address
    if (params.postalCode !== undefined) this.postalCode = params.postalCode
    if (params.accessInfo !== undefined) this.accessInfo = params.accessInfo
    if (params.latitude !== undefined) this.latitude = params.latitude
    if (params.longitude !== undefined) this.longitude = params.longitude
  }

  // Additional getters for repository access
  getPostalCode(): string | null {
    return this.postalCode
  }

  getFax(): string | null {
    return this.fax
  }

  getLatitude(): number | null {
    return this.latitude
  }

  getLongitude(): number | null {
    return this.longitude
  }

  // ビジネスロジック
  isEmploymentFacility(): boolean {
    return this.serviceType?.isEmploymentService() ?? false
  }

  isChildCareFacility(): boolean {
    return this.serviceType?.isChildService() ?? false
  }

  hasCompleteProfile(): boolean {
    return !!(this.name && this.serviceType && this.address && this.phone && this.description)
  }
}
