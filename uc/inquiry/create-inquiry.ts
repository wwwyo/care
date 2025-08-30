import { Inquiry } from '@/domain/inquiry/inquiry'
import { inquiryRepository } from '@/infra/repositories/inquiry'

type CreateInquiryParams = {
  planId: string
  facilityId: string
  message?: string
}

type CreateInquiryResult =
  | { success: true; inquiry: Inquiry }
  | { type: 'ValidationError'; message: string }
  | { type: 'NotFound'; message: string }

export async function createInquiryUseCase(
  params: CreateInquiryParams,
): Promise<CreateInquiryResult> {
  if (!params.planId || !params.facilityId) {
    return {
      type: 'ValidationError',
      message: '計画IDと施設IDは必須です',
    }
  }

  try {
    const inquiry = Inquiry.create({
      planId: params.planId,
      facilityId: params.facilityId,
    })

    const savedInquiry = await inquiryRepository.save(inquiry)

    return {
      success: true,
      inquiry: savedInquiry,
    }
  } catch (error) {
    console.error('Failed to create inquiry:', error)
    return {
      type: 'ValidationError',
      message: '照会の作成に失敗しました',
    }
  }
}
