'use client'

import { Building2, Clock, Edit, Mail, MapPin, Phone, Users, Wifi, X } from 'lucide-react'
import Form from 'next/form'
import { useActionState, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { getFacilityDetail, updateFacilitySlotAction } from '../actions/facility-actions'

type FacilityDetail = {
  id: string
  name: string
  serviceType: string | null
  slotStatus: string | null
  slotComment: string | null
  city: string | null
  accessInfo: string | null
}

type Props = {
  facilityId: string
  onClose: () => void
}

function getStatusBadge(status: string | null) {
  if (!status) return null

  const statusConfig = {
    available: {
      label: '空きあり',
      className: 'bg-green-100 text-green-800',
      icon: '○',
    },
    limited: {
      label: '要相談',
      className: 'bg-yellow-100 text-yellow-800',
      icon: '△',
    },
    unavailable: {
      label: '満床',
      className: 'bg-red-100 text-red-800',
      icon: '×',
    },
  }

  const config = statusConfig[status as keyof typeof statusConfig]
  if (!config) return null

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.className}`}>
      {config.icon} {config.label}
    </span>
  )
}

function SlotStatusEditForm({
  facility,
  onCancel,
  onSuccess,
}: {
  facility: FacilityDetail
  onCancel: () => void
  onSuccess: (newFacility: FacilityDetail) => void
}) {
  const [state, formAction, isPending] = useActionState(updateFacilitySlotAction, undefined)

  useEffect(() => {
    if (state?.success) {
      // 更新成功時に施設データを再取得
      getFacilityDetail(facility.id)
        .then((result) => {
          if (!('error' in result)) {
            onSuccess(result.facility)
          }
        })
        .catch(console.error)
    }
  }, [state?.success, facility.id, onSuccess])

  return (
    <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">空き状況を編集</h4>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Form action={formAction} className="space-y-4">
        <input type="hidden" name="facilityId" value={facility.id} />

        <div className="space-y-2">
          <Label htmlFor="status">状態</Label>
          <Select
            name="status"
            defaultValue={state?.status || facility.slotStatus || 'unavailable'}
          >
            <SelectTrigger>
              <SelectValue placeholder="状態を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">○ 空きあり</SelectItem>
              <SelectItem value="limited">△ 要相談</SelectItem>
              <SelectItem value="unavailable">× 満床</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="comment">コメント（任意）</Label>
          <Textarea
            name="comment"
            placeholder="空き状況に関するコメントを入力"
            defaultValue={state?.comment || facility.slotComment || ''}
            className="min-h-[60px]"
            maxLength={100}
          />
          <p className="text-xs text-muted-foreground">100文字以内</p>
        </div>

        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? '更新中...' : '更新'}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            キャンセル
          </Button>
        </div>
      </Form>
    </div>
  )
}

export function FacilityDetailPane({ facilityId, onClose }: Props) {
  const [facility, setFacility] = useState<FacilityDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    const loadFacility = async () => {
      setIsLoading(true)
      try {
        const result = await getFacilityDetail(facilityId)
        if ('error' in result) {
          console.error(result.error)
        } else {
          setFacility(result.facility)
        }
      } catch (error) {
        console.error('Failed to load facility details:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadFacility()
  }, [facilityId])

  if (isLoading) {
    return (
      <div className="h-full flex flex-col bg-background">
        <div className="p-6 border-b">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/2 mt-2" />
        </div>
        <div className="flex-1 p-6 space-y-6">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    )
  }

  if (!facility) {
    return (
      <div className="h-full flex flex-col bg-background">
        <div className="p-6">
          <p className="text-muted-foreground">施設情報を取得できませんでした</p>
          <Button variant="outline" onClick={onClose} className="mt-4">
            閉じる
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="p-6 border-b">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-semibold">{facility.name}</h2>
            {facility.serviceType && (
              <span className="text-sm bg-secondary text-secondary-foreground px-2 py-1 rounded mt-2 inline-block">
                {facility.serviceType}
              </span>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
            <span className="sr-only">閉じる</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* 空き状況 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">空き状況</h3>
            {!isEditing && (
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-1" />
                編集
              </Button>
            )}
          </div>

          {isEditing ? (
            <SlotStatusEditForm
              facility={facility}
              onCancel={() => setIsEditing(false)}
              onSuccess={(updatedFacility) => {
                setFacility(updatedFacility)
                setIsEditing(false)
              }}
            />
          ) : (
            <div className="flex items-center gap-3">
              {getStatusBadge(facility.slotStatus)}
              {facility.slotComment && (
                <p className="text-sm text-muted-foreground">{facility.slotComment}</p>
              )}
            </div>
          )}
        </div>

        {/* 所在地 */}
        {facility.city && (
          <div>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              所在地
            </h3>
            <p className="text-sm text-muted-foreground">{facility.city}</p>
          </div>
        )}

        {/* アクセス情報 */}
        {facility.accessInfo && (
          <div>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              アクセス
            </h3>
            <p className="text-sm text-muted-foreground">{facility.accessInfo}</p>
          </div>
        )}

        {/* その他の情報 */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-start gap-3">
            <Users className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">定員</p>
              <p className="text-sm text-muted-foreground">詳細はお問い合わせください</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">営業時間</p>
              <p className="text-sm text-muted-foreground">詳細はお問い合わせください</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Wifi className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">設備・サービス</p>
              <p className="text-sm text-muted-foreground">詳細はお問い合わせください</p>
            </div>
          </div>
        </div>

        {/* お問い合わせボタン */}
        <div className="pt-4 border-t space-y-3">
          <Button variant="outline" className="w-full" disabled>
            <Phone className="h-4 w-4 mr-2" />
            電話でお問い合わせ
          </Button>
          <Button variant="outline" className="w-full" disabled>
            <Mail className="h-4 w-4 mr-2" />
            メールでお問い合わせ
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            お問い合わせ機能は今後実装予定です
          </p>
        </div>
      </div>
    </div>
  )
}
