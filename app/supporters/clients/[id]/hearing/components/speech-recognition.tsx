'use client'

import { Mic, MicOff, Sparkles } from 'lucide-react'
import {
  type ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Button } from '@/components/ui/button'
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

export interface SpeechRecognitionHandle {
  toggle: () => void
  isListening: () => boolean
}

interface SpeechRecognitionProps {
  onTranscriptionUpdate: (
    transcription: TranscriptionItem[],
  ) => Promise<{ success: true } | { type: 'Error'; message: string }>
  initialTranscription?: TranscriptionItem[]
  onMemoGenerate?: (memo: string) => void
  onMemoGenerationStart?: () => void
  onMemoGenerationEnd?: () => void
  onTranscriptionChange?: (transcription: TranscriptionItem[]) => void
  currentMemo?: string
  showHeader?: boolean
}

const SpeechRecognitionComponent = (
  {
    onTranscriptionUpdate,
    initialTranscription = [],
    onMemoGenerate,
    onMemoGenerationStart,
    onMemoGenerationEnd,
    onTranscriptionChange,
    currentMemo = '',
    showHeader = true,
  }: SpeechRecognitionProps,
  ref: ForwardedRef<SpeechRecognitionHandle>,
) => {
  const [isListening, setIsListening] = useState(false)
  const [transcription, setTranscription] = useState<TranscriptionItem[]>(initialTranscription)
  const [interimTranscript, setInterimTranscript] = useState('')
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const isListeningRef = useRef(false)
  const transcriptionRef = useRef<TranscriptionItem[]>(initialTranscription)
  const manualStopRef = useRef(false)
  const [isSupported, setIsSupported] = useState<boolean | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [isGeneratingMemo, setIsGeneratingMemo] = useState(false)
  const lastGeneratedCountRef = useRef(0)
  const hasInitializedSupportCheck = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined' || hasInitializedSupportCheck.current) {
      return
    }

    hasInitializedSupportCheck.current = true

    const isLocalhost =
      window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    const isSecureContext = window.location.protocol === 'https:' || isLocalhost

    if (!isSecureContext) {
      setIsSupported(false)
      setErrorMessage('音声認識はHTTPS環境でのみ利用できます')
      return
    }

    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognitionClass) {
      setIsSupported(false)
      setErrorMessage('お使いのブラウザは Web Speech API をサポートしていません。')
      return
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsSupported(false)
      setErrorMessage('マイクデバイスが利用できません。')
      return
    }

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        for (const track of stream.getTracks()) {
          track.stop()
        }
        setIsSupported(true)
        setErrorMessage('')
      })
      .catch((error: unknown) => {
        console.error('Failed to get microphone permission', error)
        setIsSupported(false)
        setErrorMessage('マイクの使用許可が必要です')
      })
  }, [])

  const stopRecognition = useCallback(() => {
    manualStopRef.current = true
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
    isListeningRef.current = false
    setInterimTranscript('')
  }, [])

  const startRecognition = useCallback(() => {
    if (!isSupported) return
    if (typeof window === 'undefined') return

    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognitionClass) return

    const recognition = new SpeechRecognitionClass()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'ja-JP'
    recognition.maxAlternatives = 1
    manualStopRef.current = false

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = ''
      let final = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (!result || !result[0]) continue
        const transcript = result[0].transcript
        if (result.isFinal) {
          final += transcript
        } else {
          interim += transcript
        }
      }

      if (final) {
        const newItem: TranscriptionItem = {
          text: final,
          timestamp: new Date(),
        }

        const updated = [...transcriptionRef.current, newItem]
        transcriptionRef.current = updated
        setTranscription(updated)
        setInterimTranscript('')
        onTranscriptionChange?.(updated)
        onTranscriptionUpdate(updated).then((result) => {
          if ('type' in result) {
            setErrorMessage(`保存に失敗しました: ${result.message}`)
          }
        })
      } else if (interim) {
        setInterimTranscript(interim)
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setInterimTranscript('')
      if (event.error === 'aborted' || event.error === 'no-speech') {
        return
      }
      if (event.error === 'audio-capture') {
        setErrorMessage('マイクへのアクセスができません')
      } else if (event.error === 'not-allowed') {
        setErrorMessage('マイクの使用許可が必要です')
      } else if (event.error === 'network') {
        setErrorMessage('ネットワークエラーが発生しました')
        setIsSupported(false)
      } else {
        setErrorMessage('音声認識でエラーが発生しました')
      }
      stopRecognition()
    }

    recognition.onend = () => {
      setIsListening(false)
      isListeningRef.current = false
    }

    recognitionRef.current = recognition
    try {
      recognition.start()
      setIsListening(true)
      isListeningRef.current = true
      setErrorMessage('')
    } catch (error) {
      console.error(error)
      setErrorMessage('音声認識の開始に失敗しました')
    }
  }, [isSupported, onTranscriptionChange, onTranscriptionUpdate, stopRecognition])

  const toggleListening = useCallback(() => {
    if (!isSupported) {
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname
        const protocol = window.location.protocol
        const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1'
        if (protocol !== 'https:' && !isLocalhost) {
          setErrorMessage('音声認識はHTTPS環境でのみ利用できます')
          setIsSupported(false)
        }
      }
      return
    }
    if (isListeningRef.current) {
      stopRecognition()
    } else {
      startRecognition()
    }
  }, [isSupported, startRecognition, stopRecognition])

  useImperativeHandle(
    ref,
    () => ({
      toggle: toggleListening,
      isListening: () => isListeningRef.current,
    }),
    [toggleListening],
  )

  const transcriptionAnchor = useMemo(
    () => transcription.map((item) => `${item.timestamp.getTime()}-${item.text}`).join('|'),
    [transcription],
  )

  useEffect(() => {
    if (!scrollAreaRef.current) {
      return
    }
    // 依存値の最新状態に基づいてスクロール位置を更新
    void transcriptionAnchor
    void interimTranscript
    scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
  }, [transcriptionAnchor, interimTranscript])

  useEffect(() => {
    const currentCount = transcription.length
    const shouldGenerate =
      currentCount > 0 &&
      currentCount % 5 === 0 &&
      currentCount > lastGeneratedCountRef.current &&
      onMemoGenerate &&
      !isGeneratingMemo

    if (!shouldGenerate) return

    setIsGeneratingMemo(true)
    onMemoGenerationStart?.()
    lastGeneratedCountRef.current = currentCount

    generateMemoFromTranscription(transcription, currentMemo)
      .then((result) => {
        if ('success' in result && result.success) {
          onMemoGenerate?.(result.memo)
        } else if ('type' in result) {
          setErrorMessage(`メモ生成エラー: ${result.message}`)
        }
      })
      .finally(() => {
        setIsGeneratingMemo(false)
        onMemoGenerationEnd?.()
      })
  }, [
    transcription,
    currentMemo,
    onMemoGenerate,
    isGeneratingMemo,
    onMemoGenerationStart,
    onMemoGenerationEnd,
  ])

  useEffect(() => {
    return () => {
      stopRecognition()
    }
  }, [stopRecognition])

  const BaseContainer = ({ children }: { children: React.ReactNode }) => (
    <div className="flex h-full flex-col border-t border-border/60 pt-6">{children}</div>
  )

  if (isSupported === null) {
    return (
      <BaseContainer>
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          録音を開始してください
        </div>
      </BaseContainer>
    )
  }

  if (isSupported === false) {
    return (
      <BaseContainer>
        <div className="rounded-xl border border-border/60 p-4 text-sm text-warning-foreground">
          <p className="font-semibold text-warning">⚠️ 文字起こしを利用できません</p>
          <p className="mt-2 text-muted-foreground">
            {errorMessage
              ? errorMessage
              : 'お使いのブラウザは Web Speech API をサポートしていません。'}
          </p>
          <ul className="mt-2 ml-4 list-disc space-y-1 text-muted-foreground">
            <li>Google Chrome（推奨）</li>
            <li>Microsoft Edge</li>
            <li>Safari（macOS/iOS）※一部制限あり</li>
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            ※ Firefox は現在サポートされていません
          </p>
        </div>
      </BaseContainer>
    )
  }

  return (
    <BaseContainer>
      {showHeader && (
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold">文字起こし</span>
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
        </div>
      )}

      <div className={showHeader ? 'mt-4 space-y-3' : 'space-y-3'}>
        {isListening && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <span className="animate-pulse">●</span>
            録音中...
          </div>
        )}
        {errorMessage && (
          <div className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">
            {errorMessage}
          </div>
        )}
        <div
          ref={scrollAreaRef}
          className="h-[calc(100svh-240px)] space-y-2 overflow-y-auto rounded-xl bg-muted/60 p-4"
        >
          {transcription.map((item, index) => (
            <div
              key={`${item.timestamp.getTime()}-${index}`}
              className="rounded-lg bg-background/90 p-2"
            >
              <p className="mb-1 text-xs text-muted-foreground">
                {item.timestamp.toLocaleTimeString('ja-JP')}
              </p>
              <p className="text-sm leading-relaxed">{item.text}</p>
            </div>
          ))}
          {interimTranscript && (
            <div className="rounded-lg bg-background/60 p-2">
              <p className="mb-1 text-xs text-muted-foreground">リアルタイム</p>
              <p className="text-sm text-muted-foreground">{interimTranscript}</p>
            </div>
          )}
          {!isListening && transcription.length === 0 && !interimTranscript && (
            <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
              文字起こしを開始するとここに表示されます
            </div>
          )}
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <p>発話数: {transcription.length}</p>
          {isGeneratingMemo && (
            <div className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 animate-pulse" />
              <span>メモ生成中...</span>
            </div>
          )}
        </div>
      </div>
    </BaseContainer>
  )
}

export const SpeechRecognition = forwardRef(SpeechRecognitionComponent)
SpeechRecognition.displayName = 'SpeechRecognition'
