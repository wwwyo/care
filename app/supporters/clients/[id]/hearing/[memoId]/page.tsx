import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { getHearingMemo } from '@/infra/query/hearing-memo'
import { getSupporterByUserId } from '@/infra/query/supporter-query'
import { requireRealm } from '@/lib/auth/helpers'
import { saveDocument, saveTranscription } from './actions'
import { MemoContainer } from './memo-container'
import { TitleEditor } from './title-editor'

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

  // transcriptsのデータを整形
  const transcription = memo.transcripts.map((t) => ({
    text: t.content,
    timestamp: new Date(t.timestamp.toNumber() * 1000), // 秒からミリ秒に変換
  }))

  const boundSaveDocument = saveDocument.bind(null, memoId)
  const boundSaveTranscription = saveTranscription.bind(null, memoId)

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center gap-4 mb-6">
        <Button asChild variant="ghost" size="icon">
          <Link href={`/supporters/clients/${clientId}/hearing`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <TitleEditor initialTitle={memo.title} memoId={memoId} />
          <p className="text-muted-foreground">
            {new Date(memo.date).toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
            {memo.client?.profile?.name && ` ・ 利用者: ${memo.client.profile.name}`}
            {memo.supporter?.profile?.name && ` ・ 担当: ${memo.supporter.profile.name}`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MemoContainer
          initialDocument={memo.content}
          initialTranscription={transcription}
          onSaveDocument={boundSaveDocument}
          onSaveTranscription={boundSaveTranscription}
        />
      </div>
    </div>
  )
}
