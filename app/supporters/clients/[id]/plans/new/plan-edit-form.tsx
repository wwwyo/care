'use client'

import { AlertCircle } from 'lucide-react'
import Form from 'next/form'
import { useActionState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { createPlanAction } from './actions'

type Props = {
  clientId: string
  supporterId: string
  tenantId: string
}

export function PlanEditForm({ clientId, supporterId, tenantId }: Props) {
  const [state, formAction, isPending] = useActionState(createPlanAction, {
    error: null,
  })

  return (
    <Form action={formAction} className="space-y-6">
      <input type="hidden" name="clientId" value={clientId} />
      <input type="hidden" name="supporterId" value={supporterId} />
      <input type="hidden" name="tenantId" value={tenantId} />

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
            maxLength={1000}
          />
          <p className="text-sm text-muted-foreground mt-1">最大1000文字</p>
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
            maxLength={1000}
          />
          <p className="text-sm text-muted-foreground mt-1">最大1000文字</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. 利用したいサービス</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">日中活動サービス</h4>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="services" value="生活介護" />
                <span>生活介護</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="services" value="就労移行支援" />
                <span>就労移行支援</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="services" value="就労継続支援A型" />
                <span>就労継続支援A型</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="services" value="就労継続支援B型" />
                <span>就労継続支援B型</span>
              </label>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">在宅サービス</h4>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="services" value="家事援助" />
                <span>家事援助</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="services" value="身体介護" />
                <span>身体介護</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="services" value="通院等介助" />
                <span>通院等介助</span>
              </label>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">居住サービス</h4>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="services" value="共同生活援助" />
                <span>共同生活援助（グループホーム）</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="services" value="施設入所支援" />
                <span>施設入所支援</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

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
            maxLength={1000}
          />
          <p className="text-sm text-muted-foreground mt-1">最大1000文字</p>
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
