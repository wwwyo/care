'use client'

import { Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface MemoFormProps {
  initialDocument: string
  generatedMemo?: string | null
  onSave: (formData: FormData) => Promise<{ success: true } | { type: 'Error'; message: string }>
  onDocumentChange?: (document: string) => void
}

export function MemoForm({
  initialDocument,
  generatedMemo,
  onSave,
  onDocumentChange,
}: MemoFormProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [document, setDocument] = useState(initialDocument)

  useEffect(() => {
    if (onDocumentChange) {
      onDocumentChange(document)
    }
  }, [document, onDocumentChange])

  // AIが生成したメモを反映
  useEffect(() => {
    if (generatedMemo) {
      setDocument(generatedMemo)
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
    <form action={handleSubmit} className="lg:col-span-2">
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>議事録</span>
            <Button type="submit" size="sm" disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? '保存中...' : '保存'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="document" className="sr-only">
            議事録
          </Label>
          <Textarea
            id="document"
            name="document"
            value={document}
            onChange={(e) => setDocument(e.target.value)}
            placeholder="ヒアリング内容を入力してください..."
            className="min-h-[600px] font-mono"
            disabled={isSaving}
          />
        </CardContent>
      </Card>
    </form>
  )
}
