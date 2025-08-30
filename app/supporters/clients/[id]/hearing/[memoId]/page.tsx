import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { getHearingMemo } from '@/infra/query/hearing-memo'
import { getSupporterByUserId } from '@/infra/query/supporter-query'
import { requireRealm } from '@/lib/auth/helpers'
import { saveDocument, saveTranscription } from './actions'
import { MemoContainer } from './memo-container'

// contentの型定義
const ContentSchema = z.object({
  document: z.string().optional().default(''),
  transcription: z
    .array(
      z.object({
        text: z.string(),
        timestamp: z
          .union([z.string(), z.date()])
          .transform((val) => (typeof val === 'string' ? new Date(val) : val)),
      }),
    )
    .optional()
    .default([]),
})

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

  // contentをパースして型安全にする（エラーハンドリング付き）
  let content: z.infer<typeof ContentSchema>
  try {
    const parsedContent = typeof memo.content === 'string' ? JSON.parse(memo.content) : memo.content
    const parseResult = ContentSchema.safeParse(parsedContent)
    content = parseResult.success
      ? parseResult.data
      : {
          document: '',
          transcription: [],
        }
  } catch (error) {
    console.error('Failed to parse content:', error)
    content = {
      document: '',
      transcription: [],
    }
  }

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
          <h1 className="text-3xl font-bold">{memo.title}</h1>
          <p className="text-muted-foreground">
            {new Date(memo.date).toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
            {memo.supporter?.profile?.name && ` ・ 担当: ${memo.supporter.profile.name}`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MemoContainer
          initialDocument={content?.document || ''}
          initialTranscription={content?.transcription || []}
          onSaveDocument={boundSaveDocument}
          onSaveTranscription={boundSaveTranscription}
        />
      </div>
    </div>
  )
}
