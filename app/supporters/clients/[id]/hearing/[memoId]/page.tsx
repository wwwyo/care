import { notFound } from 'next/navigation'
import { requireRealm } from '@/features/auth/helpers'
import { getHearingMemo } from '@/features/hearing-memo/infra/query/hearing-memo'
import { getSupporterByUserId } from '@/features/supporter/infra/query/supporter-query'
import { saveDocument } from './actions'
import { type ClientSummaryData, HearingDetailShell } from './hearing-detail-shell'

interface HearingMemoDetailPageProps {
  params: Promise<{ id: string; memoId: string }>
}

export default async function HearingMemoDetailPage({ params }: HearingMemoDetailPageProps) {
  const { id: clientId, memoId } = await params
  const session = await requireRealm('supporter')
  const supporter = await getSupporterByUserId(session.user.id)

  if (!supporter) {
    throw new Error('サポーター情報が見つかりません')
  }

  const memo = await getHearingMemo(memoId)
  if (!memo) {
    notFound()
  }

  // transcriptsのデータを整形（Query層で既にDecimal→numberに変換済み）
  const transcription = memo.transcripts.map((t) => ({
    text: t.content,
    timestamp: new Date(t.timestamp * 1000), // 秒からミリ秒に変換
  }))

  const boundSaveDocument = saveDocument.bind(null, memoId)

  const formattedDate = new Date(memo.date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const clientName = memo.client?.profile?.name ?? '利用者'
  const supporterName = memo.supporter?.profile?.name ?? null
  const clientSummary = toClientSummaryData(memo)

  return (
    <HearingDetailShell
      memoId={memoId}
      backHref={`/supporters/clients/${clientId}/hearing`}
      initialTitle={memo.title}
      formattedDate={formattedDate}
      clientName={clientName}
      supporterName={supporterName}
      clientSummary={clientSummary}
      initialDocument={memo.content}
      initialTranscription={transcription}
      onSaveDocument={boundSaveDocument}
    />
  )
}

function toClientSummaryData(memo: Awaited<ReturnType<typeof getHearingMemo>>): ClientSummaryData {
  const profile = memo?.client?.profile

  return {
    nameKana: profile?.nameKana ?? null,
    gender: profile?.gender ?? null,
    birthDate: profile?.birthDate ? profile.birthDate.toISOString() : null,
    age: calculateAge(profile?.birthDate ?? null),
    phone: profile?.phone ?? null,
    disability: profile?.disability ?? null,
    careLevel: profile?.careLevel ?? null,
    notes: profile?.notes ?? null,
    emergencyContactName: profile?.emergencyContactName ?? null,
    emergencyContactRelation: profile?.emergencyContactRelation ?? null,
    emergencyContactPhone: profile?.emergencyContactPhone ?? null,
    address: null,
  }
}

function calculateAge(birthDate: Date | null) {
  if (!birthDate) return null
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1
  }
  return age
}
