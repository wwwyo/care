'use client'

import { ArrowLeft, ChevronDown, ChevronRight, Plus } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { TranscriptionItem } from '../components/speech-recognition'
import { TitleEditor } from './title-editor'

export type ClientSummaryData = {
  nameKana?: string | null
  gender?: string | null
  birthDate?: string | null
  age?: number | null
  phone?: string | null
  disability?: string | null
  careLevel?: string | null
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

interface HearingDetailShellProps {
  memoId: string
  backHref: string
  initialTitle: string
  formattedDate: string
  clientName: string
  supporterName?: string | null
  clientSummary: ClientSummaryData
  initialDocument: string
  initialTranscription: TranscriptionItem[]
  onSaveDocument: (
    formData: FormData,
  ) => Promise<{ success: true } | { type: 'Error'; message: string }>
}

type SummarySection = {
  id: string
  title: string
  content: string
  slug: string | null
}

const SUMMARY_TEMPLATES: Array<{ slug: string; title: string }> = [
  { slug: 'support-history', title: '支援経過' },
  { slug: 'current-status', title: '現状' },
  { slug: 'challenges', title: '課題' },
  { slug: 'family-tree', title: '家系図' },
  { slug: 'family-names', title: '家族の名前' },
  { slug: 'eco-map', title: 'エコマップ' },
  { slug: 'medical-status', title: '医療の状況' },
  { slug: 'care', title: '介護' },
  { slug: 'medicine', title: '薬' },
  { slug: 'life-history', title: '生活歴' },
]

export function HearingDetailShell({
  memoId,
  backHref,
  initialTitle,
  formattedDate,
  clientName,
  supporterName,
  clientSummary,
  initialDocument,
  initialTranscription,
  onSaveDocument,
}: HearingDetailShellProps) {
  const initialSummarySections = useMemo(
    () => buildInitialSummary(initialDocument),
    [initialDocument],
  )

  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false)
  const [summarySections, setSummarySections] = useState<SummarySection[]>(initialSummarySections)
  const [baselineStructuredContent, setBaselineStructuredContent] = useState(() =>
    serializeSummary(initialSummarySections),
  )
  const [newSectionTitle, setNewSectionTitle] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const addressLine = useMemo(() => {
    const address = clientSummary.address
    if (!address) return null
    const parts = [
      address.prefecture ?? '',
      address.city ?? '',
      address.street ?? '',
      address.building ?? '',
    ].filter(Boolean)
    if (parts.length === 0) return null
    return parts.join('')
  }, [clientSummary.address])

  const structuredContent = useMemo(() => serializeSummary(summarySections), [summarySections])
  const hasChanges = structuredContent !== baselineStructuredContent

  const handleSummaryTitleChange = (id: string, value: string) => {
    setSummarySections((prev) =>
      prev.map((section) => (section.id === id ? { ...section, title: value } : section)),
    )
  }

  const handleSummaryContentChange = (id: string, value: string) => {
    setSummarySections((prev) =>
      prev.map((section) => (section.id === id ? { ...section, content: value } : section)),
    )
  }

  const handleAddSection = () => {
    const title = newSectionTitle.trim() || '新しい項目'
    const nextSection: SummarySection = {
      id: crypto.randomUUID(),
      title,
      content: '',
      slug: null,
    }
    setSummarySections((prev) => [...prev, nextSection])
    setNewSectionTitle('')
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveError(null)
    try {
      const formData = new FormData()
      formData.set('document', structuredContent)
      const result = await onSaveDocument(formData)
      if ('type' in result) {
        setSaveError(result.message)
        toast.error(result.message)
        return
      }
      setBaselineStructuredContent(structuredContent)
      toast.success('保存しました')
    } catch (error) {
      console.error('Failed to save hearing memo content', error)
      setSaveError('保存に失敗しました。時間を置いて再度お試しください。')
      toast.error('保存に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background">
        <div className="mx-auto flex w-full flex-col px-6 py-6 lg:px-12">
          <div className="flex flex-col gap-3 lg:gap-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-1 items-center gap-3">
                <Button asChild variant="ghost" size="icon">
                  <Link href={backHref}>
                    <ArrowLeft className="size-8" />
                    <span className="sr-only">戻る</span>
                  </Link>
                </Button>
                <div className="flex-1">
                  <TitleEditor initialTitle={initialTitle} memoId={memoId} />
                  <p className="mt-2 text-sm text-muted-foreground">{formattedDate}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                <span>
                  対象: {clientName} さん
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
                <ClientSummaryCard summary={clientSummary} addressLine={addressLine} />
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <div className="flex w-full flex-1 flex-col px-6 lg:px-12">
          <div className="flex flex-1 flex-col lg:flex-row lg:items-start">
            <section className="flex-1 py-6 pr-6 lg:border-r lg:border-border/60 lg:pr-12">
              <article className="flex h-full flex-col">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">ヒアリング要約</h2>
                    <p className="text-sm text-muted-foreground">
                      ヒアリング項目ごとに整理されたメモを編集できます。
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex-1">
                  <div className="space-y-6 pr-2">
                    {summarySections.map((section, index) => (
                      <div
                        key={section.id}
                        className={cn(
                          'flex flex-col gap-3',
                          index === 0 ? undefined : 'border-t border-border/60 pt-6',
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
                        <Textarea
                          value={section.content}
                          onChange={(event) =>
                            handleSummaryContentChange(section.id, event.target.value)
                          }
                          rows={6}
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
                    {saveError && (
                      <p className="text-sm text-destructive">保存エラー: {saveError}</p>
                    )}
                  </div>
                </div>
              </article>
            </section>
            <aside className="w-full border-t border-border/60 pl-6 pr-6 py-6 lg:sticky lg:top-0 lg:self-start lg:w-[400px] lg:max-w-[400px] lg:border-t-0 lg:pl-12 lg:pr-0">
              <TranscriptionList items={initialTranscription} />
            </aside>
          </div>
        </div>
      </main>
      <div className="fixed bottom-10 right-10 z-50 flex items-center gap-4">
        <Button type="button" size="lg" onClick={handleSave} disabled={isSaving || !hasChanges}>
          {isSaving ? '保存中...' : '保存する'}
        </Button>
      </div>
    </div>
  )
}

function ClientSummaryCard({
  summary,
  addressLine,
}: {
  summary: ClientSummaryData
  addressLine: string | null
}) {
  return (
    <div className="grid gap-4 rounded-xl border border-border bg-background p-4 md:grid-cols-3">
      <InfoItem label="ふりがな" value={summary.nameKana} />
      <InfoItem label="性別" value={summary.gender} />
      <InfoItem
        label="生年月日"
        value={summary.birthDate ? formatBirthDate(summary.birthDate, summary.age) : null}
      />
      <InfoItem label="電話番号" value={summary.phone} />
      <InfoItem label="障害種別" value={summary.disability} />
      <InfoItem label="要介護度" value={summary.careLevel} />
      <InfoItem label="住所" value={addressLine} />
      <InfoItem label="緊急連絡先" value={summary.emergencyContactName} />
      <InfoItem label="続柄" value={summary.emergencyContactRelation} />
      <InfoItem label="緊急連絡先電話" value={summary.emergencyContactPhone} />
      <InfoItem label="備考" value={summary.notes} className="md:col-span-3" />
    </div>
  )
}

function formatBirthDate(birthDate: string, age: number | null | undefined) {
  const date = new Date(birthDate)
  if (Number.isNaN(date.getTime())) return null
  const formatted = date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  return age != null ? `${formatted}（${age}歳）` : formatted
}

interface InfoItemProps {
  label: string
  value?: string | null
  className?: string
}

function InfoItem({ label, value, className }: InfoItemProps) {
  if (!value) return null
  return (
    <div
      className={cn('space-y-1 rounded-lg border border-border/60 bg-background/70 p-3', className)}
    >
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  )
}

function TranscriptionList({ items }: { items: TranscriptionItem[] }) {
  return (
    <div className="flex h-full space-y-4 flex-col">
      <div className="h-full space-y-2 overflow-y-auto rounded-xl bg-muted/60 p-4">
        {items.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
            文字起こしデータがありません
          </div>
        ) : (
          items.map((item, index) => (
            <div
              key={`${item.timestamp.getTime()}-${index}`}
              className="rounded-lg bg-background/90 p-2"
            >
              <p className="mb-1 text-xs text-muted-foreground">
                {item.timestamp.toLocaleTimeString('ja-JP')}
              </p>
              <p className="text-sm leading-relaxed">{item.text}</p>
            </div>
          ))
        )}
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <p>発話数: {items.length}</p>
      </div>
    </div>
  )
}

function buildInitialSummary(content: string): SummarySection[] {
  const defaults = SUMMARY_TEMPLATES.map((template) => ({
    id: crypto.randomUUID(),
    title: template.title,
    content: '',
    slug: template.slug,
  }))

  const parsed = parseStructuredContent(content)
  if (parsed.length === 0) {
    return defaults
  }

  const merged: SummarySection[] = []
  parsed.forEach((section, index) => {
    const template = defaults[index] ?? null
    const fallbackTitle = template?.title ?? `セクション${index + 1}`
    merged.push({
      id: crypto.randomUUID(),
      title: section.title.length > 0 ? section.title : fallbackTitle,
      content: section.content,
      slug: template?.slug ?? null,
    })
  })

  for (let index = parsed.length; index < defaults.length; index += 1) {
    const template = defaults[index] ?? null
    merged.push({
      id: crypto.randomUUID(),
      title: template?.title ?? `セクション${index + 1}`,
      content: '',
      slug: template?.slug ?? null,
    })
  }

  return merged
}

function parseStructuredContent(content: string): Array<{ title: string; content: string }> {
  const trimmed = content.trim()
  if (trimmed.length === 0) {
    return []
  }

  const sectionStrings = trimmed.split(/\n{2,}/)
  return sectionStrings.map((section, index) => {
    const lines = section.split('\n')
    const title = lines[0]?.trim() ?? `セクション${index + 1}`
    const body = lines.slice(1).join('\n').trim()
    return { title, content: body }
  })
}

function serializeSummary(sections: SummarySection[]): string {
  const combined = sections
    .map((section) => {
      const title = section.title.trim()
      const body = section.content.trim()
      if (title.length === 0 && body.length === 0) {
        return ''
      }
      if (body.length === 0) {
        return title
      }
      return `${title}\n${body}`
    })
    .filter((value) => value.length > 0)
    .join('\n\n')

  return combined.trim()
}
