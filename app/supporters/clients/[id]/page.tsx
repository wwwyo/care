import {
  AlertCircle,
  ArrowLeft,
  ClipboardList,
  Edit,
  FileText,
  MapPin,
  Mic,
  Phone,
  Plus,
  User,
} from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getClientById } from '@/infra/query/client-query'
import { getHearingMemosByClient } from '@/infra/query/hearing-memo'
import { getPlanByClientId } from '@/infra/query/plan-query'
import { getSupporterByUserId } from '@/infra/query/supporter-query'
import { requireRealm } from '@/lib/auth/helpers'
import { calculateAge } from '@/lib/utils/age-calculator'

interface ClientDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { id } = await params
  const session = await requireRealm('supporter')
  const supporter = await getSupporterByUserId(session.user.id)

  if (!supporter) {
    throw new Error('サポーター情報が見つかりません')
  }

  const clientRecord = await getClientById(id, supporter.tenantId)

  if (!clientRecord || !clientRecord.profile || !clientRecord.addresses[0]) {
    notFound()
  }

  const profile = clientRecord.profile
  const address = clientRecord.addresses[0]
  const age = profile.birthDate ? calculateAge(profile.birthDate) : undefined

  // 計画書を取得
  const plan = await getPlanByClientId(id)

  // ヒアリングメモを取得（最新3件）
  const hearingMemos = await getHearingMemosByClient(id)

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button asChild variant="ghost" size="icon">
          <Link href="/supporters/clients">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">利用者詳細</h1>
        </div>
        <Button asChild>
          <Link href={`/supporters/clients/${id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            編集
          </Link>
        </Button>
      </div>

      <div className="space-y-6">
        {/* ヒアリングメモ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                ヒアリングメモ
              </span>
              <Button asChild size="sm">
                <Link href={`/supporters/clients/${id}/hearing/new`}>
                  <Plus className="mr-2 h-4 w-4" />
                  新規メモ
                </Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hearingMemos.length === 0 ? (
              <p className="text-muted-foreground">
                まだヒアリングメモがありません。音声認識機能を使って記録を始めましょう。
              </p>
            ) : (
              <div className="space-y-3">
                {hearingMemos.slice(0, 3).map((memo) => (
                  <Link
                    key={memo.id}
                    href={`/supporters/clients/${id}/hearing/${memo.id}`}
                    className="block p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{memo.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(memo.date).toLocaleDateString('ja-JP')}
                        </p>
                        {memo.content && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {memo.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
                {hearingMemos.length > 3 && (
                  <div className="pt-2 border-t">
                    <Link
                      href={`/supporters/clients/${id}/hearing`}
                      className="text-sm text-primary hover:underline"
                    >
                      すべてのメモを見る ({hearingMemos.length}件)
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 計画書 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                サービス等利用計画書
              </span>
              <Button asChild size="sm">
                <Link href={`/supporters/clients/${id}/plans/new`}>
                  <Plus className="mr-2 h-4 w-4" />
                  {plan ? '新バージョン作成' : '新規作成'}
                </Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!plan ? (
              <p className="text-muted-foreground">計画書はまだ作成されていません</p>
            ) : (
              <div className="space-y-2">
                {plan.versions.map((version) => (
                  <div
                    key={version.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">バージョン {version.versionNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {version.versionType === 'published' ? '確定版' : '下書き'} ・ 作成日:{' '}
                        {new Date(version.createdAt).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/supporters/clients/${id}/plans/${version.id}/edit`}>
                          編集
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/supporters/clients/${id}/plans/${version.id}/record`}>
                          <Mic className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 基本情報 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              基本情報
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">氏名</p>
                <p className="text-lg font-medium">{profile.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">生年月日</p>
                <p className="text-lg font-medium">
                  {profile.birthDate
                    ? `${profile.birthDate.toLocaleDateString('ja-JP')} (${age}歳)`
                    : '未定義'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">性別</p>
                <p className="text-lg font-medium">
                  {profile.gender === 'male'
                    ? '男性'
                    : profile.gender === 'female'
                      ? '女性'
                      : 'その他'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">電話番号</p>
                <p className="text-lg font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {profile.phone || '未登録'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 住所 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              住所
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {address.postalCode && (
                <p className="text-sm text-muted-foreground">〒{address.postalCode}</p>
              )}
              <p className="text-lg">
                {address.prefecture || ''}
                {address.city || ''}
                {address.street || ''}
              </p>
              {address.building && <p className="text-lg">{address.building}</p>}
            </div>
          </CardContent>
        </Card>

        {/* 支援情報 */}
        <Card>
          <CardHeader>
            <CardTitle>支援情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">障害</p>
              <p className="text-lg font-medium">{profile.disability || '未記入'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">障害支援区分</p>
              <p className="text-lg font-medium">{profile.careLevel || '未記入'}</p>
            </div>
          </CardContent>
        </Card>

        {/* 緊急連絡先 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              緊急連絡先
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">氏名</p>
                <p className="text-lg font-medium">{profile.emergencyContactName || '未登録'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">続柄</p>
                <p className="text-lg font-medium">
                  {profile.emergencyContactRelation || '未登録'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">電話番号</p>
                <p className="text-lg font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {profile.emergencyContactPhone || '未登録'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 備考 */}
        {profile.notes && (
          <Card>
            <CardHeader>
              <CardTitle>備考</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{profile.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* メタ情報 */}
        <Card>
          <CardHeader>
            <CardTitle>システム情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>利用者ID</span>
              <span className="font-mono">{clientRecord.id}</span>
            </div>
            <div className="flex justify-between">
              <span>登録日時</span>
              <span>{clientRecord.createdAt.toLocaleString('ja-JP')}</span>
            </div>
            <div className="flex justify-between">
              <span>最終更新日時</span>
              <span>{clientRecord.updatedAt.toLocaleString('ja-JP')}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
