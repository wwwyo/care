'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createPlanUseCase } from '@/uc/plan/create-plan'

const createPlanSchema = z.object({
  clientId: z.string().uuid(),
  supporterId: z.string().uuid(),
  tenantId: z.string().uuid(),
  desiredLife: z.string().max(1000).optional(),
  troubles: z.string().max(1000).optional(),
  considerations: z.string().max(1000).optional(),
  services: z.union([z.array(z.string()), z.string()]).optional(),
})

type State = {
  error: string | null
  formData?: {
    desiredLife?: string
    troubles?: string
    considerations?: string
  }
}

export async function createPlanAction(_prevState: State, formData: FormData): Promise<State> {
  // フォームデータを取得
  const rawData = {
    clientId: formData.get('clientId'),
    supporterId: formData.get('supporterId'),
    tenantId: formData.get('tenantId'),
    desiredLife: formData.get('desiredLife'),
    troubles: formData.get('troubles'),
    considerations: formData.get('considerations'),
    services: formData.getAll('services'),
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

  // 計画書を作成
  const result = await createPlanUseCase({
    tenantId: data.tenantId,
    clientId: data.clientId,
    supporterId: data.supporterId,
    desiredLife: data.desiredLife || undefined,
    troubles: data.troubles || undefined,
    considerations: data.considerations || undefined,
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

  // サービスを追加（今回は簡略化のため、次の実装で対応）
  // TODO: 選択されたサービスをPlanVersionに追加する処理

  // 成功したらクライアント詳細ページにリダイレクト
  redirect(`/supporters/clients/${data.clientId}`)
}
