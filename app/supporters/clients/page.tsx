import Link from 'next/link'
import { Plus, User } from '@/components/icon'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { requireRealm } from '@/features/auth/helpers'
import { getAllClients } from '@/features/client/infra/client-query'
import { getSupporterByUserId } from '@/features/supporter/infra/query/supporter-query'
import { calculateAge } from '@/lib/age-calculator'

export default async function ClientsPage() {
  const session = await requireRealm('supporter')
  const supporter = await getSupporterByUserId(session.user.id)

  if (!supporter) {
    throw new Error('サポーター情報が見つかりません')
  }

  const clientRecords = await getAllClients(supporter.tenantId)

  return (
    <div className="max-w-7xl  lg:px-8 px-6 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">利用者一覧</h1>
          <p className="text-muted-foreground mt-2">サービス利用者の情報を管理します</p>
        </div>
        <Button asChild>
          <Link href="/supporters/clients/new">
            <Plus className="mr-2 h-4 w-4" />
            新規登録
          </Link>
        </Button>
      </div>

      {clientRecords.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">利用者が登録されていません</p>
            <p className="text-sm text-muted-foreground mt-2">新規登録ボタンから最初の利用者を登録してください</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clientRecords.map((record) => {
            if (!record.profile) return null
            const profile = record.profile
            const address = record.addresses[0]
            const genderLabel =
              profile.gender === 'male'
                ? '男性'
                : profile.gender === 'female'
                  ? '女性'
                  : profile.gender === 'other'
                    ? 'その他'
                    : '未設定'
            return (
              <Card key={record.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      {profile.nameKana && (
                        <span className="text-sm font-normal text-muted-foreground">{profile.nameKana}</span>
                      )}
                      <span>{profile.name}</span>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    {genderLabel} ・ {profile.birthDate ? `${calculateAge(profile.birthDate)}歳` : '年齢未定義'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start">
                      <span className="font-medium w-24">住所:</span>
                      <span className="flex-1">
                        {address ? `${address.prefecture || ''}${address.city || ''}${address.street || ''}` : '未登録'}
                      </span>
                    </div>
                    <div className="flex items-start">
                      <span className="font-medium w-24">生年月日:</span>
                      <span className="flex-1">
                        {profile.birthDate
                          ? new Date(profile.birthDate).toLocaleDateString('ja-JP', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : '未登録'}
                      </span>
                    </div>
                    <div className="flex items-start">
                      <span className="font-medium w-24">電話番号:</span>
                      <span className="flex-1">{profile.phone || '未登録'}</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link href={`/supporters/clients/${record.id}`}>詳細を見る</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
