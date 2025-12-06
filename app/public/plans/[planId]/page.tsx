import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/prisma'
import { ConsentForm } from './consent-form'

const serviceCategoryLabels: Record<string, string> = {
  home: '居宅サービス',
  residential: '入所・居住系サービス',
  daytime: '日中活動系サービス',
  other: 'その他のサービス',
  child: '児童サービス',
}

export default async function PublicPlanPage({ params }: { params: { planId: string } }) {
  const { planId } = params

  // 計画書を取得（公開されているもののみ）
  const plan = await prisma.plan.findUnique({
    where: {
      id: planId,
      status: 'published', // 確定版のみ表示
    },
    include: {
      client: {
        include: {
          profile: true,
        },
      },
      versions: {
        where: {
          versionType: 'published',
        },
        include: {
          services: true,
        },
        orderBy: {
          versionNumber: 'desc',
        },
        take: 1,
      },
      consents: {
        where: {
          status: 'granted',
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
      },
    },
  })

  if (!plan || plan.versions.length === 0) {
    notFound()
  }

  const currentVersion = plan.versions[0]
  if (!currentVersion) {
    notFound()
  }

  const clientName = plan.client.profile?.name || '利用者'
  const hasExistingConsent = plan.consents.length > 0

  // サービスをカテゴリ別にグループ化
  const servicesByCategory = currentVersion.services.reduce<Record<string, typeof currentVersion.services>>(
    (acc, service) => {
      const category = service.serviceCategory
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(service)
      return acc
    },
    {},
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">サービス等利用計画書</h1>
            <p className="text-gray-600">利用者: {clientName} 様</p>
            <p className="text-sm text-gray-500">
              作成日: {new Date(currentVersion.createdAt).toLocaleDateString('ja-JP')}
            </p>
          </div>
          <Button asChild variant="default">
            <a href={`/api/plans/${planId}/download`}>Excelでダウンロード</a>
          </Button>
        </div>

        {/* 希望する生活 */}
        {currentVersion.desiredLife && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>希望する生活</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{currentVersion.desiredLife}</p>
            </CardContent>
          </Card>
        )}

        {/* 困っていること */}
        {currentVersion.troubles && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>困っていること</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{currentVersion.troubles}</p>
            </CardContent>
          </Card>
        )}

        {/* 利用したいサービス */}
        {Object.keys(servicesByCategory).length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>利用したいサービス</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.entries(servicesByCategory).map(([category, services]) => (
                <div key={category} className="mb-6 last:mb-0">
                  <h3 className="font-semibold mb-3 text-lg">{serviceCategoryLabels[category] || category}</h3>
                  <div className="space-y-4">
                    {services.map((service) => (
                      <div key={service.id} className="border-l-4 border-gray-300 pl-4">
                        <p className="font-medium">{service.serviceType}</p>
                        {service.desiredAmount && (
                          <p className="text-sm text-gray-600 mt-1">希望量: {service.desiredAmount}</p>
                        )}
                        {service.desiredLifeByService && (
                          <p className="text-sm text-gray-600 mt-1">
                            このサービスで望まれる生活: {service.desiredLifeByService}
                          </p>
                        )}
                        {service.achievementPeriod && (
                          <p className="text-sm text-gray-600 mt-1">達成時期: {service.achievementPeriod}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* 配慮してほしいこと */}
        {currentVersion.considerations && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>配慮してほしいこと</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{currentVersion.considerations}</p>
            </CardContent>
          </Card>
        )}

        {/* 同意フォーム */}
        <ConsentForm planId={planId} hasExistingConsent={hasExistingConsent} />

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>この計画書は相談員により作成され、公開されています。</p>
        </div>
      </div>
    </div>
  )
}
