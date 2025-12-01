import { notFound, redirect } from 'next/navigation'
import { z } from 'zod'
import { requireRealm } from '@/features/auth/helpers'
import { getClientById } from '@/features/client/infra/client-query'
import { createHearingMemo } from '@/features/hearing-memo/usecase/create-memo'
import { updateHearingMemoContent } from '@/features/hearing-memo/usecase/update-memo'
import { updateHearingTranscripts } from '@/features/hearing-memo/usecase/update-transcription'
import { getSupporterByUserId } from '@/features/supporter/infra/query/supporter-query'
import {
  type ClientSnapshot,
  type CreateHearingFormState,
  HearingNewShell,
  type SummarySection,
} from './hearing-new-shell'

interface NewHearingMemoPageProps {
  params: Promise<{ id: string }>
}

const SUMMARY_TEMPLATES: Array<{ slug: string; title: string }> = [
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

const INITIAL_FORM_STATE: CreateHearingFormState = { status: 'idle' }

const CreateFormSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
  date: z.string().min(1, '実施日は必須です'),
  summary: z.string().optional(),
  transcriptions: z.string().optional(),
})

const SummarySectionPayloadSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string().optional().default(''),
  slug: z.string().nullable().optional(),
})

const TranscriptionPayloadSchema = z.object({
  text: z.string().min(1),
  timestamp: z.string().min(1),
})

function createDefaultSummarySections(): SummarySection[] {
  return SUMMARY_TEMPLATES.map(({ slug, title }) => ({
    id: crypto.randomUUID(),
    title,
    content: '',
    slug,
  }))
}

function calculateAge(birthDate: Date | null): number | null {
  if (!birthDate) return null
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1
  }
  return age
}

function toClientSnapshot(
  client: NonNullable<Awaited<ReturnType<typeof getClientById>>>,
): ClientSnapshot {
  const profile = client.profile
  const primaryAddress = client.addresses?.[0]

  return {
    id: client.id,
    name: profile?.name ?? '利用者',
    nameKana: profile?.nameKana ?? null,
    gender: profile?.gender ?? null,
    birthDate: profile?.birthDate ? profile.birthDate.toISOString() : null,
    age: calculateAge(profile?.birthDate ?? null),
    disability: profile?.disability ?? null,
    careLevel: profile?.careLevel ?? null,
    phone: profile?.phone ?? null,
    notes: profile?.notes ?? null,
    emergencyContactName: profile?.emergencyContactName ?? null,
    emergencyContactRelation: profile?.emergencyContactRelation ?? null,
    emergencyContactPhone: profile?.emergencyContactPhone ?? null,
    address: primaryAddress
      ? {
          postalCode: primaryAddress.postalCode ?? null,
          prefecture: primaryAddress.prefecture ?? null,
          city: primaryAddress.city ?? null,
          street: primaryAddress.street ?? null,
          building: primaryAddress.building ?? null,
        }
      : null,
  }
}

export default async function NewHearingMemoPage({ params }: NewHearingMemoPageProps) {
  const { id } = await params
  const session = await requireRealm('supporter')
  const supporter = await getSupporterByUserId(session.user.id)

  if (!supporter) {
    throw new Error('サポーター情報が見つかりません')
  }

  const client = await getClientById(id, supporter.tenantId)
  if (!client || !client.profile) {
    notFound()
  }

  const defaultDate = new Date().toISOString().split('T')[0]!
  const summarySections = createDefaultSummarySections()
  const clientSnapshot = toClientSnapshot(client)
  const backHref = `/supporters/clients/${id}/hearing`

  async function createHearingMemoAction(
    _prevState: CreateHearingFormState,
    formData: FormData,
  ): Promise<CreateHearingFormState> {
    'use server'
    const session = await requireRealm('supporter')
    const currentSupporter = await getSupporterByUserId(session.user.id)
    if (!currentSupporter) {
      return { status: 'error', message: 'サポーター情報が見つかりません' }
    }

    const formInput = CreateFormSchema.safeParse({
      title: formData.get('title'),
      date: formData.get('date'),
      summary: formData.get('summary'),
      transcriptions: formData.get('transcriptions'),
    })

    if (!formInput.success) {
      const message =
        formInput.error.issues[0]?.message ?? '入力内容の検証に失敗しました。再度お試しください。'
      return { status: 'error', message }
    }

    const { title, date, summary, transcriptions } = formInput.data

    const hearingDate = new Date(date)
    if (Number.isNaN(hearingDate.getTime())) {
      return { status: 'error', message: '実施日の形式が不正です' }
    }

    let summaryItems: Array<z.infer<typeof SummarySectionPayloadSchema>> = []
    if (summary) {
      let parsedSummary: unknown
      try {
        parsedSummary = JSON.parse(summary)
      } catch {
        return { status: 'error', message: '要約データの読み込みに失敗しました' }
      }
      const summaryResult = SummarySectionPayloadSchema.array().safeParse(parsedSummary)
      if (!summaryResult.success) {
        return { status: 'error', message: '要約データの形式が不正です' }
      }
      summaryItems = summaryResult.data
    }

    let transcriptionItems: Array<{ text: string; timestamp: Date }> = []
    if (transcriptions) {
      let parsedTranscriptions: unknown
      try {
        parsedTranscriptions = JSON.parse(transcriptions)
      } catch {
        return { status: 'error', message: '文字起こしデータの読み込みに失敗しました' }
      }

      const transcriptionsResult =
        TranscriptionPayloadSchema.array().safeParse(parsedTranscriptions)
      if (!transcriptionsResult.success) {
        return { status: 'error', message: '文字起こしデータの形式が不正です' }
      }

      try {
        transcriptionItems = transcriptionsResult.data.map((item) => {
          const timestamp = new Date(item.timestamp)
          if (Number.isNaN(timestamp.getTime())) {
            throw new Error('INVALID_TIMESTAMP')
          }
          return { text: item.text, timestamp }
        })
      } catch {
        return { status: 'error', message: '文字起こしの時刻が不正です' }
      }
    }

    const structuredContent = summaryItems
      .map((section) => {
        const heading = section.title.trim()
        const body = (section.content ?? '').trim()
        if (!heading && !body) {
          return null
        }
        if (!body) {
          return heading
        }
        return `${heading}\n${body}`
      })
      .filter(Boolean)
      .join('\n\n')

    const creationResult = await createHearingMemo({
      clientId: id,
      supporterId: currentSupporter.id,
      date: hearingDate,
      title,
    })

    if ('type' in creationResult) {
      return { status: 'error', message: creationResult.message }
    }

    if (structuredContent) {
      const contentResult = await updateHearingMemoContent(creationResult.id, structuredContent)
      if ('type' in contentResult) {
        return { status: 'error', message: contentResult.message }
      }
    }

    if (transcriptionItems.length > 0) {
      const transcriptResult = await updateHearingTranscripts(creationResult.id, transcriptionItems)
      if ('type' in transcriptResult) {
        return { status: 'error', message: transcriptResult.message }
      }
    }

    redirect(`/supporters/clients/${id}/hearing/${creationResult.id}`)
  }

  return (
    <HearingNewShell
      client={clientSnapshot}
      supporterName={supporter.profile?.name ?? null}
      defaultDate={defaultDate}
      initialTitle={`${defaultDate} ${client.profile?.name ?? ''}`}
      initialSummary={summarySections}
      createAction={createHearingMemoAction}
      initialFormState={INITIAL_FORM_STATE}
      backHref={backHref}
    />
  )
}
