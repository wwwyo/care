'use client'

import { AlertCircle, CheckCircle, Copy, Link as LinkIcon } from 'lucide-react'
import Form from 'next/form'
import { useRouter, useSearchParams } from 'next/navigation'
import { useActionState, useCallback, useState } from 'react'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import type { getHearingMemosByClient } from '@/infra/query/hearing-memo'
import { generatePlanFromHearingMemos } from '../../ai-actions'
import { FacilityDetailPane } from '../../components/facility-detail-pane'
import { HearingMemoSelector } from '../../components/hearing-memo-selector'
import { publishPlanAction, updatePlanAction } from './actions'
import { PlanServiceForm, type ServiceFormData } from './plan-service-form'

type Props = {
  planId: string
  versionId: string
  clientId: string
  supporterId: string
  initialData: {
    desiredLife: string
    troubles: string
    considerations: string
    services?: ServiceFormData[]
  }
  isPublished: boolean
  hearingMemos: Awaited<ReturnType<typeof getHearingMemosByClient>>
}

export function PlanUpdateForm({
  planId,
  versionId,
  clientId,
  supporterId,
  initialData,
  isPublished,
  hearingMemos,
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [updateState, updateFormAction, isUpdating] = useActionState(updatePlanAction, {
    error: null,
  })

  const [publishState, publishFormAction, isPublishing] = useActionState(publishPlanAction, {
    error: null,
    success: false,
  })

  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedData, setGeneratedData] = useState<{
    desiredLife: string
    troubles: string
    considerations: string
    services: ServiceFormData[]
  } | null>(null)

  const handleAIGenerate = useCallback(
    async (selectedMemoIds: string[]) => {
      setIsGenerating(true)
      try {
        const result = await generatePlanFromHearingMemos(selectedMemoIds, planId)
        if ('success' in result && result.success) {
          setGeneratedData(result.data)
          toast.success('AIが計画書を更新しました')
        } else if ('type' in result) {
          toast.error(result.message)
        }
      } catch (_error) {
        toast.error('生成中にエラーが発生しました')
      } finally {
        setIsGenerating(false)
      }
    },
    [planId],
  )

  const publicPlanUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/public/plans/${planId}`

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(publicPlanUrl)
    toast.success('リンクをコピーしました')
  }

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
        {/* 左カラム: フォーム */}
        <div className="flex-1 overflow-y-auto border-r">
          <div className="p-6 space-y-6">
            {/* 確定版保存成功メッセージを一番上に */}
            {publishState.success && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p>計画書を確定版として保存しました</p>
                    <div className="mt-2">
                      <p className="text-sm font-medium mb-1">共有URL:</p>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={publicPlanUrl}
                          readOnly
                          className="flex-1 px-2 py-1 text-sm bg-gray-50 border rounded"
                        />
                        <Button type="button" size="sm" variant="outline" onClick={handleCopyUrl}>
                          <Copy className="h-3 w-3 mr-1" />
                          コピー
                        </Button>
                      </div>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* 確定版の情報メッセージ */}
            {isPublished && (
              <Alert>
                <AlertDescription>
                  この計画書は確定版です。変更するには新しいバージョンを作成してください。
                </AlertDescription>
              </Alert>
            )}

            {/* 確定版の場合は共有URLを表示 */}
            {isPublished && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <LinkIcon className="h-4 w-4" />
                    この計画書の共有URL
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={publicPlanUrl}
                      readOnly
                      className="flex-1 px-3 py-2 text-sm bg-muted border rounded-md"
                    />
                    <Button type="button" size="sm" variant="outline" onClick={handleCopyUrl}>
                      <Copy className="h-4 w-4 mr-1" />
                      コピー
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    このURLは認証不要で、利用者や関係者が直接計画書を閲覧できます
                  </p>
                </CardContent>
              </Card>
            )}

            {updateState.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{updateState.error}</AlertDescription>
              </Alert>
            )}

            {publishState.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{publishState.error}</AlertDescription>
              </Alert>
            )}

            {/* AI生成セクション */}
            {!isPublished && hearingMemos.length > 0 && (
              <HearingMemoSelector
                hearingMemos={hearingMemos}
                onGenerate={handleAIGenerate}
                isGenerating={isGenerating}
              />
            )}

            <Form action={updateFormAction} className="space-y-6">
              <input type="hidden" name="planId" value={planId} />
              <input type="hidden" name="versionId" value={versionId} />

              <Card>
                <CardHeader>
                  <CardTitle>1. 利用者及びその家族の生活に対する意向（希望する生活）</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    name="desiredLife"
                    placeholder="どのような生活を希望されていますか？"
                    className={`min-h-[120px] ${isPublished ? 'bg-gray-50' : ''}`}
                    defaultValue={
                      generatedData?.desiredLife ||
                      updateState.formData?.desiredLife ||
                      initialData.desiredLife
                    }
                    key={generatedData?.desiredLife ? 'generated-desired' : 'default-desired'}
                    readOnly={isPublished}
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
                    className={`min-h-[120px] ${isPublished ? 'bg-gray-50' : ''}`}
                    defaultValue={
                      generatedData?.troubles ||
                      updateState.formData?.troubles ||
                      initialData.troubles
                    }
                    key={generatedData?.troubles ? 'generated-troubles' : 'default-troubles'}
                    readOnly={isPublished}
                  />
                </CardContent>
              </Card>

              <PlanServiceForm
                initialServices={
                  generatedData?.services && Array.isArray(generatedData.services)
                    ? generatedData.services
                    : initialData.services && Array.isArray(initialData.services)
                      ? initialData.services
                      : []
                }
                readOnly={isPublished}
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
                    placeholder="移動支援、設備要件、医療的ケア、食事要件など"
                    className={`min-h-[120px] ${isPublished ? 'bg-gray-50' : ''}`}
                    defaultValue={
                      generatedData?.considerations ||
                      updateState.formData?.considerations ||
                      initialData.considerations
                    }
                    key={
                      generatedData?.considerations
                        ? 'generated-considerations'
                        : 'default-considerations'
                    }
                    readOnly={isPublished}
                  />
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.history.back()}
                  disabled={isUpdating || isPublishing}
                >
                  戻る
                </Button>
                {!isPublished && (
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? '保存中...' : '下書き保存'}
                  </Button>
                )}
              </div>
            </Form>

            {!isPublished && (
              <Form action={publishFormAction}>
                <input type="hidden" name="planId" value={planId} />
                <input type="hidden" name="versionId" value={versionId} />
                <div className="flex justify-end">
                  <Button type="submit" variant="default" disabled={isPublishing}>
                    {isPublishing ? '確定版として保存中...' : '確定版として保存'}
                  </Button>
                </div>
              </Form>
            )}
          </div>
        </div>

        {/* 右カラム: 施設詳細 */}
        <div className="w-[500px]">
          <FacilityDetailPane
            facilityId={facilityId}
            supporterId={supporterId}
            clientId={clientId}
            planId={planId}
            onClose={() => handleShowFacilityDetail(null)}
          />
        </div>
      </div>
    )
  }

  // 通常のレイアウト
  return (
    <div className="space-y-6">
      {/* 確定版保存成功メッセージを一番上に */}
      {publishState.success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p>計画書を確定版として保存しました</p>
              <div className="mt-2">
                <p className="text-sm font-medium mb-1">共有URL:</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={publicPlanUrl}
                    readOnly
                    className="flex-1 px-2 py-1 text-sm bg-gray-50 border rounded"
                  />
                  <Button type="button" size="sm" variant="outline" onClick={handleCopyUrl}>
                    <Copy className="h-3 w-3 mr-1" />
                    コピー
                  </Button>
                </div>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* 確定版の情報メッセージ */}
      {isPublished && (
        <Alert>
          <AlertDescription>
            この計画書は確定版です。変更するには新しいバージョンを作成してください。
          </AlertDescription>
        </Alert>
      )}

      {/* 確定版の場合は共有URLを表示 */}
      {isPublished && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              この計画書の共有URL
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={publicPlanUrl}
                readOnly
                className="flex-1 px-3 py-2 text-sm bg-muted border rounded-md"
              />
              <Button type="button" size="sm" variant="outline" onClick={handleCopyUrl}>
                <Copy className="h-4 w-4 mr-1" />
                コピー
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              このURLは認証不要で、利用者や関係者が直接計画書を閲覧できます
            </p>
          </CardContent>
        </Card>
      )}

      {updateState.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{updateState.error}</AlertDescription>
        </Alert>
      )}

      {publishState.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{publishState.error}</AlertDescription>
        </Alert>
      )}

      {/* AI生成セクション */}
      {!isPublished && hearingMemos.length > 0 && (
        <HearingMemoSelector
          hearingMemos={hearingMemos}
          onGenerate={handleAIGenerate}
          isGenerating={isGenerating}
        />
      )}

      <Form action={updateFormAction} className="space-y-6">
        <input type="hidden" name="planId" value={planId} />
        <input type="hidden" name="versionId" value={versionId} />

        <Card>
          <CardHeader>
            <CardTitle>1. 利用者及びその家族の生活に対する意向（希望する生活）</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              name="desiredLife"
              placeholder="どのような生活を希望されていますか？"
              className={`min-h-[120px] ${isPublished ? 'bg-gray-50' : ''}`}
              defaultValue={
                generatedData?.desiredLife ||
                updateState.formData?.desiredLife ||
                initialData.desiredLife
              }
              key={generatedData?.desiredLife ? 'generated-desired' : 'default-desired'}
              readOnly={isPublished}
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
              className={`min-h-[120px] ${isPublished ? 'bg-gray-50' : ''}`}
              defaultValue={
                generatedData?.troubles || updateState.formData?.troubles || initialData.troubles
              }
              key={generatedData?.troubles ? 'generated-troubles' : 'default-troubles'}
              readOnly={isPublished}
            />
          </CardContent>
        </Card>

        <PlanServiceForm
          initialServices={
            generatedData?.services && Array.isArray(generatedData.services)
              ? generatedData.services
              : initialData.services && Array.isArray(initialData.services)
                ? initialData.services
                : []
          }
          readOnly={isPublished}
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
              placeholder="移動支援、設備要件、医療的ケア、食事要件など"
              className={`min-h-[120px] ${isPublished ? 'bg-gray-50' : ''}`}
              defaultValue={
                generatedData?.considerations ||
                updateState.formData?.considerations ||
                initialData.considerations
              }
              key={
                generatedData?.considerations
                  ? 'generated-considerations'
                  : 'default-considerations'
              }
              readOnly={isPublished}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
            disabled={isUpdating || isPublishing}
          >
            戻る
          </Button>
          {!isPublished && (
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? '保存中...' : '下書き保存'}
            </Button>
          )}
        </div>
      </Form>

      {!isPublished && (
        <Form action={publishFormAction}>
          <input type="hidden" name="planId" value={planId} />
          <input type="hidden" name="versionId" value={versionId} />
          <div className="flex justify-end">
            <Button type="submit" variant="default" disabled={isPublishing}>
              {isPublishing ? '確定版として保存中...' : '確定版として保存'}
            </Button>
          </div>
        </Form>
      )}
    </div>
  )
}
