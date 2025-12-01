'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { requireRealm } from '@/features/auth/helpers'
import { createInquiryUseCase } from '@/features/inquiry/usecase/create-inquiry'
import { createPlanUseCase } from '@/features/plan/usecase/create-plan'
import { parseArrayFromFormData } from '@/lib/form-parser'
import { prisma } from '@/lib/prisma'

const createPlanSchema = z.object({
  clientId: z.string().uuid(),
  desiredLife: z.string().optional(),
  troubles: z.string().optional(),
  considerations: z.string().optional(),
})

const serviceSchema = z.object({
  serviceCategory: z.string(),
  serviceType: z.string(),
  desiredAmount: z.string().optional(),
  desiredLifeByService: z.string().optional(),
  achievementPeriod: z.string().optional(),
  selectedFacilities: z
    .array(
      z.object({
        id: z.string().uuid(),
        name: z.string(),
      }),
    )
    .optional(),
})

type ServiceFormData = z.infer<typeof serviceSchema>

type State = {
  error: string | null
  formData?: {
    desiredLife?: string
    troubles?: string
    considerations?: string
  }
}

export async function createPlanAction(_prevState: State, formData: FormData): Promise<State> {
  // セッションからサポーター情報を取得
  const session = await requireRealm('supporter')
  const supporter = await prisma.supporter.findFirst({
    where: {
      userId: session.user.id,
    },
  })

  if (!supporter) {
    return {
      error: 'サポーター情報が見つかりません',
      formData: {
        desiredLife: formData.get('desiredLife') as string,
        troubles: formData.get('troubles') as string,
        considerations: formData.get('considerations') as string,
      },
    }
  }

  // フォームデータを取得
  const rawData = {
    clientId: formData.get('clientId'),
    desiredLife: formData.get('desiredLife'),
    troubles: formData.get('troubles'),
    considerations: formData.get('considerations'),
  }

  // バリデーション
  const validationResult = createPlanSchema.safeParse(rawData)
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

  // クライアントがサポーターと同じテナントに属しているか確認
  const client = await prisma.client.findUnique({
    where: { id: data.clientId },
  })

  if (!client || client.tenantId !== supporter.tenantId) {
    return {
      error: '無効なクライアントです',
      formData: {
        desiredLife: data.desiredLife,
        troubles: data.troubles,
        considerations: data.considerations,
      },
    }
  }

  // 計画書を作成
  const result = await createPlanUseCase({
    tenantId: supporter.tenantId,
    clientId: data.clientId,
    supporterId: supporter.id,
    desiredLife: data.desiredLife || undefined,
    troubles: data.troubles || undefined,
    considerations: data.considerations || undefined,
    services: validServices.map((s) => ({
      serviceCategory: s.serviceCategory,
      serviceType: s.serviceType,
      desiredAmount: s.desiredAmount,
      desiredLifeByService: s.desiredLifeByService,
      achievementPeriod: s.achievementPeriod,
    })),
  })

  if ('type' in result) {
    return {
      error: '計画書の作成に失敗しました',
      formData: {
        desiredLife: data.desiredLife,
        troubles: data.troubles,
        considerations: data.considerations,
      },
    }
  }

  // 選択された施設がある場合はinquiryを作成
  for (const service of validServices) {
    if (service.selectedFacilities && service.selectedFacilities.length > 0) {
      for (const facility of service.selectedFacilities) {
        await createInquiryUseCase({
          planId: result.id,
          facilityId: facility.id,
          message: `${data.desiredLife || ''} ${service.desiredLifeByService || ''}`.trim(),
        })
      }
    }
  }

  // 成功したらクライアント詳細ページにリダイレクト
  redirect(`/supporters/clients/${data.clientId}`)
}
