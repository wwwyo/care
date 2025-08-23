import { Trash2 } from 'lucide-react'
import { useState } from 'react'
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

export type ServiceFormData = {
  id?: string
  serviceCategory: string
  serviceType: string
  desiredAmount: string
  desiredLifeByService: string
  achievementPeriod: string
}

type PlanServiceFormProps = {
  initialServices: ServiceFormData[]
  disabled?: boolean
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
  onServiceChange: (index: number, field: keyof ServiceFormData, value: string) => void
  onRemove: (index: number) => void
}

function ServiceItemForm({
  index,
  service,
  disabled = false,
  onServiceChange,
  onRemove,
}: ServiceItemFormProps) {
  return (
    <Card className="relative">
      <CardContent className="pt-6 space-y-4">
        {!disabled && (
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

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>サービス種別カテゴリ</Label>
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
          </div>

          <div className="space-y-2">
            <Label>サービス種別</Label>
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
                  SERVICE_TYPES_BY_CATEGORY[
                    service.serviceCategory as keyof typeof SERVICE_TYPES_BY_CATEGORY
                  ].map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
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
            />
          </div>

          <div className="space-y-2">
            <Label>達成時期</Label>
            <Input
              value={service.achievementPeriod}
              onChange={(e) => onServiceChange(index, 'achievementPeriod', e.target.value)}
              placeholder="例：3ヶ月後、継続"
              disabled={disabled}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>サービス利用により望まれる生活</Label>
          <Textarea
            value={service.desiredLifeByService}
            onChange={(e) => onServiceChange(index, 'desiredLifeByService', e.target.value)}
            placeholder="このサービスを利用することで実現したい生活を記入"
            className="min-h-[80px]"
            disabled={disabled}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export function PlanServiceForm({ initialServices, disabled = false }: PlanServiceFormProps) {
  const [services, setServices] = useState<ServiceFormData[]>(initialServices)

  const handleAddService = () => {
    const newService: ServiceFormData = {
      serviceCategory: 'daytime',
      serviceType: '',
      desiredAmount: '',
      desiredLifeByService: '',
      achievementPeriod: '',
    }
    setServices((prev) => [...prev, newService])
  }

  const handleRemoveService = (index: number) => {
    setServices((prev) => prev.filter((_, i) => i !== index))
  }

  const handleServiceChange = (index: number, field: keyof ServiceFormData, value: string) => {
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
        {services.map((service, index) => (
          <ServiceItemForm
            key={service.id || `service-${index}`}
            index={index}
            service={service}
            disabled={disabled}
            onServiceChange={handleServiceChange}
            onRemove={handleRemoveService}
          />
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
  )
}
