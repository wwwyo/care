'use client'

import { Sparkles } from 'lucide-react'
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

export type FactKey =
  | 'gender'
  | 'birthDate'
  | 'phone'
  | 'address'
  | 'disability'
  | 'careLevel'
  | 'emergencyContactName'
  | 'emergencyContactRelation'
  | 'emergencyContactPhone'
  | 'notes'

export type FactValues = Record<FactKey, string>

export type ClientFactsSource = {
  gender?: string | null
  birthDate?: string | null | Date
  phone?: string | null
  address?: {
    postalCode?: string | null
    prefecture?: string | null
    city?: string | null
    street?: string | null
    building?: string | null
  } | null
  disability?: string | null
  careLevel?: string | null
  emergencyContactName?: string | null
  emergencyContactRelation?: string | null
  emergencyContactPhone?: string | null
  notes?: string | null
}

const UNSET_OPTION_VALUE = '__unset__'

const GENDER_OPTIONS = [
  { value: 'male', label: '男性' },
  { value: 'female', label: '女性' },
  { value: 'other', label: 'その他' },
] as const

const DISABILITY_OPTIONS = [
  { value: '身体障害', label: '身体障害' },
  { value: '知的障害', label: '知的障害' },
  { value: '精神障害', label: '精神障害' },
  { value: '発達障害', label: '発達障害' },
  { value: '難病', label: '難病' },
  { value: 'その他', label: 'その他' },
] as const

const CARE_LEVEL_OPTIONS = [
  { value: '区分1', label: '区分1' },
  { value: '区分2', label: '区分2' },
  { value: '区分3', label: '区分3' },
  { value: '区分4', label: '区分4' },
  { value: '区分5', label: '区分5' },
  { value: '区分6', label: '区分6' },
] as const

const RELATION_OPTIONS = [
  { value: '母', label: '母' },
  { value: '父', label: '父' },
  { value: '配偶者', label: '配偶者' },
  { value: '子', label: '子' },
  { value: '兄弟姉妹', label: '兄弟姉妹' },
  { value: '祖父母', label: '祖父母' },
  { value: 'その他', label: 'その他' },
] as const

export type FactFieldConfig = {
  key: FactKey
  label: string
  placeholder?: string
  isTextArea?: boolean
  options?: Array<{ value: string; label: string }>
}

export const FACT_FIELD_CONFIGS: FactFieldConfig[] = [
  {
    key: 'gender',
    label: '性別',
    options: [...GENDER_OPTIONS],
  },
  { key: 'birthDate', label: '生年月日', placeholder: '例: 1990年1月1日' },
  { key: 'phone', label: '電話番号', placeholder: '例: 03-1234-5678' },
  { key: 'address', label: '住所', placeholder: '例: 東京都渋谷区1-2-3' },
  {
    key: 'disability',
    label: '障害種別',
    options: [...DISABILITY_OPTIONS],
  },
  {
    key: 'careLevel',
    label: '障害支援区分',
    options: [...CARE_LEVEL_OPTIONS],
  },
  { key: 'emergencyContactName', label: '緊急連絡先 氏名', placeholder: '例: 山田花子' },
  {
    key: 'emergencyContactRelation',
    label: '緊急連絡先 続柄',
    options: [...RELATION_OPTIONS],
  },
  {
    key: 'emergencyContactPhone',
    label: '緊急連絡先 電話番号',
    placeholder: '例: 090-0000-0000',
  },
  {
    key: 'notes',
    label: '備考メモ',
    placeholder: '特記事項やヒアリングメモを記載',
    isTextArea: true,
  },
]

