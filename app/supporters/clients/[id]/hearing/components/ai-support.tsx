'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { analyzeMemoForSuggestions } from './ai-actions'
import type { TranscriptionItem } from './speech-recognition'

interface AiSupportProps {
  transcription: TranscriptionItem[]
  currentMemo: string
  isActive?: boolean
}

interface Suggestions {
  missingTopics: string[]
  nextQuestions: string[]
  importantPoints: string[]
}

export function AiSupport({ transcription, currentMemo, isActive = true }: AiSupportProps) {
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const lastAnalyzedCountRef = useRef(0)
  const suggestionGroups =
    suggestions === null
      ? []
      : [
          {
            key: 'missing-topics',
            title: 'まだ聞けていない重要項目',
            description: 'ヒアリングで触れられていない内容です。状況確認の優先順位にご活用ください。',
            items: suggestions.missingTopics,
          },
          {
            key: 'next-questions',
            title: '次に確認すべき質問',
            description: '追加で聞いておくと方針が固めやすい質問候補です。',
            items: suggestions.nextQuestions,
          },
          {
            key: 'important-points',
            title: '重要なポイント',
            description: '計画書作成で押さえておきたい観点をリマインドします。',
            items: suggestions.importantPoints,
          },
        ].filter((group) => group.items.length > 0)

  const handleAnalyze = useCallback(async () => {
    if (transcription.length === 0 && !currentMemo) return

    setIsAnalyzing(true)
    try {
      const result = await analyzeMemoForSuggestions(transcription, currentMemo)
      if ('success' in result && result.success) {
        setSuggestions(result.suggestions)
      }
    } catch (error) {
      console.error('分析エラー:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }, [transcription, currentMemo])

  useEffect(() => {
    const currentCount = transcription.length
    const shouldAnalyze =
      currentCount > 0 && currentCount % 3 === 0 && currentCount > lastAnalyzedCountRef.current && !isAnalyzing

    if (shouldAnalyze) {
      lastAnalyzedCountRef.current = currentCount
      handleAnalyze()
    }
  }, [transcription.length, handleAnalyze, isAnalyzing])

  return (
    <div className={cn('flex h-full flex-col border-t border-border/60 pt-6', !isActive && 'hidden')}>
      {isAnalyzing && (
        <div className="flex justify-end gap-1 text-sm text-muted-foreground">
          <div className="h-2 w-2 animate-pulse rounded-full bg-orange-500" />
          <span>分析中...</span>
        </div>
      )}

      <div className="mt-4 h-[calc(100svh-180px)] overflow-y-auto pr-1 lg:border-t lg:border-border/40 lg:pt-4">
        {suggestions ? (
          suggestionGroups.length > 0 ? (
            <div className="flex flex-col gap-4">
              {suggestionGroups.map((group) => (
                <Card key={group.key}>
                  <CardHeader>
                    <CardTitle className="text-sm">{group.title}</CardTitle>
                    <CardDescription>{group.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                      {group.items.map((item, index) => (
                        <li key={`${group.key}-${index}`} className="flex gap-2">
                          <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-center">
              <p className="text-sm text-muted-foreground">
                分析結果に基づく提案はまだありません。ヒアリングを進めるとカードが表示されます。
              </p>
            </div>
          )
        ) : (
          <div className="flex h-full items-center justify-center text-center">
            <p className="text-sm text-muted-foreground">
              ヒアリング内容を分析すると、確認すべき項目や次の質問候補を提案します。
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
