'use client'

import { ArrowLeft, ChevronDown, ChevronRight, Mic, Plus, Sparkles, Wand2 } from 'lucide-react'
import Form from 'next/form'
import Link from 'next/link'
import { useActionState, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { generateStructuredSummary } from '../components/ai-actions'
import { AiSupport } from '../components/ai-support'
import type { SpeechRecognitionHandle, TranscriptionItem } from '../components/speech-recognition'
import { SpeechRecognition } from '../components/speech-recognition'

export type SummarySection = {
  id: string
  title: string
  content: string
  slug?: string
  aiGenerated?: boolean
}

export type ClientSnapshot = {
  id: string
  name: string
  nameKana?: string | null
  gender?: string | null
  birthDate?: string | null
  age?: number | null
  disability?: string | null
  careLevel?: string | null
  phone?: string | null
  notes?: string | null
  emergencyContactName?: string | null
  emergencyContactRelation?: string | null
  emergencyContactPhone?: string | null
  address?: {
    postalCode?: string | null
    prefecture?: string | null
    city?: string | null
    street?: string | null
    building?: string | null
  } | null
}

export type CreateHearingFormState = { status: 'idle' } | { status: 'error'; message: string }

interface HearingNewShellProps {
  client: ClientSnapshot
  supporterName?: string | null
  defaultDate: string
  initialTitle: string
  initialSummary: SummarySection[]
  createAction: (
    prevState: CreateHearingFormState,
    formData: FormData,
  ) => Promise<CreateHearingFormState>
  initialFormState: CreateHearingFormState
  backHref: string
}

const NEW_SECTION_TEMPLATE = {
  title: '新しい項目',
  content: '',
} as const

type FactKey =
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

type FactValues = Record<FactKey, string>

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

const UNSET_OPTION_VALUE = '__unset__'

const FACT_FIELD_CONFIGS: Array<{
  key: FactKey
  label: string
  placeholder?: string
  isTextArea?: boolean
  options?: Array<{ value: string; label: string }>
}> = [
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

export function HearingNewShell({
  client,
  supporterName,
  defaultDate,
  initialTitle,
  initialSummary,
  createAction,
  initialFormState,
  backHref,
}: HearingNewShellProps) {
  const [formState, formAction, isPending] = useActionState(createAction, initialFormState)
  const [title, setTitle] = useState(initialTitle)
  const [date, setDate] = useState(defaultDate)
  const [summarySections, setSummarySections] = useState<SummarySection[]>(() =>
    initialSummary.map((section) => ({ ...section })),
  )
  const [transcriptions, setTranscriptions] = useState<TranscriptionItem[]>([])
  const manualEditedSections = useRef<Set<string>>(new Set())
  const lastAutoUpdateCount = useRef(0)
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<'transcription' | 'ai-support'>('transcription')
  const [newSectionTitle, setNewSectionTitle] = useState('')
  const [isAutoUpdating, startAutoUpdate] = useTransition()
  const [autoUpdateError, setAutoUpdateError] = useState<string | null>(null)
  const [factValues, setFactValues] = useState<FactValues>(() => createInitialFactValues(client))
  const userEditedFactKeys = useRef<Set<FactKey>>(new Set())
  const [autoFilledFactKeys, setAutoFilledFactKeys] = useState<Set<FactKey>>(new Set())

  // 集約した要約テキスト（AI支援にも渡す）
  const structuredMemo = useMemo(() => {
    return summarySections
      .map((section) => {
        const heading = section.title.trim()
        const body = section.content.trim()
        if (!heading && !body) return ''
        if (!body) return heading
        return `${heading}\n${body}`
      })
      .filter(Boolean)
      .join('\n\n')
  }, [summarySections])

  const serializedSummary = useMemo(() => {
    const payload = summarySections.map(({ id, title, content, slug }) => ({
      id,
      title,
      content,
      slug: slug ?? null,
    }))
    return JSON.stringify(payload)
  }, [summarySections])

  const serializedTranscription = useMemo(() => {
    const payload = transcriptions.map((item) => ({
      text: item.text,
      timestamp: item.timestamp.toISOString(),
    }))
    return JSON.stringify(payload)
  }, [transcriptions])

  const handleSummaryContentChange = (id: string, value: string) => {
    manualEditedSections.current.add(id)
    setSummarySections((prev) =>
      prev.map((section) =>
        section.id === id ? { ...section, content: value, aiGenerated: false } : section,
      ),
    )
  }

  const handleSummaryTitleChange = (id: string, value: string) => {
    manualEditedSections.current.add(id)
    setSummarySections((prev) =>
      prev.map((section) =>
        section.id === id ? { ...section, title: value, aiGenerated: false } : section,
      ),
    )
  }

  const handleAddSection = () => {
    const titleCandidate = newSectionTitle.trim() || `${NEW_SECTION_TEMPLATE.title}`
    const newSection: SummarySection = {
      id: crypto.randomUUID(),
      title: titleCandidate,
      content: NEW_SECTION_TEMPLATE.content,
      aiGenerated: false,
    }
    manualEditedSections.current.add(newSection.id)
    setSummarySections((prev) => [...prev, newSection])
    setNewSectionTitle('')
  }

  const handleTranscriptionChange = (updated: TranscriptionItem[]) => {
    setTranscriptions(updated)
  }

  const handleFactChange = (key: FactKey, value: string) => {
    userEditedFactKeys.current.add(key)
    setAutoFilledFactKeys((prev) => {
      if (!prev.has(key)) {
        return prev
      }
      const next = new Set(prev)
      next.delete(key)
      return next
    })
    setFactValues((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const speechRef = useRef<SpeechRecognitionHandle | null>(null)
  const [isRecording, setIsRecording] = useState(false)

  const toggleRecording = () => {
    setActiveTab('transcription')
    speechRef.current?.toggle()
    // 状態を更新（次のレンダリングで反映）
    setTimeout(() => {
      setIsRecording(speechRef.current?.isListening() ?? false)
    }, 100)
  }

  // 変更があったかどうかを判定
  const hasChanges = useMemo(() => {
    const titleChanged = title !== initialTitle
    const dateChanged = date !== defaultDate
    const summaryChanged = summarySections.some((section) => section.content.trim() !== '')
    const transcriptionChanged = transcriptions.length > 0
    return titleChanged || dateChanged || summaryChanged || transcriptionChanged
  }, [title, initialTitle, date, defaultDate, summarySections, transcriptions])

  useEffect(() => {
    const nextFacts = createInitialFactValues(client)
    setFactValues((prev) => {
      const next = { ...prev }
      let changed = false
      FACT_FIELD_CONFIGS.forEach(({ key }) => {
        if (userEditedFactKeys.current.has(key)) {
          return
        }
        if (next[key] !== nextFacts[key]) {
          next[key] = nextFacts[key]
          changed = true
        }
      })
      return changed ? next : prev
    })
    setAutoFilledFactKeys(new Set())
  }, [client])

  useEffect(() => {
    if (transcriptions.length === 0) {
      return
    }
    const suggestions = extractFactsFromTranscriptions(transcriptions)
    const entries = Object.entries(suggestions) as Array<[FactKey, string]>
    if (entries.length === 0) {
      return
    }

    const autoKeys: FactKey[] = []
    setFactValues((prev) => {
      const next = { ...prev }
      let changed = false
      for (const [key, value] of entries) {
        if (!value) continue
        if (userEditedFactKeys.current.has(key)) continue
        if (next[key] === value) continue
        next[key] = value
        changed = true
        autoKeys.push(key)
      }
      if (!changed) {
        autoKeys.length = 0
        return prev
      }
      return next
    })

    if (autoKeys.length > 0) {
      setAutoFilledFactKeys((prev) => {
        const updated = new Set(prev)
        autoKeys.forEach((key) => updated.add(key))
        return updated
      })
    }
  }, [transcriptions])

  useEffect(() => {
    const currentCount = transcriptions.length
    const shouldAutoUpdate =
      currentCount > 0 && currentCount % 5 === 0 && currentCount > lastAutoUpdateCount.current

    if (!shouldAutoUpdate) {
      return
    }

    lastAutoUpdateCount.current = currentCount

    const sectionsPayload = summarySections.map((section) => ({
      slug: section.slug ?? null,
      title: section.title,
      content: section.content,
    }))

    startAutoUpdate(async () => {
      setAutoUpdateError(null)
      try {
        const result = await generateStructuredSummary(transcriptions, sectionsPayload)
        if ('success' in result && result.success) {
          setSummarySections((prev) =>
            prev.map((section) => {
              const match =
                result.sections.find((item) =>
                  item.slug && section.slug
                    ? item.slug === section.slug
                    : item.title === section.title,
                ) ?? null

              if (!match) {
                return section
              }

              if (manualEditedSections.current.has(section.id)) {
                return section
              }

              return {
                ...section,
                title: match.title ?? section.title,
                content: match.content ?? section.content,
                aiGenerated: true,
              }
            }),
          )
        } else if ('type' in result) {
          setAutoUpdateError(result.message)
        }
      } catch (error) {
        console.error('Failed to auto-update hearing summary', error)
        setAutoUpdateError('AIによる要約更新に失敗しました')
      }
    })
  }, [transcriptions, summarySections])

  return (
    <div className="min-h-screen bg-background">
      <Form id="hearing-form" action={formAction} className="flex flex-col min-h-screen">
        <input type="hidden" name="summary" value={serializedSummary} />
        <input type="hidden" name="transcriptions" value={serializedTranscription} />
        <header className="border-b bg-background">
          <div className="mx-auto flex w-full flex-col px-6 py-6 lg:px-12">
            <div className="flex flex-col gap-3 lg:gap-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-1 items-center gap-3">
                  <Button asChild variant="ghost" size="icon">
                    <Link href={backHref}>
                      <ArrowLeft className="size-6" />
                      <span className="sr-only">戻る</span>
                    </Link>
                  </Button>
                  <div className="flex-1">
                    <Label htmlFor="title" className="sr-only">
                      メモのタイトル
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      required
                      className="md:text-2xl md:py-5! font-semibold tracking-tight shadow-none border-none"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Label htmlFor="date" className="sr-only">
                    実施日
                  </Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                    required
                    className="w-[160px] shadow-none focus-visible:shadow-none"
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                <span>
                  対象: {client.name} さん
                  {supporterName ? ` ・ 担当: ${supporterName}` : ''}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsHeaderExpanded((prev) => !prev)}
                  className="flex items-center gap-2"
                >
                  {isHeaderExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  利用者情報
                </Button>
              </div>
            </div>
            {isHeaderExpanded && (
              <div className="mt-3 space-y-4">
                <ClientSummary
                  client={client}
                  className="rounded-xl border border-border bg-background p-4"
                />
                <ClientFactPanel
                  facts={factValues}
                  autoFilledKeys={autoFilledFactKeys}
                  onChange={handleFactChange}
                />
              </div>
            )}
          </div>
        </header>

        <main className="flex flex-1 flex-col">
          <div className="flex px-6 lg:px-12 w-full flex-1 flex-col">
            <div className="flex flex-1 flex-col lg:flex-row lg:items-start">
              <section className="flex-1 pr-6 lg:pr-12 py-6 lg:border-r lg:border-border/60">
                <div className="flex h-full flex-col">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-lg font-semibold">ヒアリング要約</h2>
                      <p className="text-sm text-muted-foreground">
                        ヒアリング項目ごとにメモを整理します。AIが自動更新しますが、自由に編集できます。
                      </p>
                    </div>
                    {isAutoUpdating && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Sparkles className="h-4 w-4 animate-spin" />
                        <span>AIが要約を更新中...</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-6 flex-1">
                    <div className="space-y-6 pr-2">
                      {summarySections.map((section, index) => (
                        <div
                          key={section.id}
                          className={cn(
                            'flex flex-col gap-3',
                            index === 0 ? '' : 'border-t border-border/60 pt-6',
                          )}
                        >
                          <Input
                            value={section.title}
                            onChange={(event) =>
                              handleSummaryTitleChange(section.id, event.target.value)
                            }
                            className="text-base font-semibold"
                            placeholder="項目名"
                          />
                          {section.aiGenerated && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Sparkles className="h-3 w-3" />
                              <span>AIが更新</span>
                            </div>
                          )}
                          <Textarea
                            value={section.content}
                            onChange={(event) =>
                              handleSummaryContentChange(section.id, event.target.value)
                            }
                            rows={5}
                            className="resize-none"
                            placeholder="聞き取った内容をメモしましょう"
                          />
                        </div>
                      ))}
                      <div className="border-t border-dashed border-border/60 pt-6">
                        <p className="mb-2 text-sm text-muted-foreground">新しい項目を追加</p>
                        <div className="flex items-center gap-2">
                          <Input
                            value={newSectionTitle}
                            onChange={(event) => setNewSectionTitle(event.target.value)}
                            placeholder="項目名を入力"
                          />
                          <Button type="button" variant="outline" onClick={handleAddSection}>
                            <Plus className="mr-2 h-4 w-4" />
                            追加
                          </Button>
                        </div>
                      </div>
                      {autoUpdateError && (
                        <p className="text-sm text-destructive">
                          AIの更新に失敗しました: {autoUpdateError}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              <aside className="w-full border-t border-border/60 pl-6 pr-6 py-6 lg:sticky lg:top-0 lg:self-start lg:w-[400px] lg:max-w-[400px] lg:border-t-0 lg:pl-12 lg:pr-0">
                <Tabs
                  value={activeTab}
                  onValueChange={(value) => setActiveTab(value as typeof activeTab)}
                  className="flex h-full flex-col"
                >
                  <TabsList className="grid w-full grid-cols-2 bg-muted/40">
                    <TabsTrigger value="transcription" className="flex items-center gap-2">
                      <Mic className="h-4 w-4" />
                      文字起こし
                    </TabsTrigger>
                    <TabsTrigger value="ai-support" className="flex items-center gap-2">
                      <Wand2 className="h-4 w-4" />
                      AIヒアリング支援
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent
                    value="transcription"
                    forceMount
                    className={cn('pt-6', activeTab !== 'transcription' && 'hidden')}
                  >
                    <SpeechRecognition
                      ref={speechRef}
                      onTranscriptionUpdate={async () => ({ success: true })}
                      onTranscriptionChange={handleTranscriptionChange}
                      initialTranscription={[]}
                      currentMemo={structuredMemo}
                      showHeader={false}
                    />
                  </TabsContent>
                  <TabsContent value="ai-support" className="pt-6" forceMount>
                    <AiSupport
                      transcription={transcriptions}
                      currentMemo={structuredMemo}
                      isActive={activeTab === 'ai-support'}
                    />
                  </TabsContent>
                </Tabs>
              </aside>
            </div>
          </div>
        </main>
      </Form>

      {/* エラーメッセージ表示エリア */}
      {formState.status === 'error' && (
        <div className="fixed top-6 right-6 z-50 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-2 shadow-lg">
          <p className="text-sm text-destructive">{formState.message}</p>
        </div>
      )}

      {/* 右下固定ボタンエリア */}
      <div className="fixed bottom-10 right-10 z-50 flex items-center gap-6">
        {/* 保存ボタン */}
        <Button
          type="submit"
          form="hearing-form"
          disabled={isPending || !hasChanges}
          size="lg"
          className="shadow-lg font-semibold"
        >
          {isPending ? '保存中...' : hasChanges ? '保存する' : '変更がありません'}
        </Button>

        {/* ヒアリング開始ボタン */}
        <Button
          type="button"
          variant={isRecording ? 'destructive' : 'default'}
          onClick={toggleRecording}
          className="flex size-16 items-center justify-center rounded-full shadow-lg hover:scale-105 transition-transform"
        >
          <Mic className="size-6" />
          <span className="sr-only">{isRecording ? 'ヒアリングを停止' : 'ヒアリングを開始'}</span>
        </Button>
      </div>
    </div>
  )
}

interface ClientSummaryProps {
  client: ClientSnapshot
  className?: string
}

function ClientSummary({ client, className }: ClientSummaryProps) {
  const {
    nameKana,
    gender,
    birthDate,
    age,
    phone,
    disability,
    careLevel,
    notes,
    emergencyContactName,
    emergencyContactRelation,
    emergencyContactPhone,
    address,
  } = client

  const addressLine = useMemo(() => buildAddressLine(address), [address])

  return (
    <div className={cn('grid gap-4 md:grid-cols-3', className)}>
      <InfoItem label="ふりがな" value={nameKana} />
      <InfoItem label="性別" value={getFactOptionLabel('gender', gender)} />
      <InfoItem
        label="生年月日"
        value={
          birthDate
            ? `${new Date(birthDate).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}${age != null ? `（${age}歳）` : ''}`
            : null
        }
      />
      <InfoItem label="電話番号" value={phone} />
      <InfoItem label="障害種別" value={getFactOptionLabel('disability', disability)} />
      <InfoItem label="要介護度" value={getFactOptionLabel('careLevel', careLevel)} />
      <InfoItem label="住所" value={addressLine} />
      <InfoItem label="緊急連絡先" value={emergencyContactName} />
      <InfoItem
        label="続柄"
        value={getFactOptionLabel('emergencyContactRelation', emergencyContactRelation)}
      />
      <InfoItem label="緊急連絡先電話" value={emergencyContactPhone} />
      <InfoItem label="備考" value={notes} className="md:col-span-3" />
    </div>
  )
}

function createInitialFactValues(client: ClientSnapshot): FactValues {
  return {
    gender: client.gender ?? '',
    birthDate: client.birthDate ? new Date(client.birthDate).toLocaleDateString('ja-JP') : '',
    phone: client.phone ?? '',
    address: buildAddressLine(client.address) ?? '',
    disability: client.disability ?? '',
    careLevel: client.careLevel ?? '',
    emergencyContactName: client.emergencyContactName ?? '',
    emergencyContactRelation: client.emergencyContactRelation ?? '',
    emergencyContactPhone: client.emergencyContactPhone ?? '',
    notes: client.notes ?? '',
  }
}

function extractFactsFromTranscriptions(transcriptions: TranscriptionItem[]): Partial<FactValues> {
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

interface ClientFactPanelProps {
  facts: FactValues
  autoFilledKeys: Set<FactKey>
  onChange: (key: FactKey, value: string) => void
}

function ClientFactPanel({ facts, autoFilledKeys, onChange }: ClientFactPanelProps) {
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
                  onValueChange={(next) =>
                    onChange(key, next === UNSET_OPTION_VALUE ? '' : next)
                  }
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

function getFactOptionLabel(key: FactKey, value?: string | null): string | null {
  if (!value) return null
  const config = FACT_FIELD_CONFIGS.find((item) => item.key === key)
  const option = config?.options?.find((item) => item.value === value)
  return option?.label ?? value
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

function buildAddressLine(address: ClientSnapshot['address'] | undefined | null): string | null {
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

interface InfoItemProps {
  label: string
  value?: string | null
  className?: string
}

function InfoItem({ label, value, className }: InfoItemProps) {
  if (!value) return null
  return (
    <div className={cn('space-y-1 rounded-lg border border-border/60 p-3', className)}>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  )
}
