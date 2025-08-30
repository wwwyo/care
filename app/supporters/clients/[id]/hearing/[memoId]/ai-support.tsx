'use client'

import { Sparkles } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { analyzeMemoForSuggestions } from './ai-actions'
import type { TranscriptionItem } from './speech-recognition'

interface AiSupportProps {
  transcription: TranscriptionItem[]
  currentMemo: string
}

interface Suggestions {
  missingTopics: string[]
  nextQuestions: string[]
  importantPoints: string[]
}

export function AiSupport({ transcription, currentMemo }: AiSupportProps) {
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

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

  // 文字起こしが10件以上ある場合は自動分析
  useEffect(() => {
    if (transcription.length >= 10 && !suggestions) {
      handleAnalyze()
    }
  }, [transcription.length, suggestions, handleAnalyze])

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>AI支援</span>
          {(transcription.length > 0 || currentMemo) && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {isAnalyzing ? '分析中...' : '分析'}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {suggestions ? (
          <div className="space-y-4 text-sm">
            {suggestions.missingTopics.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">まだ聞けていない重要項目</h4>
                <ul className="space-y-1">
                  {suggestions.missingTopics.map((topic) => (
                    <li key={topic} className="text-muted-foreground">
                      • {topic}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {suggestions.nextQuestions.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">次に確認すべき質問</h4>
                <ul className="space-y-1">
                  {suggestions.nextQuestions.map((question) => (
                    <li key={question} className="text-muted-foreground">
                      • {question}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {suggestions.importantPoints.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">重要なポイント</h4>
                <ul className="space-y-1">
                  {suggestions.importantPoints.map((point) => (
                    <li key={point} className="text-muted-foreground">
                      • {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            ヒアリング内容を分析すると、確認すべき項目や次の質問候補を提案します。
          </p>
        )}
      </CardContent>
    </Card>
  )
}
