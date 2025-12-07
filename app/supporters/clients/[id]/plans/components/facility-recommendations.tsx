'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { CheckCircle2, Info, MapPin, MessageSquare } from '@/components/icon'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { FacilityRecommendation } from '@/features/facility/infra/query/facility-recommendations'
import { cn } from '@/lib/utils'
import { fetchFacilityRecommendations } from '../actions/facility-actions'

type FacilityRecommendationsProps = {
  serviceType: string
  onSelectFacility: (facility: FacilityRecommendation) => void
  onShowDetail?: (facilityId: string | null) => void
  selectedFacilityIds?: string[]
  maxSelection?: number
}

function AvailabilityBadge({
  status,
  percent,
  facilityNote,
}: {
  status: string | null
  percent: number | null
  facilityNote: string | null | undefined
}) {
  if (!status) {
    return (
      <div className="flex items-center gap-2">
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">? 空き情報不明</span>
      </div>
    )
  }

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
  if (!config) {
    return (
      <div className="flex items-center gap-2">
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">? 空き情報不明</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.icon} {config.label}
        {percent !== null && <span className="ml-1 text-[10px]">{percent}%</span>}
      </span>
      {facilityNote && (
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <MessageSquare className="h-3 w-3" />
          {facilityNote}
        </span>
      )}
    </div>
  )
}

function FacilityCard({
  facility,
  isSelected,
  onSelect,
  onShowDetail,
  selectionCount,
  maxSelection,
}: {
  facility: FacilityRecommendation
  isSelected: boolean
  onSelect: () => void
  onShowDetail?: () => void
  selectionCount: number
  maxSelection: number
}) {
  const canSelect = isSelected || selectionCount < maxSelection

  return (
    <Card
      className={cn(
        'relative transition-all hover:shadow-md cursor-pointer',
        isSelected && 'ring-2 ring-primary',
        !canSelect && 'opacity-60',
      )}
      onClick={() => onShowDetail?.()}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 z-10">
          <CheckCircle2 className="h-5 w-5 text-primary" />
        </div>
      )}
      <CardContent className="p-4 space-y-3">
        <div className="space-y-1">
          <h4 className="font-medium text-sm line-clamp-1">{facility.name}</h4>
          {facility.city && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {facility.city}
            </p>
          )}
        </div>

        <AvailabilityBadge
          status={facility.availability.status}
          percent={facility.availability.percent}
          facilityNote={facility.facilityReport?.contextSummary ?? facility.facilityReport?.note ?? undefined}
        />

        {facility.supporterNotes[0] && (
          <p className="text-[13px] text-muted-foreground line-clamp-2">
            <span className="font-medium mr-1">相談員メモ:</span>
            {facility.supporterNotes[0]?.contextSummary ?? facility.supporterNotes[0]?.note ?? '共有内容なし'}
          </p>
        )}

        {facility.accessInfo && <p className="text-xs text-muted-foreground line-clamp-2">{facility.accessInfo}</p>}

        <div className="flex gap-2">
          <Button
            type="button"
            variant={isSelected ? 'default' : 'outline'}
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation()
              if (canSelect) onSelect()
            }}
            disabled={!canSelect}
          >
            {isSelected ? '選択済み' : '選択'}
          </Button>
          {onShowDetail && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onShowDetail()
              }}
            >
              <Info className="h-4 w-4" />
              詳細
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function FacilityRecommendations({
  serviceType,
  onSelectFacility,
  onShowDetail,
  selectedFacilityIds = [],
  maxSelection = 3,
}: FacilityRecommendationsProps) {
  const [facilities, setFacilities] = useState<FacilityRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!serviceType) {
      setFacilities([])
      return
    }

    const loadRecommendations = async () => {
      setIsLoading(true)
      try {
        const result = await fetchFacilityRecommendations(serviceType)
        if ('error' in result) {
          toast.error('施設の取得に失敗しました')
        } else {
          setFacilities(result.facilities)
        }
      } catch (_error) {
        toast.error('施設の取得中にエラーが発生しました')
      } finally {
        setIsLoading(false)
      }
    }

    loadRecommendations()
  }, [serviceType])

  if (!serviceType || facilities.length === 0) {
    return null
  }

  return (
    <div className="p-4 bg-muted/30 rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h5 className="text-sm font-medium">おすすめの施設</h5>
          {selectedFacilityIds.length > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {selectedFacilityIds.length}/{maxSelection}件選択中
            </p>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsLoading(true)
            fetchFacilityRecommendations(serviceType)
              .then((result) => {
                if ('error' in result) {
                  toast.error('施設の更新に失敗しました')
                } else {
                  setFacilities(result.facilities)
                }
              })
              .finally(() => setIsLoading(false))
          }}
          disabled={isLoading}
        >
          {isLoading ? '読み込み中...' : '更新'}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {facilities.map((facility) => (
          <FacilityCard
            key={facility.id}
            facility={facility}
            isSelected={selectedFacilityIds.includes(facility.id)}
            onSelect={() => onSelectFacility(facility)}
            onShowDetail={onShowDetail ? () => onShowDetail(facility.id) : undefined}
            selectionCount={selectedFacilityIds.length}
            maxSelection={maxSelection}
          />
        ))}
      </div>

      {facilities.length === 0 && !isLoading && (
        <p className="text-sm text-muted-foreground text-center py-4">該当する施設が見つかりませんでした</p>
      )}
    </div>
  )
}
