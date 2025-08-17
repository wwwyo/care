'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { getSupporterByUserId } from '@/infra/query/supporter-query'
import { clientRepository } from '@/infra/repositories/client-repository'
import { requireRealm } from '@/lib/auth/helpers'
import { phoneNumberSchema } from '@/lib/zod/phone-number'
import { createClient } from '@/uc/client/create-client'

const createClientSchema = z.object({
  name: z.string().min(1, '氏名は必須です'),
  birthDate: z.string().min(1, '生年月日は必須です'),
  gender: z.enum(['male', 'female', 'other']),
  prefecture: z.string().min(1, '都道府県は必須です'),
  city: z.string().min(1, '市区町村は必須です'),
  street: z.string().min(1, '番地は必須です'),
  postalCode: z.string().optional(),
  building: z.string().optional(),
  phoneNumber: phoneNumberSchema,
  disability: z.string().optional(),
  careLevel: z.string().optional(),
  emergencyContactName: z.string().min(1, '緊急連絡先の氏名は必須です'),
  emergencyContactRelationship: z.string().min(1, '緊急連絡先の続柄は必須です'),
  emergencyContactPhone: phoneNumberSchema,
  notes: z.string().optional(),
})

type ActionState = {
  type: 'error'
  message?: string
  fieldErrors?: Record<string, string>
  values?: Record<string, string>
} | null

export async function createClientAction(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
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
    birthDate: formData.get('birthDate'),
    gender: formData.get('gender'),
    prefecture: formData.get('prefecture'),
    city: formData.get('city'),
    street: formData.get('street'),
    postalCode: formData.get('postalCode') || undefined,
    building: formData.get('building') || undefined,
    phoneNumber: formData.get('phoneNumber'),
    disability: formData.get('disability') || undefined,
    careLevel: formData.get('careLevel') || undefined,
    emergencyContactName: formData.get('emergencyContactName'),
    emergencyContactRelationship: formData.get('emergencyContactRelationship'),
    emergencyContactPhone: formData.get('emergencyContactPhone'),
    notes: formData.get('notes') || undefined,
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
      birthDate: new Date(validatedData.birthDate),
      gender: validatedData.gender,
      address: {
        postalCode: validatedData.postalCode,
        prefecture: validatedData.prefecture,
        city: validatedData.city,
        street: validatedData.street,
        building: validatedData.building,
      },
      phoneNumber: validatedData.phoneNumber,
      emergencyContact: {
        name: validatedData.emergencyContactName,
        relationship: validatedData.emergencyContactRelationship,
        phoneNumber: validatedData.emergencyContactPhone,
      },
      disability: validatedData.disability,
      careLevel: validatedData.careLevel,
      notes: validatedData.notes,
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
  redirect(`/supporters/clients/${clientId}`)
}