export function ClientFactPanel({
  facts,
  autoFilledKeys,
  onChange,
}: {
  facts: FactValues
  autoFilledKeys: Set<FactKey>
  onChange: (key: FactKey, value: string) => void
}) {
  return (
    <div className="rounded-xl border border-border bg-background/80 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Sparkles className="h-4 w-4 text-primary" />
        <span>ヒアリングで確認した項目</span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        文字起こしで補完された値は編集・上書きできます。
      </p>
      <div className="mt-4 grid gap-4">
        {FACT_FIELD_CONFIGS.map(({ key, label, placeholder, isTextArea, options }) => {
          const value = facts[key] ?? ''
          const isAutoFilled = autoFilledKeys.has(key)
          return (
            <div key={key} className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                {label}
                {isAutoFilled && (
                  <span className="ml-2 inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                    自動反映
                  </span>
                )}
              </Label>
              {options ? (
                <Select
                  value={value ? value : UNSET_OPTION_VALUE}
                  onValueChange={(next) => onChange(key, next === UNSET_OPTION_VALUE ? '' : next)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={placeholder ?? '選択してください'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UNSET_OPTION_VALUE}>未選択</SelectItem>
                    {options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : isTextArea ? (
                <Textarea
                  value={value}
                  rows={3}
                  placeholder={placeholder}
                  onChange={(event) => onChange(key, event.target.value)}
                />
              ) : (
                <Input
                  value={value}
                  placeholder={placeholder}
                  onChange={(event) => onChange(key, event.target.value)}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function createFactValuesFromSource(source: ClientFactsSource): FactValues {
  return {
    gender: source.gender ?? '',
    birthDate: formatBirthDateValue(source.birthDate),
    phone: source.phone ?? '',
    address: buildAddressLine(source.address) ?? '',
    disability: source.disability ?? '',
    careLevel: source.careLevel ?? '',
    emergencyContactName: source.emergencyContactName ?? '',
    emergencyContactRelation: source.emergencyContactRelation ?? '',
    emergencyContactPhone: source.emergencyContactPhone ?? '',
    notes: source.notes ?? '',
  }
}

export function extractFactsFromTranscriptions(
  transcriptions: Array<{ text: string }>,
): Partial<FactValues> {
  if (transcriptions.length === 0) {
    return {}
  }

  const text = transcriptions
    .map((item) => item.text)
    .join('\n')
    .replace(/\r/g, '')

  const result: Partial<FactValues> = {}

  const genderMatch = text.match(/性別[:：]\s*([^\n]+)/i)
  if (genderMatch) {
    const normalized = normalizeGender(genderMatch[1] ?? '')
    if (normalized) {
      result.gender = normalized
    }
  }

  const birthDateMatch = text.match(
    /生年月日[:：]\s*((\d{4})年\d{1,2}月\d{1,2}日|\d{4}\/\d{1,2}\/\d{1,2}|\d{4}-\d{1,2}-\d{1,2})/i,
  )
  if (birthDateMatch) {
    result.birthDate = birthDateMatch[1]
  }

  const phoneMatch = text.match(/電話番号[:：]\s*([\d-]{8,})/i)
  if (phoneMatch) {
    result.phone = phoneMatch[1]
  }

  const addressMatch = text.match(/住所[:：]\s*([^\n]+)/i)
  const addressValue = addressMatch?.[1]
  if (addressValue) {
    result.address = addressValue.trim()
  }

  const disabilityMatch = text.match(/障害種別[:：]\s*([^\n]+)/i)
  const disabilityValue = disabilityMatch?.[1]
  if (disabilityValue) {
    result.disability = disabilityValue.trim()
  }

  const careLevelMatch = text.match(/障害支援区分[:：]\s*(区分\d)/i)
  if (careLevelMatch) {
    result.careLevel = careLevelMatch[1]
  }

  const emergencyNameMatch = text.match(/緊急連絡先[:：]\s*([^\n]+)/i)
  const emergencyNameValue = emergencyNameMatch?.[1]
  if (emergencyNameValue) {
    result.emergencyContactName = emergencyNameValue.trim()
  }

  const emergencyRelationMatch = text.match(/続柄[:：]\s*([^\n]+)/i)
  const emergencyRelationValue = emergencyRelationMatch?.[1]
  if (emergencyRelationValue) {
    const normalizedRelation = normalizeRelation(emergencyRelationValue)
    if (normalizedRelation) {
      result.emergencyContactRelation = normalizedRelation
    }
  }

  const emergencyPhoneMatch = text.match(/緊急連絡先電話[:：]\s*([\d-]{8,})/i)
  if (emergencyPhoneMatch) {
    result.emergencyContactPhone = emergencyPhoneMatch[1]
  }

  const notesMatch = text.match(/備考[:：]\s*([\s\S]+)/i)
  const notesValue = notesMatch?.[1]
  if (notesValue) {
    result.notes = notesValue.trim()
  }

  return result
}

export function getFactOptionLabel(key: FactKey, value?: string | null): string | null {
  if (!value) return null
  const config = FACT_FIELD_CONFIGS.find((item) => item.key === key)
  const option = config?.options?.find((item) => item.value === value)
  return option?.label ?? value
}

export function buildAddressLine(
  address:
    | {
        prefecture?: string | null
        city?: string | null
        street?: string | null
        building?: string | null
      }
    | null
    | undefined,
): string | null {
  if (!address) return null
  const parts = [
    address.prefecture ?? '',
    address.city ?? '',
    address.street ?? '',
    address.building ?? '',
  ].filter(Boolean)
  if (parts.length === 0) return null
  return parts.join('')
}

function formatBirthDateValue(raw: string | null | undefined | Date): string {
  if (!raw) return ''
  if (raw instanceof Date) {
    return Number.isNaN(raw.getTime()) ? '' : raw.toLocaleDateString('ja-JP')
  }
  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) {
    return raw
  }
  return parsed.toLocaleDateString('ja-JP')
}

function normalizeGender(raw: string): string | null {
  const normalized = raw.trim().toLowerCase()
  if (!normalized) return null
  if (normalized.includes('女')) return 'female'
  if (normalized.includes('男')) return 'male'
  if (normalized.includes('other') || normalized.includes('その') || normalized.includes('不明')) {
    return 'other'
  }
  if (normalized === 'female') return 'female'
  if (normalized === 'male') return 'male'
  if (normalized === 'other') return 'other'
  return null
}

function normalizeRelation(raw: string): string {
  const normalized = raw.trim()
  const mappings: Array<{ pattern: RegExp; value: string }> = [
    { pattern: /(母|母親)/, value: '母' },
    { pattern: /(父|父親)/, value: '父' },
    { pattern: /(夫|妻|配偶者)/, value: '配偶者' },
    { pattern: /(息子|娘|子ども|子供|子)/, value: '子' },
    { pattern: /(兄|弟|姉|妹|兄弟|姉妹)/, value: '兄弟姉妹' },
    { pattern: /(祖父|祖母|祖父母)/, value: '祖父母' },
  ]

  for (const mapping of mappings) {
    if (mapping.pattern.test(normalized)) {
      return mapping.value
    }
  }

  if (!normalized) {
    return ''
  }

  if (RELATION_OPTIONS.some((option) => option.value === normalized)) {
    return normalized
  }

  return 'その他'
}
