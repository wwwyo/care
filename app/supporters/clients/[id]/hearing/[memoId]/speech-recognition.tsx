'use client'

import { Mic, MicOff, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { generateMemoFromTranscription } from './ai-actions'

// Web Speech API の型定義
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  isFinal: boolean
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message?: string
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives: number
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

export interface TranscriptionItem {
  text: string
  timestamp: Date
}

interface SpeechRecognitionProps {
  onTranscriptionUpdate: (
    transcription: TranscriptionItem[],
  ) => Promise<{ success: true } | { type: 'Error'; message: string }>
  initialTranscription?: TranscriptionItem[]
  onMemoGenerate?: (memo: string) => void
  currentMemo?: string
}

export function SpeechRecognition({
  onTranscriptionUpdate,
  initialTranscription = [],
  onMemoGenerate,
  currentMemo = '',
}: SpeechRecognitionProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcription, setTranscription] = useState<TranscriptionItem[]>(initialTranscription)
  const [interimTranscript, setInterimTranscript] = useState('')
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const isListeningRef = useRef(false)
  const transcriptionRef = useRef<TranscriptionItem[]>(initialTranscription) // 最新の値を参照するためのref
  const [isSupported, setIsSupported] = useState<boolean | null>(null) // 初期値をnullにして判定中を表現
  const [errorMessage, setErrorMessage] = useState('')
  const scrollAreaRef = useRef<HTMLDivElement>(null) // スクロールエリアの参照
  const [isGeneratingMemo, setIsGeneratingMemo] = useState(false) // AI処理中フラグ
  const lastGeneratedCountRef = useRef(0) // 最後にAI生成した時の発話数

  useEffect(() => {
    // ブラウザがWeb Speech APIをサポートしているか確認
    if (typeof window !== 'undefined') {
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!SpeechRecognitionClass) {
        console.warn('Web Speech API is not supported in this browser')
        setIsSupported(false)
        return
      }

      // サポートされているブラウザ
      setIsSupported(true)
    }

    return () => {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop()
        recognitionRef.current = null
      }
    }
  }, [isListening])

  // transcriptionが更新されたら自動スクロール
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [])

  // 5発話ごとにAIでメモを生成
  useEffect(() => {
    const currentCount = transcription.length
    const shouldGenerate =
      currentCount > 0 &&
      currentCount % 5 === 0 &&
      currentCount > lastGeneratedCountRef.current &&
      onMemoGenerate &&
      !isGeneratingMemo

    if (shouldGenerate) {
      setIsGeneratingMemo(true)
      lastGeneratedCountRef.current = currentCount

      generateMemoFromTranscription(transcription, currentMemo)
        .then((result) => {
          if ('success' in result && result.success) {
            onMemoGenerate(result.memo)
          } else if ('type' in result) {
            console.error('メモ生成エラー:', result.message)
            setErrorMessage(`メモ生成エラー: ${result.message}`)
          }
        })
        .finally(() => {
          setIsGeneratingMemo(false)
        })
    }
  }, [transcription, currentMemo, onMemoGenerate, isGeneratingMemo])

  const toggleListening = () => {
    if (isListening) {
      // 停止時
      if (recognitionRef.current) {
        recognitionRef.current.stop()
        recognitionRef.current = null // インスタンスをクリア
      }
      setIsListening(false)
      isListeningRef.current = false
      setInterimTranscript('')
      setErrorMessage('')
    } else {
      // 開始時 - 新しいインスタンスを作成
      if (!isSupported) return

      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!SpeechRecognitionClass) return

      const recognition = new SpeechRecognitionClass()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'ja-JP'
      recognition.maxAlternatives = 1

      // イベントハンドラを設定（既存のuseEffect内の設定と同じ）
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        console.log('音声認識結果イベント:', event.resultIndex, event.results.length)

        let interim = ''
        let final = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          if (!result || !result[0]) continue
          const transcript = result[0].transcript

          console.log(`結果[${i}]: "${transcript}" (final: ${result.isFinal})`)

          if (result.isFinal) {
            final += transcript
          } else {
            interim += transcript
          }
        }

        if (final) {
          console.log('確定文字列:', final)
          const newItem: TranscriptionItem = {
            text: final,
            timestamp: new Date(),
          }

          const current = transcriptionRef.current
          const updated = [...current, newItem]

          setTranscription(updated)
          transcriptionRef.current = updated
          setInterimTranscript('')

          onTranscriptionUpdate(updated).then((result) => {
            if ('type' in result && result.type === 'Error') {
              console.error('音声認識の保存エラー:', result.message)
              setErrorMessage(`保存に失敗しました: ${result.message}`)
            }
          })
        } else if (interim) {
          console.log('暫定文字列:', interim)
          setInterimTranscript(interim)
        }
      }

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('音声認識エラー:', event.error || 'Unknown error')
        setInterimTranscript('')

        if (event.error === 'aborted') {
          // abortedエラーは無視（正常な停止）
          console.log('音声認識が中止されました')
        } else if (event.error === 'no-speech') {
          console.log('音声が検出されませんでした')
          setErrorMessage('')
        } else if (event.error === 'audio-capture') {
          console.error('マイクへのアクセスができません')
          setErrorMessage('マイクへのアクセスができません')
          setIsListening(false)
          isListeningRef.current = false
        } else if (event.error === 'not-allowed') {
          console.error('マイクの使用許可が必要です')
          setErrorMessage('マイクの使用許可が必要です')
          setIsListening(false)
          isListeningRef.current = false
        } else if (event.error === 'network') {
          console.error(
            'ネットワークエラー: ブラウザが音声認識をサポートしていない可能性があります',
          )
          setIsSupported(false)
          setIsListening(false)
          isListeningRef.current = false
        } else {
          setErrorMessage('音声認識でエラーが発生しました')
          setIsListening(false)
          isListeningRef.current = false
        }
      }

      recognition.onstart = () => {
        console.log('音声認識が開始されました')
      }

      recognition.onend = () => {
        console.log('音声認識が終了しました')
        // 自動再開はしない（ユーザーが明示的に操作する）
        setIsListening(false)
        isListeningRef.current = false
      }

      recognitionRef.current = recognition

      try {
        recognition.start()
        setIsListening(true)
        isListeningRef.current = true
        setErrorMessage('')
      } catch (e) {
        console.error('音声認識の開始に失敗しました:', e)
        setErrorMessage('音声認識の開始に失敗しました')
      }
    }
  }

  if (isSupported === null) {
    // 判定中の表示
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-muted-foreground" />
            文字起こし
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">初期化中...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isSupported === false) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-muted-foreground" />
            文字起こし
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-warning/10 border border-warning rounded-lg p-4">
            <p className="text-sm font-semibold text-warning mb-2">⚠️ 文字起こしを利用できません</p>
            <p className="text-sm text-muted-foreground mb-3">
              お使いのブラウザは Web Speech API をサポートしていません。
            </p>
            <div className="text-sm">
              <p className="font-semibold mb-1">対応ブラウザ：</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Google Chrome（推奨）</li>
                <li>Microsoft Edge</li>
                <li>Safari（macOS/iOS）※一部制限あり</li>
              </ul>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              ※ Firefox は現在サポートされていません
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>文字起こし</span>
          <Button
            onClick={toggleListening}
            variant={isListening ? 'destructive' : 'default'}
            size="sm"
          >
            {isListening ? (
              <>
                <MicOff className="mr-2 h-4 w-4" />
                停止
              </>
            ) : (
              <>
                <Mic className="mr-2 h-4 w-4" />
                開始
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {isListening && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <span className="animate-pulse">●</span>
              録音中...
            </div>
          )}
          {errorMessage && (
            <div className="bg-destructive/10 text-destructive rounded-md p-2 text-sm">
              {errorMessage}
            </div>
          )}
          <div
            ref={scrollAreaRef}
            className="bg-muted rounded-lg p-4 min-h-[200px] max-h-[250px] overflow-y-auto space-y-2"
          >
            {transcription.map((item, index) => (
              <div
                key={`${item.timestamp.getTime()}-${index}`}
                className="bg-background rounded p-2"
              >
                <p className="text-xs text-muted-foreground mb-1">
                  {item.timestamp.toLocaleTimeString('ja-JP')}
                </p>
                <p className="text-sm">{item.text}</p>
              </div>
            ))}
            {interimTranscript && (
              <div className="bg-background/50 rounded p-2 opacity-70">
                <p className="text-sm text-muted-foreground italic">{interimTranscript}</p>
              </div>
            )}
            {transcription.length === 0 && !interimTranscript && (
              <p className="text-sm text-muted-foreground text-center py-8">
                文字起こしを開始すると、ここに文字起こしが表示されます
              </p>
            )}
          </div>
          {transcription.length > 0 && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <p>発話数: {transcription.length}</p>
              {isGeneratingMemo && (
                <div className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3 animate-pulse" />
                  <span>メモ生成中...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
