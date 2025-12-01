import type {
  FacilityCorporationData,
  FacilityCorporationRepository,
} from '@/features/facility/core/corporation-repository'
import { prisma } from '@/lib/prisma'

async function findByCorporateNumber(
  corporateNumber: string,
): Promise<FacilityCorporationData | null> {
  const corporation = await prisma.facilityCorporation.findUnique({
    where: { corporateNumber },
  })

  if (!corporation) return null

  return {
    id: corporation.id,
    name: corporation.name,
    nameKana: corporation.nameKana,
    corporateNumber: corporation.corporateNumber,
    postalCode: corporation.postalCode,
    addressCity: corporation.addressCity,
    addressDetail: corporation.addressDetail,
    phone: corporation.phone,
    fax: corporation.fax,
    url: corporation.url,
  }
}

async function findByName(name: string): Promise<FacilityCorporationData | null> {
  const corporation = await prisma.facilityCorporation.findFirst({
    where: { name },
  })

  if (!corporation) return null

  return {
    id: corporation.id,
    name: corporation.name,
    nameKana: corporation.nameKana,
    corporateNumber: corporation.corporateNumber,
    postalCode: corporation.postalCode,
    addressCity: corporation.addressCity,
    addressDetail: corporation.addressDetail,
    phone: corporation.phone,
    fax: corporation.fax,
    url: corporation.url,
  }
}

async function save(data: FacilityCorporationData): Promise<string> {
  if (data.id) {
    // 更新
    const updated = await prisma.facilityCorporation.update({
      where: { id: data.id },
      data: {
        name: data.name,
        nameKana: data.nameKana,
        corporateNumber: data.corporateNumber,
        postalCode: data.postalCode,
        addressCity: data.addressCity,
        addressDetail: data.addressDetail,
        phone: data.phone,
        fax: data.fax,
        url: data.url,
      },
    })
    return updated.id
  }

  // 新規作成
  const created = await prisma.facilityCorporation.create({
    data: {
      name: data.name,
      nameKana: data.nameKana,
      corporateNumber: data.corporateNumber,
      postalCode: data.postalCode,
      addressCity: data.addressCity,
      addressDetail: data.addressDetail,
      phone: data.phone,
      fax: data.fax,
      url: data.url,
    },
  })

  return created.id
}

export const facilityCorporationRepository: FacilityCorporationRepository = {
  findByCorporateNumber,
  findByName,
  save,
}
