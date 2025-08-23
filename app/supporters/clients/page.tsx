import { Plus, User } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getAllClients } from '@/infra/query/client-query'
import { getSupporterByUserId } from '@/infra/query/supporter-query'
import { requireRealm } from '@/lib/auth/helpers'
import { calculateAge } from '@/lib/utils/age-calculator'

export default async function ClientsPage() {
  const session = await requireRealm('supporter')
  const supporter = await getSupporterByUserId(session.user.id)

  if (!supporter) {
    throw new Error('サポーター情報が見つかりません')
  }

  const clientRecords = await getAllClients(supporter.tenantId)

  return (
    <div className="container mx-auto px-4 py-8">
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
            <p className="text-sm text-muted-foreground mt-2">
              新規登録ボタンから最初の利用者を登録してください
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clientRecords.map((record) => {
            if (!record.profile || !record.addresses[0]) return null
            const profile = record.profile
            const address = record.addresses[0]
            return (
              <Card key={record.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{profile.name}</span>
                    <span className="text-sm font-normal bg-primary/10 text-primary px-2 py-1 rounded">
                      {profile.careLevel || '未記入'}
                    </span>
                  </CardTitle>
                  <CardDescription>
                    {profile.gender === 'male'
                      ? '男性'
                      : profile.gender === 'female'
                        ? '女性'
                        : 'その他'}{' '}
                    ・ {profile.birthDate ? `${calculateAge(profile.birthDate)}歳` : '年齢未定義'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start">
                      <span className="font-medium w-20">住所:</span>
                      <span className="flex-1">
                        {address.prefecture || ''}
                        {address.city || ''}
                        {address.street || ''}
                      </span>
                    </div>
                    <div className="flex items-start">
                      <span className="font-medium w-20">電話番号:</span>
                      <span className="flex-1">{profile.phone || '未登録'}</span>
                    </div>
                    <div className="flex items-start">
                      <span className="font-medium w-20">障害:</span>
                      <span className="flex-1">{profile.disability || '未記入'}</span>
                    </div>
                    <div className="flex items-start">
                      <span className="font-medium w-20">緊急連絡先:</span>
                      <span className="flex-1">
                        {profile.emergencyContactName || '未登録'}
                        {profile.emergencyContactRelation &&
                          ` (${profile.emergencyContactRelation})`}
                      </span>
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
