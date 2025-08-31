'use client'

import { useState } from 'react'
import { AiSupport } from './ai-support'
import { MemoForm } from './memo-form'
import { SpeechRecognition, type TranscriptionItem } from './speech-recognition'

interface MemoContainerProps {
  initialDocument: string
  initialTranscription: TranscriptionItem[]
  onSaveDocument: (
    formData: FormData,
  ) => Promise<{ success: true } | { type: 'Error'; message: string }>
  onSaveTranscription: (
    transcription: TranscriptionItem[],
  ) => Promise<{ success: true } | { type: 'Error'; message: string }>
}

export function MemoContainer({
  initialDocument,
  initialTranscription,
  onSaveDocument,
  onSaveTranscription,
}: MemoContainerProps) {
  const [currentMemo, setCurrentMemo] = useState(initialDocument)
  const [generatedMemo, setGeneratedMemo] = useState<string | null>(null)

  const handleMemoGenerate = (memo: string) => {
    setGeneratedMemo(memo)
    setCurrentMemo(memo)
  }

  return (
    <>
      {/* 左側2/3: メモ内容 */}
      <MemoForm
        initialDocument={initialDocument}
        generatedMemo={generatedMemo}
        onSave={onSaveDocument}
        onDocumentChange={setCurrentMemo}
      />

      {/* 右側1/3を上下に分割 */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        {/* 右上: 音声認識 */}
        <div className="flex-1">
          <SpeechRecognition
            onTranscriptionUpdate={onSaveTranscription}
            initialTranscription={initialTranscription}
            onMemoGenerate={handleMemoGenerate}
            currentMemo={currentMemo}
          />
        </div>

        {/* 右下: AI支援 */}
        <div className="flex-1">
          <AiSupport transcription={initialTranscription} currentMemo={currentMemo} />
        </div>
      </div>
    </>
  )
}
