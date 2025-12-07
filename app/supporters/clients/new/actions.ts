'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { requireRealm } from '@/features/auth/helpers'
import { clientRepository } from '@/features/client/infra/repository/client-repository'
import { createClient } from '@/features/client/usecase/create-client'
import { getSupporterByUserId } from '@/features/supporter/infra/query/supporter-query'

const createClientSchema = z.object({
  name: z.string().min(1, '氏名は必須です'),
  nameKana: z.string().min(1, 'ふりがなは必須です'),
  birthDate: z
    .string()
    .min(1, '生年月日は必須です')
    .refine(
      (value) => {
        const date = new Date(value)
        return !Number.isNaN(date.getTime())
      },
      { message: '有効な生年月日を入力してください' },
    ),
})

type ActionState = {
  type: 'error'
  message?: string
  fieldErrors?: Record<string, string>
  values?: Record<string, string>
} | null

export async function createClientAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  // フォームの値を保存（エラー時に返す）
  const formValues = Object.fromEntries(formData.entries())

  // 認証チェック
  const session = await requireRealm('supporter')
  const supporter = await getSupporterByUserId(session.user.id)

  if (!supporter) {
    return {
      type: 'error' as const,
      message: 'サポーター情報が見つかりません',
      values: formValues,
    }
  }

  // フォームデータをオブジェクトに変換
  const rawData = {
    name: formData.get('name'),
    nameKana: formData.get('nameKana'),
    birthDate: formData.get('birthDate'),
  }

  // バリデーション
  const parsed = createClientSchema.safeParse(rawData)

  if (!parsed.success) {
    // Zodエラーをfieldごとにまとめて返す
    const fieldErrors: Record<string, string> = {}
    parsed.error.issues.forEach((err) => {
      const fieldName = err.path[0]
      if (fieldName && typeof fieldName === 'string') {
        fieldErrors[fieldName] = err.message
      }
    })

    return {
      type: 'error' as const,
      fieldErrors,
      values: formValues,
    }
  }

  const validatedData = parsed.data

  // 利用者作成
  const result = await createClient(
    {
      tenantId: supporter.tenantId,
      name: validatedData.name,
      nameKana: validatedData.nameKana,
      birthDate: new Date(validatedData.birthDate),
    },
    clientRepository,
  )

  if (result.type !== 'success') {
    // エラーメッセージのマッピング
    const errorMessages: Record<string, string> = {
      MissingName: '氏名を入力してください',
      InvalidPhoneNumber: '電話番号の形式が正しくありません',
      InvalidEmergencyContact: '緊急連絡先の情報が不正です',
      SaveError: 'データの保存に失敗しました',
    }

    return {
      type: 'error' as const,
      message: errorMessages[result.type] || 'エラーが発生しました',
      values: formValues,
    }
  }

  // 成功時はリダイレクト
  const clientId = result.client.toData().id
  redirect(`/supporters/clients/${clientId}/hearing/new`)
}
