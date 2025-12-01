import { Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
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
import type { FacilityRecommendation } from '@/features/facility/infra/query/facility-recommendations'
import { FacilityRecommendations } from '../../components/facility-recommendations'

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

type PlanServiceFormProps = {
  initialServices: ServiceFormData[]
  disabled?: boolean
  readOnly?: boolean
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

type ServiceItemFormProps = {
  index: number
  service: ServiceFormData
  disabled?: boolean
  readOnly?: boolean
  onServiceChange: (
    index: number,
    field: keyof ServiceFormData,
    value: ServiceFormData[keyof ServiceFormData],
  ) => void
  onRemove: (index: number) => void
  onShowFacilityDetail?: (facilityId: string | null) => void
}

function ServiceItemForm({
  index,
  service,
  disabled = false,
  readOnly = false,
  onServiceChange,
  onRemove,
  onShowFacilityDetail,
}: ServiceItemFormProps) {
  const [selectedFacilities, setSelectedFacilities] = useState<FacilityRecommendation[]>(
    service.selectedFacilities?.map((f) => ({
      id: f.id,
      name: f.name,
      serviceType: null,
      city: null,
      accessInfo: null,
      availability: { status: null, score: null, percent: null },
      facilityReport: null,
      supporterNotes: [],
    })) || [],
  )

  const handleFacilitySelect = (facility: FacilityRecommendation) => {
    const isSelected = selectedFacilities.some((f) => f.id === facility.id)
    let newSelection: FacilityRecommendation[]

    if (isSelected) {
      newSelection = selectedFacilities.filter((f) => f.id !== facility.id)
    } else if (selectedFacilities.length < 3) {
      newSelection = [...selectedFacilities, facility]
    } else {
      return // 3つ以上は選択できない
    }

    setSelectedFacilities(newSelection)
    onServiceChange(
      index,
      'selectedFacilities',
      newSelection.map((f) => ({ id: f.id, name: f.name })),
    )
  }

  return (
    <Card className="relative">
      <CardContent className="pt-6 space-y-4">
        {!disabled && !readOnly && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2"
            onClick={() => onRemove(index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}

        {/* Hidden form fields for submission */}
        <input type="hidden" name={`services[${index}].id`} value={service.id || ''} />
        <input
          type="hidden"
          name={`services[${index}].serviceCategory`}
          value={service.serviceCategory}
        />
        <input type="hidden" name={`services[${index}].serviceType`} value={service.serviceType} />
        <input
          type="hidden"
          name={`services[${index}].desiredAmount`}
          value={service.desiredAmount}
        />
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
            {readOnly ? (
              <Input
                value={
                  SERVICE_CATEGORIES.find((c) => c.value === service.serviceCategory)?.label ||
                  service.serviceCategory
                }
                readOnly
                className="bg-gray-50"
              />
            ) : (
              <Select
                value={service.serviceCategory}
                onValueChange={(value) => onServiceChange(index, 'serviceCategory', value)}
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
            )}
          </div>

          <div className="space-y-2">
            <Label>サービス種別</Label>
            {readOnly ? (
              <Input value={service.serviceType} readOnly className="bg-gray-50" />
            ) : (
              <Select
                value={service.serviceType}
                onValueChange={(value) => onServiceChange(index, 'serviceType', value)}
                disabled={disabled || !service.serviceCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="サービスを選択" />
                </SelectTrigger>
                <SelectContent>
                  {service.serviceCategory &&
                  service.serviceCategory in SERVICE_TYPES_BY_CATEGORY ? (
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
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>希望するサービス量</Label>
            <Input
              value={service.desiredAmount}
              onChange={(e) => onServiceChange(index, 'desiredAmount', e.target.value)}
              placeholder="例：週5日、月20日"
              disabled={disabled}
              readOnly={readOnly}
              className={readOnly ? 'bg-gray-50' : ''}
            />
          </div>

          <div className="space-y-2">
            <Label>達成時期</Label>
            <Input
              value={service.achievementPeriod}
              onChange={(e) => onServiceChange(index, 'achievementPeriod', e.target.value)}
              placeholder="例：3ヶ月後、継続"
              disabled={disabled}
              readOnly={readOnly}
              className={readOnly ? 'bg-gray-50' : ''}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>サービス利用により望まれる生活</Label>
          <Textarea
            value={service.desiredLifeByService}
            onChange={(e) => onServiceChange(index, 'desiredLifeByService', e.target.value)}
            placeholder="このサービスを利用することで実現したい生活を記入"
            className={`min-h-[80px] ${readOnly ? 'bg-gray-50' : ''}`}
            disabled={disabled}
            readOnly={readOnly}
          />
        </div>

        {service.selectedFacilities && service.selectedFacilities.length > 0 && (
          <div className="p-3 bg-primary/5 rounded-lg">
            <p className="text-sm font-medium mb-2">
              施設候補（{service.selectedFacilities.length}/3）
            </p>
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

      {/* 施設レコメンド表示 */}
      {service.serviceType && !disabled && !readOnly && (
        <FacilityRecommendations
          serviceType={service.serviceType}
          onSelectFacility={handleFacilitySelect}
          onShowDetail={onShowFacilityDetail}
          selectedFacilityIds={selectedFacilities.map((f) => f.id)}
          maxSelection={3}
        />
      )}
    </Card>
  )
}

export function PlanServiceForm({
  initialServices = [],
  disabled = false,
  readOnly = false,
  onShowFacilityDetail,
}: PlanServiceFormProps & {
  onShowFacilityDetail?: (facilityId: string | null) => void
}) {
  const [services, setServices] = useState<ServiceFormData[]>(initialServices || [])

  useEffect(() => {
    if (initialServices && Array.isArray(initialServices)) {
      setServices(initialServices)
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
    setServices((prev) => [...prev, newService])
  }

  const handleRemoveService = (index: number) => {
    setServices((prev) => prev.filter((_, i) => i !== index))
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

      return updated
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>3. 利用を希望するサービス</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {services && services.length > 0
          ? services.map((service, index) => (
              <ServiceItemForm
                key={service.id || `service-${index}`}
                index={index}
                service={service}
                disabled={disabled}
                readOnly={readOnly}
                onServiceChange={handleServiceChange}
                onRemove={handleRemoveService}
                onShowFacilityDetail={onShowFacilityDetail}
              />
            ))
          : null}

        {!disabled && !readOnly && (
          <Button type="button" variant="outline" onClick={handleAddService} className="w-full">
            サービスを追加
          </Button>
        )}

        {services.length === 0 && (
          <p className="text-muted-foreground text-center py-4">サービスが登録されていません</p>
        )}
      </CardContent>
    </Card>
  )
}
