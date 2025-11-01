'use client'

import { Building2, Clock, Info, MapPin, MessageSquareText, Users, Wifi, X } from 'lucide-react'
import Form from 'next/form'
import { useActionState, useEffect, useMemo, useState } from 'react'
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
import type { AvailabilityStatus } from '@/domain/availability/status'
import {
  type FacilityDetailData,
  getFacilityDetail,
  recordSupporterAvailabilityAction,
} from '../actions/facility-actions'

type FacilityReport = NonNullable<FacilityDetailData['facilityReport']>

type SupporterNote = FacilityDetailData['supporterNotes'][number]

type FacilityDetail = FacilityDetailData

type Props = {
  facilityId: string
  supporterId: string
  clientId: string
  planId?: string | null
  onClose: () => void
}

type ActionState =
  | {
      error?: string
      facilityId?: string
      status?: string
      note?: string
    }
  | { success: true; message: string }
  | null

const facilityStatusWeight = 0.7
const supporterStatusWeight = 0.4
const maxScore = facilityStatusWeight + supporterStatusWeight

function statusToNumeric(status: AvailabilityStatus): number {
  switch (status) {
    case 'available':
      return 1
    case 'limited':
      return 0.5
    default:
      return 0
  }
}

function numericToStatus(score: number): AvailabilityStatus {
  if (score >= 0.66) return 'available'
  if (score >= 0.33) return 'limited'
  return 'unavailable'
}

function computeAvailability(detail: FacilityDetail): {
  status: AvailabilityStatus | null
  percent: number | null
} {
  const facilityScore = detail.facilityReport
    ? facilityStatusWeight * statusToNumeric(detail.facilityReport.status)
    : 0

  const supporterValues = detail.supporterNotes.map((note) => statusToNumeric(note.status))
  const supporterAverage =
    supporterValues.length > 0
      ? supporterValues.reduce((sum, value) => sum + value, 0) / supporterValues.length
      : 0

  if (!detail.facilityReport && supporterValues.length === 0) {
    return { status: null, percent: null }
  }

  const combinedScore = Math.min(
    (facilityScore + supporterAverage * supporterStatusWeight) / maxScore,
    1,
  )
  return {
    status: numericToStatus(combinedScore),
    percent: Math.round(combinedScore * 100),
  }
}

