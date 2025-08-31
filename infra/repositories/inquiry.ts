import { Inquiry } from '@/domain/inquiry/inquiry'
import type { InquiryRepository } from '@/domain/inquiry/repository'
import { prisma } from '@/lib/prisma'

async function save(inquiry: Inquiry): Promise<Inquiry> {
  const data = await prisma.inquiry.upsert({
    where: { id: inquiry.id },
    create: {
      id: inquiry.id,
      planId: inquiry.planId,
      facilityId: inquiry.facilityId,
      status: inquiry.status,
      createdAt: inquiry.createdAt,
      updatedAt: inquiry.updatedAt,
    },
    update: {
      status: inquiry.status,
      updatedAt: inquiry.updatedAt,
    },
  })

  return Inquiry.fromPrisma(data)
}

async function findById(id: string): Promise<Inquiry | null> {
  const data = await prisma.inquiry.findUnique({
    where: { id },
  })

  if (!data) return null
  return Inquiry.fromPrisma(data)
}

async function findByPlanId(planId: string): Promise<Inquiry[]> {
  const data = await prisma.inquiry.findMany({
    where: { planId },
    orderBy: { createdAt: 'desc' },
  })

  return data.map((d) => Inquiry.fromPrisma(d))
}

export const inquiryRepository: InquiryRepository = {
  save,
  findById,
  findByPlanId,
}
