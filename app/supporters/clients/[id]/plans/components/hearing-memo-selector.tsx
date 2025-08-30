'use client'

import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'

type HearingMemo = {
  id: string
  title: string
  date: string | Date
  content: string
  supporter: {
    profile: {
      name: string
    } | null
  }
}

type Props = {
  hearingMemos: HearingMemo[]
  onGenerate: (selectedMemoIds: string[]) => void
  isGenerating?: boolean
}

export function HearingMemoSelector({ hearingMemos, onGenerate, isGenerating = false }: Props) {
  const [selectedMemoIds, setSelectedMemoIds] = useState<string[]>([])

  const handleToggleMemo = (memoId: string) => {
    setSelectedMemoIds((prev) =>
      prev.includes(memoId) ? prev.filter((id) => id !== memoId) : [...prev, memoId],
    )
  }

  const handleGenerate = () => {
    if (selectedMemoIds.length > 0) {
      onGenerate(selectedMemoIds)
    }
  }

  if (hearingMemos.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            ヒアリングメモがありません。まずヒアリングを実施してください。
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          AIによる計画書生成
        </CardTitle>
        <CardDescription>
          ヒアリングメモを選択してAIで計画書を生成できます。複数選択可能です。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {hearingMemos.map((memo) => (
            <div
              key={memo.id}
              className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
            >
              <Checkbox
                id={memo.id}
                checked={selectedMemoIds.includes(memo.id)}
                onCheckedChange={() => handleToggleMemo(memo.id)}
                disabled={isGenerating}
              />
              <label htmlFor={memo.id} className="flex-1 cursor-pointer space-y-1 leading-none">
                <div className="font-medium">{memo.title}</div>
                <div className="text-sm text-muted-foreground">
                  {format(new Date(memo.date), 'yyyy年MM月dd日(E)', { locale: ja })} -{' '}
                  {memo.supporter.profile?.name || '不明'}
                </div>
                <div className="text-sm text-muted-foreground line-clamp-2 mt-2">
                  {(() => {
                    try {
                      const parsed = JSON.parse(memo.content)
                      return parsed.document || parsed.memo || 'メモなし'
                    } catch {
                      return memo.content || 'メモなし'
                    }
                  })()}
                </div>
              </label>
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <Button
            onClick={handleGenerate}
            disabled={selectedMemoIds.length === 0 || isGenerating}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {isGenerating ? 'AI生成中...' : 'AIで計画書を生成'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