function getStatusBadge(status: AvailabilityStatus | null, percent: number | null) {
  if (!status) return null

  const config: Record<AvailabilityStatus, { label: string; className: string; icon: string }> = {
    available: { label: '空きあり', className: 'bg-green-100 text-green-800', icon: '○' },
    limited: { label: '要相談', className: 'bg-yellow-100 text-yellow-800', icon: '△' },
    unavailable: { label: '満床', className: 'bg-red-100 text-red-800', icon: '×' },
  }

  const percentLabel = percent !== null ? `${percent}%` : ''

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${config[status].className}`}>
      {config[status].icon} {config[status].label}
      {percentLabel && <span className="ml-2 text-xs font-normal">{percentLabel}</span>}
    </span>
  )
}

function SupporterAvailabilityForm({
  facility,
  supporterId,
  clientId,
  planId,
  onCancel,
  onSuccess,
}: {
  facility: FacilityDetail
  supporterId: string
  clientId: string
  planId?: string | null
  onCancel: () => void
  onSuccess: (detail: FacilityDetail) => void
}) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    recordSupporterAvailabilityAction,
    null,
  )

  const errorState = state && 'error' in state ? state : null

  useEffect(() => {
    if (state && 'success' in state && state.success) {
      getFacilityDetail(facility.id)
        .then((result) => {
          if (!('error' in result)) {
            onSuccess(result.facility)
          }
        })
        .catch(console.error)
    }
  }, [facility.id, onSuccess, state])

  return (
    <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">相談員メモを追加</h4>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Form action={formAction} className="space-y-4">
        <input type="hidden" name="facilityId" value={facility.id} />
        <input type="hidden" name="supporterId" value={supporterId} />
        <input type="hidden" name="clientId" value={clientId} />
        {planId ? <input type="hidden" name="planId" value={planId} /> : null}

        <div className="space-y-2">
          <Label htmlFor="status">状態</Label>
          <Select name="status" defaultValue={errorState?.status ?? 'limited'}>
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
          <Label htmlFor="note">背景メモ（任意）</Label>
          <Textarea
            name="note"
            placeholder="問い合わせ結果や利用者に共有したい背景を記入"
            defaultValue={errorState?.note ?? ''}
            className="min-h-[80px]"
            maxLength={1000}
          />
          <p className="text-xs text-muted-foreground">
            1000文字以内。入力しない場合は空のままで保存できます。
          </p>
        </div>

        {errorState?.error && <p className="text-sm text-destructive">{errorState.error}</p>}

        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? '登録中...' : 'メモを登録'}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            キャンセル
          </Button>
        </div>
      </Form>
    </div>
  )
}

function FacilityReportSection({ report }: { report: FacilityReport | null }) {
  if (!report) {
    return (
      <div className="space-y-2">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <Building2 className="h-4 w-4" /> 事業所からのレポート
        </h4>
        <p className="text-sm text-muted-foreground">
          まだ事業所からのレポートは登録されていません。
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-sm flex items-center gap-2">
        <Building2 className="h-4 w-4" /> 事業所からのレポート
      </h4>
      <div className="rounded-md border p-3 space-y-2 bg-muted/20">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          {new Date(report.updatedAt).toLocaleString('ja-JP')}
        </div>
        {report.contextSummary && <p className="text-sm font-medium">{report.contextSummary}</p>}
        {report.note && (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.note}</p>
        )}
      </div>
    </div>
  )
}

function SupporterNotes({ notes }: { notes: SupporterNote[] }) {
  if (notes.length === 0) {
    return (
      <div className="space-y-2">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <MessageSquareText className="h-4 w-4" /> 相談員の共有メモ
        </h4>
        <p className="text-sm text-muted-foreground">まだ共有メモはありません。</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-sm flex items-center gap-2">
        <MessageSquareText className="h-4 w-4" /> 相談員の共有メモ
      </h4>
      <div className="space-y-3">
        {notes.map((note) => (
          <div key={note.id} className="rounded-md border p-3 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{new Date(note.createdAt).toLocaleString('ja-JP')}</span>
              <span>有効期限: {new Date(note.expiresAt).toLocaleDateString('ja-JP')}</span>
            </div>
            <div className="text-sm">
              <strong className="mr-2">
                {note.status === 'available'
                  ? '○ 空きあり'
                  : note.status === 'limited'
                    ? '△ 要相談'
                    : '× 満床'}
              </strong>
              {note.contextSummary && <span>{note.contextSummary}</span>}
            </div>
            {note.note && (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{note.note}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export function FacilityDetailPane({ facilityId, supporterId, clientId, planId, onClose }: Props) {
  const [facility, setFacility] = useState<FacilityDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    const loadFacility = async () => {
      setIsLoading(true)
      try {
        const result = await getFacilityDetail(facilityId)
        if (!('error' in result)) {
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

  const availability = useMemo(() => {
    if (!facility) {
      return { status: null, percent: null }
    }
    return computeAvailability(facility)
  }, [facility])

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
      <div className="p-6 border-b space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold">{facility.name}</h2>
            {facility.serviceType && (
              <p className="text-sm text-muted-foreground">{facility.serviceType}</p>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {availability.status && getStatusBadge(availability.status, availability.percent)}

        <div className="grid grid-cols-1 gap-3 text-sm text-muted-foreground">
          {facility.addressCity && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {facility.addressCity}
            </div>
          )}
          {facility.accessInfo && (
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              {facility.accessInfo}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <FacilityReportSection report={facility.facilityReport} />
        <SupporterNotes notes={facility.supporterNotes} />
        {isEditing ? (
          <SupporterAvailabilityForm
            facility={facility}
            supporterId={supporterId}
            clientId={clientId}
            planId={planId}
            onCancel={() => setIsEditing(false)}
            onSuccess={(updated) => {
              setFacility(updated)
              setIsEditing(false)
            }}
          />
        ) : (
          <Button onClick={() => setIsEditing(true)} variant="outline" className="w-full">
            相談員メモを追加
          </Button>
        )}

        <div className="space-y-2 text-xs text-muted-foreground">
          <p className="flex items-center gap-1">
            <Users className="h-4 w-4" /> 相談員メモはテナントに関わらず共有されます。
          </p>
          <p className="flex items-center gap-1">
            <Wifi className="h-4 w-4" /> 最新化された情報で利用者へ提案できるように心がけましょう。
          </p>
        </div>
      </div>
    </div>
  )
}
