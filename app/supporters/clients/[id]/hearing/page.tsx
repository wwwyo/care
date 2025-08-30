import { ArrowLeft, NotebookPen, Plus } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getClientById } from '@/infra/query/client-query'
import { getHearingMemosByClient } from '@/infra/query/hearing-memo'
import { getSupporterByUserId } from '@/infra/query/supporter-query'
import { requireRealm } from '@/lib/auth/helpers'

interface HearingMemoListPageProps {
  params: Promise<{ id: string }>
}

export default async function HearingMemoListPage({ params }: HearingMemoListPageProps) {
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

  const hearingMemos = await getHearingMemosByClient(id)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button asChild variant="ghost" size="icon">
          <Link href={`/supporters/clients/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{client.profile.name}さんのヒアリングメモ</h1>
        </div>
        <Button asChild>
          <Link href={`/supporters/clients/${id}/hearing/new`}>
            <Plus className="mr-2 h-4 w-4" />
            新規作成
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <NotebookPen className="h-5 w-5" />
            ヒアリングメモ一覧
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hearingMemos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">ヒアリングメモはまだ作成されていません</p>
              <Button asChild>
                <Link href={`/supporters/clients/${id}/hearing/new`}>
                  <Plus className="mr-2 h-4 w-4" />
                  最初のメモを作成
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {hearingMemos.map((memo) => {
                let content: {
                  document?: string
                  structured?: { summary?: string }
                } = {}

                try {
                  content = JSON.parse(memo.content)
                } catch {
                  // パースエラーの場合は空オブジェクトとして扱う
                  content = {}
                }

                const hasDocument = content?.document && content.document.length > 0
                const summary = content?.structured?.summary || ''

                return (
                  <div
                    key={memo.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{memo.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {new Date(memo.date).toLocaleDateString('ja-JP', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                          ・担当: {memo.supporter.profile?.name || '担当者未設定'}
                        </p>
                        {summary && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{summary}</p>
                        )}
                        {!hasDocument && (
                          <p className="text-sm text-orange-600 mt-2">内容が未入力です</p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/supporters/clients/${id}/hearing/${memo.id}`}>
                            {hasDocument ? '表示' : '入力'}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
