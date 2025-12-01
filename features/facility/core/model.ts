import type {
  FacilityContact,
  FacilityLocation,
  FacilityProfile,
  FacilityService,
} from '@/lib/generated/prisma/client'
import { FacilityDescription } from './facility-description'
import { FacilityName, FacilityNameKana } from './facility-name'
import { OfficialFacilityId } from './official-facility-id'
import { ServiceType } from './service-type'

export type FacilityData = {
  id: string
  profile: FacilityProfile | null
  location: FacilityLocation | null
  contacts: FacilityContact[]
  services: FacilityService[]
}

export type FacilityError =
  | { type: 'InvalidName'; message: string }
  | { type: 'InvalidNameKana'; message: string }
  | { type: 'InvalidDescription'; message: string }
  | { type: 'InvalidServiceType'; message: string }

export class Facility {
  private constructor(
    private readonly id: string,
    private readonly name: FacilityName,
    private readonly nameKana: FacilityNameKana | null,
    private readonly description: FacilityDescription | null,
    private readonly serviceType: ServiceType | null,
    private readonly addressCity: string | null,
    private readonly addressDetail: string | null,
    private readonly postalCode: string | null,
    private readonly phone: string | null,
    private readonly fax: string | null,
    private readonly email: string | null,
    private readonly website: string | null,
    private readonly accessInfo: string | null,
    private readonly latitude: number | null,
    private readonly longitude: number | null,
    private readonly capacity: number | null,
    private readonly wamId: string | null,
    private readonly officialId: OfficialFacilityId | null,
    private readonly corporationId: string | null,
  ) {}

  static create(data: FacilityData): Facility | null {
    const mainContact = data.contacts.find((c) => c.contactType === 'main')
    const primaryService = data.services[0]

    // 必須項目のバリデーション
    const name = FacilityName.create(data.profile?.name)
    if (!name) return null

    return new Facility(
      data.id,
      name,
      FacilityNameKana.create(data.profile?.nameKana),
      FacilityDescription.create(data.profile?.description),
      ServiceType.create(primaryService?.serviceType),
      data.location?.addressCity ?? null,
      data.location?.addressDetail ?? null,
      data.location?.postalCode ?? null,
      mainContact?.phone ?? null,
      mainContact?.fax ?? null,
      mainContact?.email ?? null,
      mainContact?.website ?? null,
      data.location?.accessInfo ?? null,
      data.location?.latitude ? Number(data.location.latitude) : null,
      data.location?.longitude ? Number(data.location.longitude) : null,
      data.profile?.capacity ?? null,
      data.profile?.wamId ?? null,
      OfficialFacilityId.create(data.profile?.officialId),
      data.profile?.corporationId ?? null,
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
    if (!this.addressCity && !this.addressDetail) return null
    return [this.addressCity, this.addressDetail].filter(Boolean).join('')
  }

  getAddressCity(): string | null {
    return this.addressCity
  }

  getAddressDetail(): string | null {
    return this.addressDetail
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
    capacity?: number | null
    officialId?: string | null
  }): Facility | FacilityError {
    const newName = FacilityName.create(params.name)
    if (!newName) {
      return { type: 'InvalidName', message: '施設名が無効です' }
    }

    const newNameKana =
      params.nameKana !== undefined ? FacilityNameKana.create(params.nameKana) : this.nameKana
    const newDescription =
      params.description !== undefined
        ? FacilityDescription.create(params.description)
        : this.description
    const newServiceType =
      params.serviceType !== undefined ? ServiceType.create(params.serviceType) : this.serviceType
    const newCapacity = params.capacity !== undefined ? params.capacity : this.capacity
    const newOfficialId =
      params.officialId !== undefined
        ? OfficialFacilityId.create(params.officialId)
        : this.officialId

    return new Facility(
      this.id,
      newName,
      newNameKana,
      newDescription,
      newServiceType,
      this.addressCity,
      this.addressDetail,
      this.postalCode,
      this.phone,
      this.fax,
      this.email,
      this.website,
      this.accessInfo,
      this.latitude,
      this.longitude,
      newCapacity,
      this.wamId,
      newOfficialId,
      this.corporationId,
    )
  }

  updateContact(params: {
    phone?: string | null
    fax?: string | null
    email?: string | null
    website?: string | null
  }): Facility {
    return new Facility(
      this.id,
      this.name,
      this.nameKana,
      this.description,
      this.serviceType,
      this.addressCity,
      this.addressDetail,
      this.postalCode,
      params.phone !== undefined ? params.phone : this.phone,
      params.fax !== undefined ? params.fax : this.fax,
      params.email !== undefined ? params.email : this.email,
      params.website !== undefined ? params.website : this.website,
      this.accessInfo,
      this.latitude,
      this.longitude,
      this.capacity,
      this.wamId,
      this.officialId,
      this.corporationId,
    )
  }

  updateLocation(params: {
    addressCity?: string | null
    addressDetail?: string | null
    postalCode?: string | null
    accessInfo?: string | null
    latitude?: number | null
    longitude?: number | null
  }): Facility {
    return new Facility(
      this.id,
      this.name,
      this.nameKana,
      this.description,
      this.serviceType,
      params.addressCity !== undefined ? params.addressCity : this.addressCity,
      params.addressDetail !== undefined ? params.addressDetail : this.addressDetail,
      params.postalCode !== undefined ? params.postalCode : this.postalCode,
      this.phone,
      this.fax,
      this.email,
      this.website,
      params.accessInfo !== undefined ? params.accessInfo : this.accessInfo,
      params.latitude !== undefined ? params.latitude : this.latitude,
      params.longitude !== undefined ? params.longitude : this.longitude,
      this.capacity,
      this.wamId,
      this.officialId,
      this.corporationId,
    )
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

  getCapacity(): number | null {
    return this.capacity
  }

  getWamId(): string | null {
    return this.wamId
  }

  getOfficialId(): string | null {
    return this.officialId?.getValue() ?? null
  }

  getCorporationId(): string | null {
    return this.corporationId
  }

  // ビジネスロジック
  isEmploymentFacility(): boolean {
    return this.serviceType?.isEmploymentService() ?? false
  }

  isChildCareFacility(): boolean {
    return this.serviceType?.isChildService() ?? false
  }

  hasCompleteProfile(): boolean {
    return !!(
      this.name &&
      this.serviceType &&
      (this.addressCity || this.addressDetail) &&
      this.phone &&
      this.description
    )
  }
}

// Type guard
export function isFacility(value: Facility | FacilityError): value is Facility {
  return !(value as FacilityError).type
}
