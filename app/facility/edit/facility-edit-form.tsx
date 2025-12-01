'use client'

import Form from 'next/form'
import Link from 'next/link'
import { useActionState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { FacilityWithDetails } from '@/features/facility/infra/query/facility-query'
import { updateFacilityAction } from './actions'

const serviceTypes = [
  '生活介護',
  '就労継続支援A型',
  '就労継続支援B型',
  '就労移行支援',
  '施設入所支援',
  '短期入所',
  '児童発達支援',
  '放課後等デイサービス',
  'その他',
]

type Props = {
  facility: FacilityWithDetails
}

export function FacilityEditForm({ facility }: Props) {
  const [state, formAction, isPending] = useActionState(updateFacilityAction, null)

  useEffect(() => {
    if (state?.message && !state?.fieldErrors) {
      toast.error(state.message)
      console.error(state)
    }
  }, [state])

  // Prismaのデータ構造から必要な情報を取得
  const mainContact = facility.contacts[0]
  const addressCity = facility.location?.addressCity ?? ''
  const addressDetail = facility.location?.addressDetail ?? ''

  return (
    <Form action={formAction} className="space-y-6">
      {/* 基本情報 */}
      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">
                施設名称 <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                id="name"
                name="name"
                defaultValue={state?.values?.name ?? facility.profile?.name ?? ''}
                required
              />
              {state?.fieldErrors?.name && (
                <p className="text-sm text-red-500">{state.fieldErrors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="nameKana">施設名称（カナ）</Label>
              <Input
                type="text"
                id="nameKana"
                name="nameKana"
                defaultValue={state?.values?.nameKana ?? facility.profile?.nameKana ?? ''}
              />
              {state?.fieldErrors?.nameKana && (
                <p className="text-sm text-red-500">{state.fieldErrors.nameKana}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="serviceType">サービス種別</Label>
              <Select
                name="serviceType"
                defaultValue={state?.values?.serviceType ?? facility.services[0]?.serviceType ?? ''}
              >
                <SelectTrigger>
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state?.fieldErrors?.serviceType && (
                <p className="text-sm text-red-500">{state.fieldErrors.serviceType}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 連絡先 */}
      <Card>
        <CardHeader>
          <CardTitle>連絡先</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">電話番号</Label>
              <Input
                type="tel"
                id="phone"
                name="phone"
                defaultValue={state?.values?.phone ?? mainContact?.phone ?? ''}
              />
              {state?.fieldErrors?.phone && (
                <p className="text-sm text-red-500">{state.fieldErrors.phone}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="fax">FAX番号</Label>
              <Input
                type="tel"
                id="fax"
                name="fax"
                defaultValue={state?.values?.fax ?? mainContact?.fax ?? ''}
              />
              {state?.fieldErrors?.fax && (
                <p className="text-sm text-red-500">{state.fieldErrors.fax}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                type="email"
                id="email"
                name="email"
                defaultValue={state?.values?.email ?? mainContact?.email ?? ''}
              />
              {state?.fieldErrors?.email && (
                <p className="text-sm text-red-500">{state.fieldErrors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">ウェブサイト</Label>
              <Input
                type="url"
                id="website"
                name="website"
                defaultValue={state?.values?.website ?? mainContact?.website ?? ''}
              />
              {state?.fieldErrors?.website && (
                <p className="text-sm text-red-500">{state.fieldErrors.website}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 所在地 */}
      <Card>
        <CardHeader>
          <CardTitle>所在地</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="addressCity">市区町村</Label>
              <Input
                type="text"
                id="addressCity"
                name="addressCity"
                defaultValue={state?.values?.addressCity ?? addressCity}
                placeholder="東京都千代田区"
              />
              {state?.fieldErrors?.addressCity && (
                <p className="text-sm text-red-500">{state.fieldErrors.addressCity}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="addressDetail">番地以降</Label>
              <Input
                type="text"
                id="addressDetail"
                name="addressDetail"
                defaultValue={state?.values?.addressDetail ?? addressDetail}
                placeholder="霞が関1-2-3"
              />
              {state?.fieldErrors?.addressDetail && (
                <p className="text-sm text-red-500">{state.fieldErrors.addressDetail}</p>
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="postalCode">郵便番号</Label>
                <Input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  defaultValue={state?.values?.postalCode ?? facility.location?.postalCode ?? ''}
                  placeholder="123-4567"
                />
                {state?.fieldErrors?.postalCode && (
                  <p className="text-sm text-red-500">{state.fieldErrors.postalCode}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="accessInfo">アクセス情報</Label>
              <Textarea
                id="accessInfo"
                name="accessInfo"
                defaultValue={state?.values?.accessInfo ?? facility.location?.accessInfo ?? ''}
                rows={2}
              />
              {state?.fieldErrors?.accessInfo && (
                <p className="text-sm text-red-500">{state.fieldErrors.accessInfo}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 施設紹介 */}
      <Card>
        <CardHeader>
          <CardTitle>施設紹介</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="description">施設紹介文（500文字以内）</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={state?.values?.description ?? facility.profile?.description ?? ''}
              maxLength={500}
              rows={5}
              placeholder="施設の特徴や支援内容について記載してください"
            />
            {state?.fieldErrors?.description && (
              <p className="text-sm text-red-500">{state.fieldErrors.description}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 送信ボタン */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending ? '保存中...' : '保存する'}
        </Button>
        <Button type="button" variant="outline" asChild disabled={isPending}>
          <Link href="/facility">キャンセル</Link>
        </Button>
      </div>
    </Form>
  )
}
