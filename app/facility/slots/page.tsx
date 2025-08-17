'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { SlotStatus } from '@/domain/slot/model'
import { updateSlotStatusAction } from './actions'
import { SlotStatusButton } from './slot-status-button'

export default function SlotManagementPage() {
  const router = useRouter()
  const [selectedStatus, setSelectedStatus] = useState<SlotStatus | null>(null)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedStatus) {
      setError('空き状況を選択してください')
      return
    }

    setIsSubmitting(true)
    setError(null)

    const result = await updateSlotStatusAction({
      status: selectedStatus,
      comment: comment || undefined,
    })

    if ('success' in result) {
      router.push('/facility')
      router.refresh()
    } else {
      setError(result.message)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">空き状況を更新</h1>
        <p className="text-muted-foreground">現在の空き状況を選択してください</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
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
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={100}
                  rows={3}
                  placeholder="例：来月から1名受入可能"
                />
                <p className="text-sm text-muted-foreground">{comment.length}/100文字</p>
              </div>
            </CardContent>
          </Card>

          {/* エラー表示 */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* 送信ボタン */}
          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting} size="lg" className="flex-1">
              {isSubmitting ? '更新中...' : '更新する'}
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>
              キャンセル
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
