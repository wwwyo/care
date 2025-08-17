'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
import type { FacilityWithDetails } from '@/infra/query/facility-query'
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
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Prismaのデータ構造から必要な情報を取得
  const mainContact = facility.contacts[0]
  const address = facility.location
    ? [
        facility.location.prefecture,
        facility.location.city,
        facility.location.street,
        facility.location.building,
      ]
        .filter(Boolean)
        .join('')
    : null

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    setError(null)

    const result = await updateFacilityAction(formData)

    if ('success' in result) {
      router.push('/facility')
      router.refresh()
    } else {
      setError(result.message)
      setIsSubmitting(false)
    }
  }

  return (
    <form action={handleSubmit}>
      <div className="space-y-6">
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
                  defaultValue={facility.profile?.name || ''}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameKana">施設名称（カナ）</Label>
                <Input
                  type="text"
                  id="nameKana"
                  name="nameKana"
                  defaultValue={facility.profile?.nameKana || ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serviceType">サービス種別</Label>
                <Select name="serviceType" defaultValue={facility.profile?.serviceType || ''}>
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
                <Input type="tel" id="phone" name="phone" defaultValue={mainContact?.phone || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fax">FAX番号</Label>
                <Input type="tel" id="fax" name="fax" defaultValue={mainContact?.fax || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  defaultValue={mainContact?.email || ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">ウェブサイト</Label>
                <Input
                  type="url"
                  id="website"
                  name="website"
                  defaultValue={mainContact?.website || ''}
                />
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
                <Label htmlFor="address">住所</Label>
                <Input type="text" id="address" name="address" defaultValue={address || ''} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="postalCode">郵便番号</Label>
                  <Input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    defaultValue={facility.location?.postalCode || ''}
                    placeholder="123-4567"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accessInfo">アクセス情報</Label>
                <Textarea
                  id="accessInfo"
                  name="accessInfo"
                  defaultValue={facility.location?.accessInfo || ''}
                  rows={2}
                />
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
                defaultValue={facility.profile?.description || ''}
                maxLength={500}
                rows={5}
                placeholder="施設の特徴や支援内容について記載してください"
              />
            </div>
          </CardContent>
        </Card>

        {/* エラー表示 */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 送信ボタン */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? '保存中...' : '保存する'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            キャンセル
          </Button>
        </div>
      </div>
    </form>
  )
}
