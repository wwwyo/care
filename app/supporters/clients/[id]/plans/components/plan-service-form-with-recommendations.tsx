'use client'

import { useEffect, useState } from 'react'
import { Trash2 } from '@/components/icon'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { FacilityRecommendation } from '@/features/facility/infra/query/facility-recommendations'
import { cn } from '@/lib/utils'
import { FacilityRecommendations } from './facility-recommendations'

export type ServiceFormData = {
  id?: string
  serviceCategory: string
  serviceType: string
  desiredAmount: string
  desiredLifeByService: string
  achievementPeriod: string
  selectedFacilities?: Array<{
    id: string
    name: string
  }>
}

type PlanServiceFormWithRecommendationsProps = {
  initialServices: ServiceFormData[]
  disabled?: boolean
  onServicesChange?: (services: ServiceFormData[]) => void
  onShowFacilityDetail?: (facilityId: string | null) => void
}

const SERVICE_CATEGORIES = [
  { value: 'home', label: '居宅' },
  { value: 'residential', label: '入所' },
  { value: 'daytime', label: '日中活動' },
  { value: 'child', label: '児童' },
  { value: 'other', label: 'その他' },
] as const

const SERVICE_TYPES_BY_CATEGORY = {
  home: ['居宅介護', '重度訪問介護', '同行援護', '行動援護', '重度障害者等包括支援'],
  residential: ['施設入所支援', '共同生活援助（グループホーム）', '宿泊型自立訓練'],
  daytime: [
    '生活介護',
    '就労移行支援',
    '就労継続支援A型',
    '就労継続支援B型',
    '自立訓練（機能訓練）',
    '自立訓練（生活訓練）',
  ],
  child: ['児童発達支援', '放課後等デイサービス', '保育所等訪問支援', '居宅訪問型児童発達支援'],
  other: ['短期入所', '地域移行支援', '地域定着支援', '計画相談支援', 'その他'],
}

