import { prisma } from '@/lib/prisma'

export type InquiryWithDetails = {
  id: string
  clientName: string
  supporterName: string
  tenantName: string
  message: string | null
  status: string
  createdAt: Date
  repliedAt: Date | null
}

export async function getInquiriesByFacilityId(facilityId: string): Promise<InquiryWithDetails[]> {
  const inquiries = await prisma.inquiry.findMany({
    where: { facilityId },
    include: {
      plan: {
        include: {
          client: {
            include: {
              profile: true,
            },
          },
          tenant: true,
        },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return inquiries.map((inquiry) => ({
    id: inquiry.id,
    clientName: inquiry.plan.client.profile?.name ?? '名前未設定',
    supporterName: '支援者', // TODO: supporterテーブルから取得
    tenantName: inquiry.plan.tenant.name,
    message: inquiry.messages[0]?.message ?? null,
    status: inquiry.status,
    createdAt: inquiry.createdAt,
    repliedAt: null, // TODO: 返信日時を管理する場合は実装
  }))
}

export async function countNewInquiries(facilityId: string): Promise<number> {
  return await prisma.inquiry.count({
    where: {
      facilityId,
      status: 'sent',
    },
  })
}
