'use client'

import { ArrowLeft, ChevronDown, ChevronRight, Mic, Plus, Sparkles, Wand2 } from 'lucide-react'
import Form from 'next/form'
import Link from 'next/link'
import { useActionState, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
              <div className="mt-3">
                <ClientSummary
                  client={client}
                  className="rounded-xl border border-border bg-background p-4"
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

  const addressLine = useMemo(() => {
    if (!address) return null
    const parts = [
      address.prefecture ?? '',
      address.city ?? '',
      address.street ?? '',
      address.building ?? '',
    ].filter(Boolean)
    if (parts.length === 0) return null
    return parts.join('')
  }, [address])

  return (
    <div className={cn('grid gap-4 md:grid-cols-3', className)}>
      <InfoItem label="ふりがな" value={nameKana} />
      <InfoItem label="性別" value={gender} />
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
      <InfoItem label="障害種別" value={disability} />
      <InfoItem label="要介護度" value={careLevel} />
      <InfoItem label="住所" value={addressLine} />
      <InfoItem label="緊急連絡先" value={emergencyContactName} />
      <InfoItem label="続柄" value={emergencyContactRelation} />
      <InfoItem label="緊急連絡先電話" value={emergencyContactPhone} />
      <InfoItem label="備考" value={notes} className="md:col-span-3" />
    </div>
  )
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
