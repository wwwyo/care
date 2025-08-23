'use client'

import { ArrowLeft } from 'lucide-react'
import Form from 'next/form'
import Link from 'next/link'
import { useActionState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { updateClientAction } from './actions'

interface EditClientFormProps {
  clientData: {
    id: string
    name: string
    birthDate: string
    gender: 'male' | 'female' | 'other'
    postalCode?: string
    prefecture: string
    city: string
    street: string
    building?: string
    phoneNumber: string
    disability?: string
    careLevel?: string
    emergencyContactName: string
    emergencyContactRelationship: string
    emergencyContactPhone: string
    notes?: string
  }
}

export default function EditClientForm({ clientData }: EditClientFormProps) {
  const [state, formAction, isPending] = useActionState(updateClientAction, null)

  useEffect(() => {
    if (state?.message && !state?.fieldErrors) {
      toast.error(state.message)
      console.error(state)
    }
  }, [state])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/supporters/clients/${clientData.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            戻る
          </Link>
        </Button>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>利用者情報編集</CardTitle>
          <CardDescription>利用者の情報を更新します</CardDescription>
        </CardHeader>
        <CardContent>
          <Form action={formAction} className="space-y-6">
            <input type="hidden" name="id" value={clientData.id} />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">氏名 *</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="山田太郎"
                  defaultValue={state?.values?.name ?? clientData.name}
                />
                {state?.fieldErrors?.name && (
                  <p className="text-sm text-red-500">{state.fieldErrors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthDate">生年月日</Label>
                <Input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  defaultValue={state?.values?.birthDate ?? clientData.birthDate ?? ''}
                />
                {state?.fieldErrors?.birthDate && (
                  <p className="text-sm text-red-500">{state.fieldErrors.birthDate}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>性別 *</Label>
                <RadioGroup name="gender" defaultValue={state?.values?.gender ?? clientData.gender}>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male">男性</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female">女性</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="other" id="other" />
                      <Label htmlFor="other">その他</Label>
                    </div>
                  </div>
                </RadioGroup>
                {state?.fieldErrors?.gender && (
                  <p className="text-sm text-red-500">{state.fieldErrors.gender}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postalCode">郵便番号</Label>
                  <Input
                    id="postalCode"
                    name="postalCode"
                    placeholder="123-4567"
                    defaultValue={state?.values?.postalCode ?? clientData.postalCode ?? ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prefecture">都道府県 *</Label>
                  <Select
                    name="prefecture"
                    required
                    defaultValue={state?.values?.prefecture ?? clientData.prefecture}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="東京都">東京都</SelectItem>
                      <SelectItem value="神奈川県">神奈川県</SelectItem>
                      <SelectItem value="埼玉県">埼玉県</SelectItem>
                      <SelectItem value="千葉県">千葉県</SelectItem>
                      <SelectItem value="大阪府">大阪府</SelectItem>
                      <SelectItem value="愛知県">愛知県</SelectItem>
                      <SelectItem value="福岡県">福岡県</SelectItem>
                    </SelectContent>
                  </Select>
                  {state?.fieldErrors?.prefecture && (
                    <p className="text-sm text-red-500">{state.fieldErrors.prefecture}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">市区町村 *</Label>
                  <Input
                    id="city"
                    name="city"
                    required
                    placeholder="世田谷区"
                    defaultValue={state?.values?.city ?? clientData.city}
                  />
                  {state?.fieldErrors?.city && (
                    <p className="text-sm text-red-500">{state.fieldErrors.city}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="street">番地 *</Label>
                  <Input
                    id="street"
                    name="street"
                    required
                    placeholder="1-2-3"
                    defaultValue={state?.values?.street ?? clientData.street}
                  />
                  {state?.fieldErrors?.street && (
                    <p className="text-sm text-red-500">{state.fieldErrors.street}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="building">建物名・部屋番号</Label>
                <Input
                  id="building"
                  name="building"
                  placeholder="○○マンション 101号室"
                  defaultValue={state?.values?.building ?? clientData.building ?? ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">電話番号 *</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  required
                  placeholder="090-1234-5678"
                  defaultValue={state?.values?.phoneNumber ?? clientData.phoneNumber}
                />
                {state?.fieldErrors?.phoneNumber && (
                  <p className="text-sm text-red-500">{state.fieldErrors.phoneNumber}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="disability">障害種別</Label>
                <Select
                  name="disability"
                  defaultValue={state?.values?.disability ?? clientData.disability}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="身体障害">身体障害</SelectItem>
                    <SelectItem value="知的障害">知的障害</SelectItem>
                    <SelectItem value="精神障害">精神障害</SelectItem>
                    <SelectItem value="発達障害">発達障害</SelectItem>
                    <SelectItem value="難病">難病</SelectItem>
                    <SelectItem value="その他">その他</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="careLevel">障害支援区分</Label>
                <Select
                  name="careLevel"
                  defaultValue={state?.values?.careLevel ?? clientData.careLevel}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="区分1">区分1</SelectItem>
                    <SelectItem value="区分2">区分2</SelectItem>
                    <SelectItem value="区分3">区分3</SelectItem>
                    <SelectItem value="区分4">区分4</SelectItem>
                    <SelectItem value="区分5">区分5</SelectItem>
                    <SelectItem value="区分6">区分6</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h3 className="font-medium">緊急連絡先</h3>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContactName">氏名 *</Label>
                  <Input
                    id="emergencyContactName"
                    name="emergencyContactName"
                    required
                    placeholder="山田花子"
                    defaultValue={
                      state?.values?.emergencyContactName ?? clientData.emergencyContactName
                    }
                  />
                  {state?.fieldErrors?.emergencyContactName && (
                    <p className="text-sm text-red-500">{state.fieldErrors.emergencyContactName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContactRelationship">続柄 *</Label>
                  <Input
                    id="emergencyContactRelationship"
                    name="emergencyContactRelationship"
                    required
                    placeholder="母"
                    defaultValue={
                      state?.values?.emergencyContactRelationship ??
                      clientData.emergencyContactRelationship
                    }
                  />
                  {state?.fieldErrors?.emergencyContactRelationship && (
                    <p className="text-sm text-red-500">
                      {state.fieldErrors.emergencyContactRelationship}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContactPhone">電話番号 *</Label>
                  <Input
                    id="emergencyContactPhone"
                    name="emergencyContactPhone"
                    type="tel"
                    required
                    placeholder="090-8765-4321"
                    defaultValue={
                      state?.values?.emergencyContactPhone ?? clientData.emergencyContactPhone
                    }
                  />
                  {state?.fieldErrors?.emergencyContactPhone && (
                    <p className="text-sm text-red-500">
                      {state.fieldErrors.emergencyContactPhone}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">備考</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  placeholder="特記事項があれば入力してください"
                  defaultValue={state?.values?.notes ?? clientData.notes ?? ''}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isPending}>
                {isPending ? '更新中...' : '更新する'}
              </Button>
              <Button type="button" variant="outline" asChild disabled={isPending}>
                <Link href={`/supporters/clients/${clientData.id}`}>キャンセル</Link>
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
