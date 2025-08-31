import { notFound } from 'next/navigation'
import { getHearingMemosByClient } from '@/infra/query/hearing-memo'
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

  // ヒアリングメモを取得
  const hearingMemos = await getHearingMemosByClient(clientId)

  // 同意状態を取得
  const hasConsent = plan.consents && plan.consents.length > 0
  const latestConsent = hasConsent ? plan.consents[0] : null

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">サービス等利用計画書 編集</h1>
        <p className="text-muted-foreground mt-1">
          {plan.client.profile?.name} 様 - バージョン {latestVersion.versionNumber}
          {hasConsent && (
            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              同意済み
            </span>
          )}
        </p>
        {latestConsent?.grants?.[0] && (
          <p className="text-xs text-muted-foreground mt-1">
            同意日: {new Date(latestConsent.grants[0].grantedAt).toLocaleDateString('ja-JP')}
          </p>
        )}
      </div>

      <PlanUpdateForm
        planId={planId}
        versionId={latestVersion.id}
        clientId={clientId}
        initialData={{
          desiredLife: latestVersion.desiredLife || '',
          troubles: latestVersion.troubles || '',
          considerations: latestVersion.considerations || '',
          services:
            latestVersion.services?.map((s) => ({
              id: s.id,
              serviceCategory: s.serviceCategory,
              serviceType: s.serviceType,
              desiredAmount: s.desiredAmount || '',
              desiredLifeByService: s.desiredLifeByService || '',
              achievementPeriod: s.achievementPeriod || '',
            })) || [],
        }}
        isPublished={latestVersion.versionType === 'published'}
        hearingMemos={hearingMemos}
      />
    </div>
  )
}
