export type FacilityCorporationData = {
  id?: string
  name: string
  nameKana: string | null
  corporateNumber: string | null
  postalCode: string | null
  addressCity: string | null
  addressDetail: string | null
  phone: string | null
  fax: string | null
  url: string | null
}

export interface FacilityCorporationRepository {
  findByCorporateNumber(corporateNumber: string): Promise<FacilityCorporationData | null>
  findByName(name: string): Promise<FacilityCorporationData | null>
  save(corporation: FacilityCorporationData): Promise<string>
}
