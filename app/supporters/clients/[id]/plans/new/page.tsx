import { notFound } from 'next/navigation'
import { requireRealm } from '@/lib/auth/helpers'
import { prisma } from '@/lib/prisma'
import { PlanEditForm } from './plan-edit-form'

type Props = {
  params: Promise<{
    id: string
  }>
}

export default async function NewPlanPage({ params }: Props) {
  const { id: clientId } = await params
  const session = await requireRealm('supporter')

  // サポーター情報を取得
  const supporter = await prisma.supporter.findFirst({
    where: {
      userId: session.user.id,
    },
  })

  if (!supporter) {
    notFound()
  }

  // クライアント情報を取得
  const client = await prisma.client.findUnique({
    where: {
      id: clientId,
    },
    include: {
      profile: true,
    },
  })

  if (!client || client.tenantId !== supporter.tenantId) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">サービス等利用計画書 新規作成</h1>
        <p className="text-muted-foreground mt-1">{client.profile?.name} 様</p>
      </div>

      <PlanEditForm clientId={clientId} supporterId={supporter.id} tenantId={supporter.tenantId} />
    </div>
  )
}
