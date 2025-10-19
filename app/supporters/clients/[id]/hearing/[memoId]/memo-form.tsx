'use client'

import { Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface MemoFormProps {
  initialDocument: string
  generatedMemo?: string | null
  onSave: (formData: FormData) => Promise<{ success: true } | { type: 'Error'; message: string }>
  onDocumentChange?: (document: string) => void
  isGeneratingMemo?: boolean
  className?: string
  formId?: string
  showInlineSaveButton?: boolean
  onSavingChange?: (isSaving: boolean) => void
}

export function MemoForm({
  initialDocument,
  generatedMemo,
  onSave,
  onDocumentChange,
  isGeneratingMemo = false,
  className,
  formId,
  showInlineSaveButton = true,
  onSavingChange,
}: MemoFormProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [document, setDocument] = useState(initialDocument)

  useEffect(() => {
    if (!onSavingChange) return
    onSavingChange(isSaving)
  }, [isSaving, onSavingChange])

  useEffect(() => {
    if (onDocumentChange) {
      onDocumentChange(document)
    }
  }, [document, onDocumentChange])

  // AIが生成したメモを反映
  useEffect(() => {
    if (generatedMemo) {
      setDocument(generatedMemo)
      // ユーザーに生成されたことを知らせる
      toast.success('AIメモが生成されました！', {
        description: '議事録が自動更新されました',
      })
    }
  }, [generatedMemo])

  async function handleSubmit(_formData: FormData) {
    setIsSaving(true)
    try {
      // 現在のdocumentの値をFormDataに設定
      const updatedFormData = new FormData()
      updatedFormData.set('document', document)

      const result = await onSave(updatedFormData)
      if ('type' in result && result.type === 'Error') {
        toast.error(result.message)
      } else {
        toast.success('保存しました')
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form id={formId} action={handleSubmit} className={cn('flex h-full flex-col', className)}>
      <div className="flex items-center justify-between border-b border-border/60 pb-4">
        <div className="flex items-center gap-2 text-base font-semibold">
          <span>議事録</span>
          {isGeneratingMemo && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
              <span>AI生成中...</span>
            </div>
          )}
        </div>
        {showInlineSaveButton && (
          <Button type="submit" size="sm" disabled={isSaving} className="gap-2">
            <Save className="h-4 w-4" />
            {isSaving ? '保存中...' : '保存'}
          </Button>
        )}
      </div>
      <Label htmlFor="document" className="sr-only">
        議事録
      </Label>
      <Textarea
        id="document"
        name="document"
        value={document}
        onChange={(e) => setDocument(e.target.value)}
        placeholder="ヒアリング内容を入力してください..."
        className="mt-4 flex-1 resize-none border border-border/60 bg-background/60 p-4 font-mono shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
        disabled={isSaving}
      />
    </form>
  )
}
