'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { createConsent } from './actions'

interface ConsentFormProps {
  planId: string
  hasExistingConsent: boolean
}

export function ConsentForm({ planId, hasExistingConsent }: ConsentFormProps) {
  const [agreed, setAgreed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [consentGiven, setConsentGiven] = useState(hasExistingConsent)

  const handleConsent = async () => {
    if (!agreed) {
      toast.error('同意のチェックボックスをチェックしてください')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createConsent(planId)
      if ('error' in result) {
        toast.error(result.error)
      } else {
        toast.success('同意を記録しました')
        setConsentGiven(true)
      }
    } catch (_error) {
      toast.error('エラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (consentGiven) {
    return (
      <Card className="mb-6 border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800">同意済み</CardTitle>
          <CardDescription className="text-green-700">
            この計画書に同意いただきありがとうございます
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>同意確認</CardTitle>
        <CardDescription>
          上記のサービス等利用計画書の内容を確認し、同意される場合は以下のチェックボックスをチェックしてください。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-start space-x-3 mb-6">
          <Checkbox
            id="consent"
            checked={agreed}
            onCheckedChange={(checked) => setAgreed(checked as boolean)}
            disabled={isSubmitting}
          />
          <label
            htmlFor="consent"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            上記のサービス等利用計画書の内容に同意します
          </label>
        </div>
        <Button
          onClick={handleConsent}
          disabled={!agreed || isSubmitting}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? '処理中...' : '同意して送信'}
        </Button>
      </CardContent>
    </Card>
  )
}