export function PlanServiceFormWithRecommendations({
  initialServices = [],
  disabled = false,
  onServicesChange,
  onShowFacilityDetail,
}: PlanServiceFormWithRecommendationsProps) {
  const [services, setServices] = useState<ServiceFormData[]>(initialServices || [])
  const [activeServiceIndex, setActiveServiceIndex] = useState<number | null>(null)
  const [selectedFacilitiesMap, setSelectedFacilitiesMap] = useState<{
    [key: number]: FacilityRecommendation[]
  }>({})

  useEffect(() => {
    if (initialServices && Array.isArray(initialServices)) {
      setServices(initialServices)
      // 初期データから選択済み施設を復元
      const initialMap: { [key: number]: FacilityRecommendation[] } = {}
      initialServices.forEach((service, index) => {
        if (service.selectedFacilities) {
          initialMap[index] = service.selectedFacilities.map((f) => ({
            id: f.id,
            name: f.name,
            serviceType: null,
            city: null,
            accessInfo: null,
            availability: { status: null, score: null, percent: null },
            facilityReport: null,
            supporterNotes: [],
          }))
        }
      })
      setSelectedFacilitiesMap(initialMap)
    }
  }, [initialServices])

  const handleAddService = () => {
    const newService: ServiceFormData = {
      serviceCategory: 'daytime',
      serviceType: '',
      desiredAmount: '',
      desiredLifeByService: '',
      achievementPeriod: '',
      selectedFacilities: undefined,
    }
    setServices((prev) => {
      const updated = [...prev, newService]
      onServicesChange?.(updated)
      return updated
    })
    setActiveServiceIndex(services.length)
  }

  const handleRemoveService = (index: number) => {
    setServices((prev) => {
      const updated = prev.filter((_, i) => i !== index)
      onServicesChange?.(updated)
      return updated
    })
    // 削除したサービスの施設選択も削除
    setSelectedFacilitiesMap((prev) => {
      const updated = { ...prev }
      delete updated[index]
      // インデックスを再調整
      const newMap: { [key: number]: FacilityRecommendation[] } = {}
      Object.keys(updated).forEach((key) => {
        const oldIndex = parseInt(key, 10)
        const facilities = updated[oldIndex]
        if (!facilities) return
        if (oldIndex > index) {
          newMap[oldIndex - 1] = facilities
        } else {
          newMap[oldIndex] = facilities
        }
      })
      return newMap
    })
    if (activeServiceIndex === index) {
      setActiveServiceIndex(null)
    } else if (activeServiceIndex !== null && activeServiceIndex > index) {
      setActiveServiceIndex(activeServiceIndex - 1)
    }
  }

  const handleServiceChange = (
    index: number,
    field: keyof ServiceFormData,
    value: ServiceFormData[keyof ServiceFormData],
  ) => {
    setServices((prev) => {
      const updated = [...prev]
      const currentService = updated[index]
      if (!currentService) return updated

      updated[index] = { ...currentService, [field]: value }

      // カテゴリが変更された場合、サービス種別をリセット
      if (field === 'serviceCategory' && updated[index]) {
        updated[index].serviceType = ''
      }

      onServicesChange?.(updated)
      return updated
    })
  }

  const handleFacilitySelect = (index: number, facility: FacilityRecommendation) => {
    const currentFacilities = selectedFacilitiesMap[index] || []
    const isSelected = currentFacilities.some((f) => f.id === facility.id)
    let newSelection: FacilityRecommendation[]

    if (isSelected) {
      newSelection = currentFacilities.filter((f) => f.id !== facility.id)
    } else if (currentFacilities.length < 3) {
      newSelection = [...currentFacilities, facility]
    } else {
      return // 3つ以上は選択できない
    }

    setSelectedFacilitiesMap((prev) => ({
      ...prev,
      [index]: newSelection,
    }))

    handleServiceChange(
      index,
      'selectedFacilities',
      newSelection.map((f) => ({ id: f.id, name: f.name })),
    )
  }

  const activeService = activeServiceIndex !== null ? services[activeServiceIndex] : null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 左カラム: サービスフォーム (2/3) */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>3. 利用を希望するサービス</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {services.map((service, index) => (
              <Card
                key={service.id || `service-${index}`}
                className={cn(
                  'relative cursor-pointer transition-all',
                  activeServiceIndex === index && 'ring-2 ring-primary',
                )}
                onClick={() => setActiveServiceIndex(index)}
              >
                <CardContent className="pt-6 space-y-4">
                  {!disabled && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveService(index)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}

                  {/* Hidden form fields */}
                  <input type="hidden" name={`services[${index}].id`} value={service.id || ''} />
                  <input type="hidden" name={`services[${index}].serviceCategory`} value={service.serviceCategory} />
                  <input type="hidden" name={`services[${index}].serviceType`} value={service.serviceType} />
                  <input type="hidden" name={`services[${index}].desiredAmount`} value={service.desiredAmount} />
                  <input
                    type="hidden"
                    name={`services[${index}].desiredLifeByService`}
                    value={service.desiredLifeByService}
                  />
                  <input
                    type="hidden"
                    name={`services[${index}].achievementPeriod`}
                    value={service.achievementPeriod}
                  />
                  {service.selectedFacilities?.map((facility, fidx) => (
                    <div key={facility.id}>
                      <input
                        type="hidden"
                        name={`services[${index}].selectedFacilities[${fidx}].id`}
                        value={facility.id}
                      />
                      <input
                        type="hidden"
                        name={`services[${index}].selectedFacilities[${fidx}].name`}
                        value={facility.name}
                      />
                    </div>
                  ))}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>サービス種別カテゴリ</Label>
                      <Select
                        value={service.serviceCategory}
                        onValueChange={(value) => handleServiceChange(index, 'serviceCategory', value)}
                        disabled={disabled}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="カテゴリを選択" />
                        </SelectTrigger>
                        <SelectContent>
                          {SERVICE_CATEGORIES.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>サービス種別</Label>
                      <Select
                        value={service.serviceType}
                        onValueChange={(value) => handleServiceChange(index, 'serviceType', value)}
                        disabled={disabled || !service.serviceCategory}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="サービスを選択" />
                        </SelectTrigger>
                        <SelectContent>
                          {service.serviceCategory && service.serviceCategory in SERVICE_TYPES_BY_CATEGORY ? (
                            SERVICE_TYPES_BY_CATEGORY[
                              service.serviceCategory as keyof typeof SERVICE_TYPES_BY_CATEGORY
                            ].map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="">サービスカテゴリーを選択してください</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>希望するサービス量</Label>
                      <Input
                        value={service.desiredAmount}
                        onChange={(e) => handleServiceChange(index, 'desiredAmount', e.target.value)}
                        placeholder="例：週5日、月20日"
                        disabled={disabled}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>達成時期</Label>
                      <Input
                        value={service.achievementPeriod}
                        onChange={(e) => handleServiceChange(index, 'achievementPeriod', e.target.value)}
                        placeholder="例：3ヶ月後、継続"
                        disabled={disabled}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>サービス利用により望まれる生活</Label>
                    <Textarea
                      value={service.desiredLifeByService}
                      onChange={(e) => handleServiceChange(index, 'desiredLifeByService', e.target.value)}
                      placeholder="このサービスを利用することで実現したい生活を記入"
                      className="min-h-[80px]"
                      disabled={disabled}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  {service.selectedFacilities && service.selectedFacilities.length > 0 && (
                    <div className="p-3 bg-primary/5 rounded-lg">
                      <p className="text-sm font-medium mb-2">施設候補（{service.selectedFacilities.length}/3）</p>
                      <div className="space-y-1">
                        {service.selectedFacilities.map((facility) => (
                          <p key={facility.id} className="text-sm text-muted-foreground">
                            • {facility.name}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {!disabled && (
              <Button type="button" variant="outline" onClick={handleAddService} className="w-full">
                サービスを追加
              </Button>
            )}

            {services.length === 0 && (
              <p className="text-muted-foreground text-center py-4">サービスが登録されていません</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 右カラム: 施設レコメンド (1/3) */}
      <div className="lg:col-span-1">
        {activeService?.serviceType && (
          <div className="sticky top-4">
            <FacilityRecommendations
              serviceType={activeService.serviceType}
              onSelectFacility={(facility) =>
                activeServiceIndex !== null && handleFacilitySelect(activeServiceIndex, facility)
              }
              onShowDetail={onShowFacilityDetail}
              selectedFacilityIds={
                activeServiceIndex !== null ? selectedFacilitiesMap[activeServiceIndex]?.map((f) => f.id) || [] : []
              }
              maxSelection={3}
            />
          </div>
        )}
        {(!activeService || !activeService.serviceType) && (
          <Card className="sticky top-4">
            <CardContent className="py-8">
              <p className="text-sm text-muted-foreground text-center">
                サービスを選択すると、おすすめの施設が表示されます
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
