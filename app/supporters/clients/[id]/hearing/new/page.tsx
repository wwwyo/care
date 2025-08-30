import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getClientById } from '@/infra/query/client-query'
import { getSupporterByUserId } from '@/infra/query/supporter-query'
import { requireRealm } from '@/lib/auth/helpers'
import { createHearingMemo } from '@/uc/hearing/create-memo'

interface NewHearingMemoPageProps {
  params: Promise<{ id: string }>
}

export default async function NewHearingMemoPage({ params }: NewHearingMemoPageProps) {
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

  async function createMemo(formData: FormData) {
    'use server'
    const session = await requireRealm('supporter')
    const supporter = await getSupporterByUserId(session.user.id)

    if (!supporter) {
      throw new Error('サポーター情報が見つかりません')
    }

    const title = formData.get('title') as string
    const dateStr = formData.get('date') as string

    if (!title || !dateStr) {
      throw new Error('必須項目を入力してください')
    }

    const result = await createHearingMemo({
      clientId: id,
      supporterId: supporter.id,
      date: new Date(dateStr),
      title,
    })

    if ('type' in result) {
      throw new Error(result.message)
    }

    redirect(`/supporters/clients/${id}/hearing/${result.id}`)
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Button asChild variant="ghost" size="icon">
          <Link href={`/supporters/clients/${id}/hearing`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">新規ヒアリングメモ</h1>
          <p className="text-muted-foreground">対象: {client.profile.name}さん</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createMemo} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">タイトル *</Label>
              <Input
                id="title"
                name="title"
                type="text"
                placeholder="例: 初回面談、定期面談など"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">実施日 *</Label>
              <Input id="date" name="date" type="date" defaultValue={today} required />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1">
                作成してメモを開始
              </Button>
              <Button asChild variant="outline">
                <Link href={`/supporters/clients/${id}/hearing`}>キャンセル</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
