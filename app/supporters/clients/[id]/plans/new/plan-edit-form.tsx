'use client'

import { AlertCircle } from 'lucide-react'
import Form from 'next/form'
import { useRouter, useSearchParams } from 'next/navigation'
import { useActionState, useCallback, useState } from 'react'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import type { getHearingMemosByClient } from '@/infra/query/hearing-memo'
import { PlanServiceForm, type ServiceFormData } from '../[versionId]/edit/plan-service-form'
import { generatePlanFromHearingMemos } from '../ai-actions'
import { FacilityDetailPane } from '../components/facility-detail-pane'
import { HearingMemoSelector } from '../components/hearing-memo-selector'
import { createPlanAction } from './actions'

type Props = {
  clientId: string
  supporterId: string
  hearingMemos: Awaited<ReturnType<typeof getHearingMemosByClient>>
}

export function PlanEditForm({ clientId, supporterId, hearingMemos }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [state, formAction, isPending] = useActionState(createPlanAction, {
    error: null,
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedData, setGeneratedData] = useState<{
    desiredLife: string
    troubles: string
    considerations: string
    services: ServiceFormData[]
  } | null>(null)

  const handleAIGenerate = useCallback(async (selectedMemoIds: string[]) => {
    setIsGenerating(true)
    try {
      const result = await generatePlanFromHearingMemos(selectedMemoIds)
      if ('success' in result && result.success) {
        setGeneratedData(result.data)
        toast.success('AIが計画書を生成しました')
      } else if ('type' in result) {
        toast.error(result.message)
      }
    } catch (_error) {
      toast.error('生成中にエラーが発生しました')
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const handleShowFacilityDetail = useCallback(
    (facilityId: string | null) => {
      const params = new URLSearchParams(searchParams)
      if (facilityId) {
        params.set('facilityId', facilityId)
      } else {
        params.delete('facilityId')
      }
      router.replace(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams],
  )

  // URLパラメータからfacilityIdを取得
  const facilityId = searchParams.get('facilityId')

  // 施設詳細が表示されている場合は2カラムレイアウト
  if (facilityId) {
    return (
      <div className="h-[calc(100vh-4rem)] flex">
        {/* 左カラム: フォーム (2/3) */}
        <div className="flex-1 overflow-y-auto border-r">
          <div className="p-6 space-y-6">
            {/* AI生成セクション */}
            {hearingMemos.length > 0 && (
              <HearingMemoSelector
                hearingMemos={hearingMemos}
                onGenerate={handleAIGenerate}
                isGenerating={isGenerating}
              />
            )}

            <Form action={formAction} className="space-y-6">
              <input type="hidden" name="clientId" value={clientId} />

              {state.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{state.error}</AlertDescription>
                </Alert>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>1. 利用者及びその家族の生活に対する意向（希望する生活）</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    name="desiredLife"
                    placeholder="どのような生活を希望されていますか？"
                    className="min-h-[120px]"
                    defaultValue={generatedData?.desiredLife || state.formData?.desiredLife}
                    key={generatedData?.desiredLife ? 'generated-desired' : 'default-desired'}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>2. 困っていること</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    name="troubles"
                    placeholder="現在困っていることは何ですか？"
                    className="min-h-[120px]"
                    defaultValue={generatedData?.troubles || state.formData?.troubles}
                    key={generatedData?.troubles ? 'generated-troubles' : 'default-troubles'}
                  />
                </CardContent>
              </Card>

              <PlanServiceForm
                initialServices={
                  generatedData?.services && Array.isArray(generatedData.services)
                    ? generatedData.services
                    : []
                }
                disabled={false}
                onShowFacilityDetail={handleShowFacilityDetail}
                key={generatedData?.services ? 'generated-services' : 'default-services'}
              />

              <Card>
                <CardHeader>
                  <CardTitle>4. サービス提供事業者に配慮してほしいこと</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    name="considerations"
                    placeholder="移動支援、設備要件、医療的ケア、食事要件など、配慮が必要な事項を記入してください"
                    className="min-h-[120px]"
                    defaultValue={generatedData?.considerations || state.formData?.considerations}
                    key={
                      generatedData?.considerations
                        ? 'generated-considerations'
                        : 'default-considerations'
                    }
                  />
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.history.back()}
                  disabled={isPending}
                >
                  キャンセル
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? '保存中...' : '下書き保存'}
                </Button>
              </div>
            </Form>
          </div>
        </div>

        {/* 右カラム: 施設詳細 (1/3) */}
        <div className="w-[500px]">
          <FacilityDetailPane
            facilityId={facilityId}
            supporterId={supporterId}
            clientId={clientId}
            planId={null}
            onClose={() => handleShowFacilityDetail(null)}
          />
        </div>
      </div>
    )
  }

  // 通常のレイアウト
  return (
    <div className="space-y-6">
      {/* AI生成セクション */}
      {hearingMemos.length > 0 && (
        <HearingMemoSelector
          hearingMemos={hearingMemos}
          onGenerate={handleAIGenerate}
          isGenerating={isGenerating}
        />
      )}

      <Form action={formAction} className="space-y-6">
        <input type="hidden" name="clientId" value={clientId} />

        {state.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>1. 利用者及びその家族の生活に対する意向（希望する生活）</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              name="desiredLife"
              placeholder="どのような生活を希望されていますか？"
              className="min-h-[120px]"
              defaultValue={generatedData?.desiredLife || state.formData?.desiredLife}
              key={generatedData?.desiredLife ? 'generated-desired' : 'default-desired'}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. 困っていること</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              name="troubles"
              placeholder="現在困っていることは何ですか？"
              className="min-h-[120px]"
              defaultValue={generatedData?.troubles || state.formData?.troubles}
              key={generatedData?.troubles ? 'generated-troubles' : 'default-troubles'}
            />
          </CardContent>
        </Card>

        <PlanServiceForm
          initialServices={
            generatedData?.services && Array.isArray(generatedData.services)
              ? generatedData.services
              : []
          }
          disabled={false}
          onShowFacilityDetail={handleShowFacilityDetail}
          key={generatedData?.services ? 'generated-services' : 'default-services'}
        />

        <Card>
          <CardHeader>
            <CardTitle>4. サービス提供事業者に配慮してほしいこと</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              name="considerations"
              placeholder="移動支援、設備要件、医療的ケア、食事要件など、配慮が必要な事項を記入してください"
              className="min-h-[120px]"
              defaultValue={generatedData?.considerations || state.formData?.considerations}
              key={
                generatedData?.considerations
                  ? 'generated-considerations'
                  : 'default-considerations'
              }
            />
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
            disabled={isPending}
          >
            キャンセル
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? '保存中...' : '下書き保存'}
          </Button>
        </div>
      </Form>
    </div>
  )
}
