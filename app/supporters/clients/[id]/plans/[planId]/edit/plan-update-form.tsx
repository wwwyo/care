'use client'

import { AlertCircle, CheckCircle } from 'lucide-react'
import Form from 'next/form'
import { useActionState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { publishPlanAction, updatePlanAction } from './actions'
import { PlanServiceForm, type ServiceFormData } from './plan-service-form'

type Props = {
  planId: string
  versionId: string
  initialData: {
    desiredLife: string
    troubles: string
    considerations: string
    services?: ServiceFormData[]
  }
  isPublished: boolean
}

export function PlanUpdateForm({ planId, versionId, initialData, isPublished }: Props) {
  const [updateState, updateFormAction, isUpdating] = useActionState(updatePlanAction, {
    error: null,
  })

  const [publishState, publishFormAction, isPublishing] = useActionState(publishPlanAction, {
    error: null,
    success: false,
  })

  return (
    <div className="space-y-6">
      {updateState.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{updateState.error}</AlertDescription>
        </Alert>
      )}

      {publishState.success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>計画書を確定版として保存しました</AlertDescription>
        </Alert>
      )}

      {publishState.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{publishState.error}</AlertDescription>
        </Alert>
      )}

      {isPublished && (
        <Alert>
          <AlertDescription>
            この計画書は確定版です。変更するには新しいバージョンを作成してください。
          </AlertDescription>
        </Alert>
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
              className="min-h-[120px]"
              defaultValue={updateState.formData?.desiredLife || initialData.desiredLife}
              disabled={isPublished}
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
              defaultValue={updateState.formData?.troubles || initialData.troubles}
              disabled={isPublished}
            />
          </CardContent>
        </Card>

        <PlanServiceForm initialServices={initialData.services || []} disabled={isPublished} />

        <Card>
          <CardHeader>
            <CardTitle>4. サービス提供事業者に配慮してほしいこと</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              name="considerations"
              placeholder="移動支援、設備要件、医療的ケア、食事要件など"
              className="min-h-[120px]"
              defaultValue={updateState.formData?.considerations || initialData.considerations}
              disabled={isPublished}
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
