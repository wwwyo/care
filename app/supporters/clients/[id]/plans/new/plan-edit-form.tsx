'use client'

import { AlertCircle } from 'lucide-react'
import Form from 'next/form'
import { useActionState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { PlanServiceForm } from '../[planId]/edit/plan-service-form'
import { createPlanAction } from './actions'

type Props = {
  clientId: string
}

export function PlanEditForm({ clientId }: Props) {
  const [state, formAction, isPending] = useActionState(createPlanAction, {
    error: null,
  })

  return (
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
            defaultValue={state.formData?.desiredLife}
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
            defaultValue={state.formData?.troubles}
          />
        </CardContent>
      </Card>

      <PlanServiceForm initialServices={[]} disabled={false} />

      <Card>
        <CardHeader>
          <CardTitle>4. サービス提供事業者に配慮してほしいこと</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            name="considerations"
            placeholder="移動支援、設備要件、医療的ケア、食事要件など、配慮が必要な事項を記入してください"
            className="min-h-[120px]"
            defaultValue={state.formData?.considerations}
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
  )
}
