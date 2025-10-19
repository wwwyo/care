'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
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
      currentCount > 0 &&
      currentCount % 5 === 0 &&
      currentCount > lastAnalyzedCountRef.current &&
      !isAnalyzing

    if (shouldAnalyze) {
      lastAnalyzedCountRef.current = currentCount
      handleAnalyze()
    }
  }, [transcription.length, handleAnalyze, isAnalyzing])

  return (
    <div
      className={cn('flex h-full flex-col border-t border-border/60 pt-6', !isActive && 'hidden')}
    >
      {isAnalyzing && (
        <div className="flex justify-end gap-1 text-sm text-muted-foreground">
          <div className="h-2 w-2 animate-pulse rounded-full bg-orange-500" />
          <span>分析中...</span>
        </div>
      )}

      <div className="mt-4 h-[420px] overflow-y-auto pr-1 lg:border-t lg:border-border/40 lg:pt-4">
        {suggestions ? (
          <div className="space-y-4 text-sm leading-relaxed">
            {suggestions.missingTopics.length > 0 && (
              <section>
                <h4 className="mb-2 text-sm font-semibold text-foreground/80">
                  まだ聞けていない重要項目
                </h4>
                <ul className="space-y-1 text-muted-foreground">
                  {suggestions.missingTopics.map((topic) => (
                    <li key={topic}>• {topic}</li>
                  ))}
                </ul>
              </section>
            )}

            {suggestions.nextQuestions.length > 0 && (
              <section>
                <h4 className="mb-2 text-sm font-semibold text-foreground/80">
                  次に確認すべき質問
                </h4>
                <ul className="space-y-1 text-muted-foreground">
                  {suggestions.nextQuestions.map((question) => (
                    <li key={question}>• {question}</li>
                  ))}
                </ul>
              </section>
            )}

            {suggestions.importantPoints.length > 0 && (
              <section>
                <h4 className="mb-2 text-sm font-semibold text-foreground/80">重要なポイント</h4>
                <ul className="space-y-1 text-muted-foreground">
                  {suggestions.importantPoints.map((point) => (
                    <li key={point}>• {point}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>
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
