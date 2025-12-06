import Link from 'next/link'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { requireRealm } from '@/features/auth/helpers'
import { getFacilityByStaffUserId } from '@/features/facility/infra/query/facility-query'
import { getInquiriesByFacilityId } from '@/features/inquiry/infra/query/inquiry-query'

export default async function InquiriesPage() {
  const session = await requireRealm('facility_staff', '/login')

  const facility = await getFacilityByStaffUserId(session.user.id)
  if (!facility) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>施設情報が登録されていません。管理者にお問い合わせください。</AlertDescription>
        </Alert>
      </div>
    )
  }

  const inquiries = await getInquiriesByFacilityId(facility.id)

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">照会一覧</h1>
        <p className="text-muted-foreground">相談員からの照会を確認できます</p>
      </div>

      <div className="mb-4">
        <Button asChild variant="ghost">
          <Link href="/facility">← ダッシュボードに戻る</Link>
        </Button>
      </div>

      {inquiries.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">照会はまだありません</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>照会履歴</CardTitle>
            <CardDescription>{inquiries.length}件の照会があります</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>状態</TableHead>
                    <TableHead>照会日時</TableHead>
                    <TableHead>利用者名</TableHead>
                    <TableHead>支援事業所</TableHead>
                    <TableHead>メッセージ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inquiries.map((inquiry) => (
                    <TableRow key={inquiry.id}>
                      <TableCell>
                        {inquiry.status === 'sent' ? (
                          <Badge variant="destructive">新着</Badge>
                        ) : inquiry.status === 'replied' ? (
                          <Badge variant="secondary">返信済</Badge>
                        ) : (
                          <Badge variant="outline">完了</Badge>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {new Intl.DateTimeFormat('ja-JP', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        }).format(inquiry.createdAt)}
                      </TableCell>
                      <TableCell>{inquiry.clientName}</TableCell>
                      <TableCell>{inquiry.tenantName}</TableCell>
                      <TableCell>
                        {inquiry.message ? (
                          <p className="truncate max-w-xs">{inquiry.message}</p>
                        ) : (
                          <span className="text-muted-foreground">メッセージなし</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>📌 今後の機能追加予定</CardTitle>
          <CardDescription>開発中の機能</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• 照会への返信機能</li>
            <li>• 詳細情報の表示</li>
            <li>• メッセージのやり取り履歴</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
