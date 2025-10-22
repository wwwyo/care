import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { getHearingMemosByClient } from '@/infra/query/hearing-memo'
import { requireRealm } from '@/lib/auth/helpers'
import { prisma } from '@/lib/prisma'
import { PlanUpdateForm } from './plan-update-form'

type Props = {
  params: Promise<{
    id: string
    versionId: string
  }>
}

export default async function EditPlanPage({ params }: Props) {
  const { id: clientId, versionId } = await params
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

  // バージョンから計画書を取得
  const planVersion = await prisma.planVersion.findUnique({
    where: { id: versionId },
    include: {
      plan: {
        include: {
          client: {
            include: {
              profile: true,
            },
          },
          versions: {
            orderBy: { versionNumber: 'desc' },
            include: {
              services: true,
            },
          },
          consents: {
            include: {
              grants: true,
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      },
      services: true,
    },
  })

  if (!planVersion || planVersion.plan.clientId !== clientId) {
    notFound()
  }

  const plan = planVersion.plan
  const latestVersion = planVersion

  // ヒアリングメモを取得
  const hearingMemos = await getHearingMemosByClient(clientId)

  // 同意状態を取得
  const hasConsent = plan.consents && plan.consents.length > 0
  const latestConsent = hasConsent ? plan.consents[0] : null

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
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
        <Button asChild variant="secondary">
          <a href={`/api/plans/${plan.id}/download?versionId=${latestVersion.id}`}>
            Excelでダウンロード
          </a>
        </Button>
      </div>

      <PlanUpdateForm
        planId={plan.id}
        versionId={latestVersion.id}
        clientId={clientId}
        supporterId={supporter.id}
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
