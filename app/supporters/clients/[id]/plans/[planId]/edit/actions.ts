'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { parseArrayFromFormData } from '@/lib/utils/form-parser'
import { publishPlanUseCase } from '@/uc/plan/publish-plan'
import { updatePlanUseCase } from '@/uc/plan/update-plan'

const updatePlanSchema = z.object({
  planId: z.string().uuid(),
  versionId: z.string().uuid(),
  desiredLife: z.string().optional(),
  troubles: z.string().optional(),
  considerations: z.string().optional(),
})

const serviceSchema = z.object({
  id: z.string().optional(),
  serviceCategory: z.string(),
  serviceType: z.string(),
  desiredAmount: z.string().optional(),
  desiredLifeByService: z.string().optional(),
  achievementPeriod: z.string().optional(),
})

type ServiceFormData = z.infer<typeof serviceSchema>

type UpdateState = {
  error: string | null
  formData?: {
    desiredLife?: string
    troubles?: string
    considerations?: string
  }
}

export async function updatePlanAction(
  _prevState: UpdateState,
  formData: FormData,
): Promise<UpdateState> {
  const rawData = {
    planId: formData.get('planId'),
    versionId: formData.get('versionId'),
    desiredLife: formData.get('desiredLife'),
    troubles: formData.get('troubles'),
    considerations: formData.get('considerations'),
  }

  const validationResult = updatePlanSchema.safeParse(rawData)
  if (!validationResult.success) {
    return {
      error: '入力内容に誤りがあります',
      formData: {
        desiredLife: rawData.desiredLife as string,
        troubles: rawData.troubles as string,
        considerations: rawData.considerations as string,
      },
    }
  }

  const data = validationResult.data

  // サービスデータをパース
  const servicesData = parseArrayFromFormData<ServiceFormData>(formData, 'services')
  const validServices = servicesData
    .map((service) => serviceSchema.safeParse(service))
    .filter((result) => result.success)
    .map((result) => result.data)

  const result = await updatePlanUseCase({
    planId: data.planId,
    versionId: data.versionId,
    desiredLife: data.desiredLife || undefined,
    troubles: data.troubles || undefined,
    considerations: data.considerations || undefined,
    services: validServices,
  })

  if ('type' in result) {
    return {
      error: result.type === 'ValidationError' ? result.message : '計画書の更新に失敗しました',
      formData: {
        desiredLife: data.desiredLife,
        troubles: data.troubles,
        considerations: data.considerations,
      },
    }
  }

  // ページをリロード
  revalidatePath(`/supporters/clients`)

  return {
    error: null,
  }
}

const publishPlanSchema = z.object({
  planId: z.string().uuid(),
  versionId: z.string().uuid(),
})

type PublishState = {
  error: string | null
  success: boolean
}

export async function publishPlanAction(
  _prevState: PublishState,
  formData: FormData,
): Promise<PublishState> {
  const rawData = {
    planId: formData.get('planId'),
    versionId: formData.get('versionId'),
  }

  const validationResult = publishPlanSchema.safeParse(rawData)
  if (!validationResult.success) {
    return {
      error: '入力内容に誤りがあります',
      success: false,
    }
  }

  const data = validationResult.data

  const result = await publishPlanUseCase({
    planId: data.planId,
    versionId: data.versionId,
  })

  if ('type' in result) {
    return {
      error: result.type === 'ValidationError' ? result.message : '計画書の確定に失敗しました',
      success: false,
    }
  }

  // ページをリロード
  revalidatePath(`/supporters/clients`)

  return {
    error: null,
    success: true,
  }
}
