import { AlertCircle, ArrowLeft, Edit, MapPin, Phone, User } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getClientById } from '@/infra/query/client-query'
import { getSupporterByUserId } from '@/infra/query/supporter-query'
import { requireRealm } from '@/lib/auth/helpers'

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

  const client = await getClientById(id, supporter.tenantId)

  if (!client) {
    notFound()
  }

  const data = client.toData()
  const age = new Date().getFullYear() - data.birthDate.getFullYear()

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
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
                <p className="text-lg font-medium">{data.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">生年月日</p>
                <p className="text-lg font-medium">
                  {data.birthDate.toLocaleDateString('ja-JP')} ({age}歳)
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">性別</p>
                <p className="text-lg font-medium">
                  {data.gender === 'male' ? '男性' : data.gender === 'female' ? '女性' : 'その他'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">電話番号</p>
                <p className="text-lg font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {data.phoneNumber}
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
              {data.address.postalCode && (
                <p className="text-sm text-muted-foreground">〒{data.address.postalCode}</p>
              )}
              <p className="text-lg">
                {data.address.prefecture}
                {data.address.city}
                {data.address.street}
              </p>
              {data.address.building && <p className="text-lg">{data.address.building}</p>}
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
              <p className="text-lg font-medium">{data.disability || '未記入'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">障害支援区分</p>
              <p className="text-lg font-medium">{data.careLevel || '未記入'}</p>
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
                <p className="text-lg font-medium">{data.emergencyContact.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">続柄</p>
                <p className="text-lg font-medium">{data.emergencyContact.relationship}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">電話番号</p>
                <p className="text-lg font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {data.emergencyContact.phoneNumber}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 備考 */}
        {data.notes && (
          <Card>
            <CardHeader>
              <CardTitle>備考</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{data.notes}</p>
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
              <span className="font-mono">{data.id}</span>
            </div>
            <div className="flex justify-between">
              <span>登録日時</span>
              <span>{data.createdAt.toLocaleString('ja-JP')}</span>
            </div>
            <div className="flex justify-between">
              <span>最終更新日時</span>
              <span>{data.updatedAt.toLocaleString('ja-JP')}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
