import { notFound } from 'next/navigation'
import { getPlanWithVersions } from '@/infra/query/plan-query'
import { requireRealm } from '@/lib/auth/helpers'
import { prisma } from '@/lib/prisma'
import { PlanUpdateForm } from './plan-update-form'

type Props = {
  params: Promise<{
    id: string
    planId: string
  }>
}

export default async function EditPlanPage({ params }: Props) {
  const { id: clientId, planId } = await params
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

  // 計画書を取得
  const plan = await getPlanWithVersions(planId)

  if (!plan || plan.clientId !== clientId) {
    notFound()
  }

  // 最新バージョンを取得
  const latestVersion = plan.versions[0]

  if (!latestVersion) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">サービス等利用計画書 編集</h1>
        <p className="text-muted-foreground mt-1">
          {plan.client.profile?.name} 様 - バージョン {latestVersion.versionNumber}
        </p>
      </div>

      <PlanUpdateForm
        planId={planId}
        versionId={latestVersion.id}
        initialData={{
          desiredLife: latestVersion.desiredLife || '',
          troubles: latestVersion.troubles || '',
          considerations: latestVersion.considerations || '',
        }}
        isPublished={latestVersion.versionType === 'published'}
      />
    </div>
  )
}
