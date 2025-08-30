'use client'

import Form from 'next/form'
import Link from 'next/link'
import { useActionState, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { SlotStatus } from '@/domain/slot/model'
import { updateSlotStatusAction } from './actions'
import { SlotStatusButton } from './slot-status-button'

export default function SlotManagementPage() {
  const [state, formAction, isPending] = useActionState(updateSlotStatusAction, null)
  const [selectedStatus, setSelectedStatus] = useState<SlotStatus | null>(null)

  useEffect(() => {
    if (state?.message && !state?.fieldErrors) {
      toast.error(state.message)
      console.error(state)
    }
  }, [state])

  // Hidden inputを使ってselectedStatusをFormDataに渡すための仕組み
  function handleSubmit(formData: FormData) {
    if (selectedStatus) {
      formData.set('status', selectedStatus)
    }
    return formAction(formData)
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">空き状況を更新</h1>
        <p className="text-muted-foreground">現在の空き状況を選択してください</p>
      </div>

      <Form action={handleSubmit} className="space-y-6">
        {/* 状態選択ボタン */}
        <Card>
          <CardHeader>
            <CardTitle>空き状況</CardTitle>
            <CardDescription>クリックして現在の状況を選択してください</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SlotStatusButton
                status="available"
                selected={selectedStatus === 'available'}
                onClick={() => setSelectedStatus('available')}
              />
              <SlotStatusButton
                status="limited"
                selected={selectedStatus === 'limited'}
                onClick={() => setSelectedStatus('limited')}
              />
              <SlotStatusButton
                status="unavailable"
                selected={selectedStatus === 'unavailable'}
                onClick={() => setSelectedStatus('unavailable')}
              />
            </div>
            {state?.fieldErrors?.status && (
              <p className="text-sm text-red-500 mt-2">{state.fieldErrors.status}</p>
            )}
          </CardContent>
        </Card>

        {/* コメント入力 */}
        <Card>
          <CardHeader>
            <CardTitle>詳細情報</CardTitle>
            <CardDescription>空き状況に関する補足情報を入力できます</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="comment">コメント（任意）</Label>
              <Textarea
                id="comment"
                name="comment"
                defaultValue={state?.values?.comment ?? ''}
                maxLength={100}
                rows={3}
                placeholder="例：来月から1名受入可能"
              />
              {state?.fieldErrors?.comment && (
                <p className="text-sm text-red-500">{state.fieldErrors.comment}</p>
              )}
              <p className="text-sm text-muted-foreground">100文字以内</p>
            </div>
          </CardContent>
        </Card>

        {/* 送信ボタン */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isPending} size="lg" className="flex-1">
            {isPending ? '更新中...' : '更新する'}
          </Button>
          <Button type="button" variant="outline" size="lg" asChild disabled={isPending}>
            <Link href="/facility">キャンセル</Link>
          </Button>
        </div>
      </Form>
    </div>
  )
}
