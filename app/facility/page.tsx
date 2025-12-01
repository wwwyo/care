import Link from 'next/link'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { requireRealm } from '@/features/auth/helpers'
import { getFacilityByStaffUserId } from '@/features/facility/infra/query/facility-query'
import { countNewInquiries } from '@/features/inquiry/infra/query/inquiry-query'
import { SlotStatusDisplay } from './slot-status-display'

export default async function FacilityDashboard() {
  const session = await requireRealm('facility_staff', '/login')

  const facility = await getFacilityByStaffUserId(session.user.id)
  if (!facility) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>
            施設情報が登録されていません。管理者にお問い合わせください。
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const newInquiriesCount = await countNewInquiries(facility.id)

  // Prismaのデータ構造から必要な情報を取得
  const mainContact = facility.contacts[0]
  const latestReport = facility.availabilityReports[0]
  const address = facility.location
    ? [facility.location.addressCity, facility.location.addressDetail, facility.location.building]
        .filter(Boolean)
        .join('')
    : null

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{facility.profile?.name || '未設定'}</h1>
        {facility.profile?.nameKana && (
          <p className="text-muted-foreground">{facility.profile.nameKana}</p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {/* 空き状況カード */}
        <Card>
          <CardHeader>
            <CardTitle>現在の空き状況</CardTitle>
            <CardDescription>施設の受入状況を表示</CardDescription>
          </CardHeader>
          <CardContent>
            <SlotStatusDisplay
              status={latestReport?.status ?? null}
              note={latestReport?.note ?? latestReport?.contextSummary ?? null}
              updatedAt={latestReport?.updatedAt ?? null}
            />
            <Button asChild className="w-full mt-4">
              <Link href="/facility/slots">空き状況を更新</Link>
            </Button>
          </CardContent>
        </Card>

        {/* 施設情報カード */}
        <Card>
          <CardHeader>
            <CardTitle>施設情報</CardTitle>
            <CardDescription>基本情報の概要</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-muted-foreground">サービス種別</dt>
                <dd className="font-medium">{facility.services[0]?.serviceType || '未設定'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">電話番号</dt>
                <dd className="font-medium">{mainContact?.phone || '未設定'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">メール</dt>
                <dd className="font-medium break-all">{mainContact?.email || '未設定'}</dd>
              </div>
            </dl>
            <Button asChild variant="secondary" className="w-full mt-4">
              <Link href="/facility/edit">施設情報を編集</Link>
            </Button>
          </CardContent>
        </Card>

        {/* 照会カード */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              照会管理
              {newInquiriesCount > 0 && <Badge variant="destructive">{newInquiriesCount}</Badge>}
            </CardTitle>
            <CardDescription>相談員からの問い合わせ</CardDescription>
          </CardHeader>
          <CardContent>
            {newInquiriesCount > 0 ? (
              <Alert>
                <AlertDescription>新着照会が{newInquiriesCount}件あります</AlertDescription>
              </Alert>
            ) : (
              <p className="text-sm text-muted-foreground">新着照会はありません</p>
            )}
            <Button asChild variant="outline" className="w-full mt-4">
              <Link href="/facility/inquiries">照会一覧を見る</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 施設詳細情報 */}
      <Card>
        <CardHeader>
          <CardTitle>施設詳細</CardTitle>
          <CardDescription>登録されている詳細情報</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 md:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground mb-1">住所</dt>
              <dd className="font-medium">{address || '未設定'}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground mb-1">アクセス</dt>
              <dd className="font-medium">{facility.location?.accessInfo || '未設定'}</dd>
            </div>
            <div className="md:col-span-2">
              <dt className="text-sm text-muted-foreground mb-1">施設紹介</dt>
              <dd className="font-medium whitespace-pre-wrap">
                {facility.profile?.description || '未設定'}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}
