'use client'

import { Check, Edit2, X } from 'lucide-react'
import Form from 'next/form'
import { useActionState, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { updateTitle } from './actions'

interface TitleEditorProps {
  initialTitle: string
  memoId: string
}

export function TitleEditor({ initialTitle, memoId }: TitleEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [state, formAction, isPending] = useActionState(
    async (_prevState: unknown, formData: FormData) => {
      const result = await updateTitle(memoId, formData)
      if ('success' in result) {
        setIsEditing(false)
      }
      return result
    },
    null,
  )

  if (!isEditing) {
    return (
      <div className="flex items-center gap-2 group">
        <h1 className="text-3xl font-bold">{initialTitle}</h1>
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setIsEditing(true)}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <Form action={formAction} className="flex items-center gap-2">
      <Input
        name="title"
        defaultValue={initialTitle}
        className="font-bold h-auto py-1 px-2 text-3xl"
        autoFocus
        disabled={isPending}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setIsEditing(false)
          }
        }}
      />
      <Button type="submit" variant="ghost" size="icon" disabled={isPending}>
        <Check className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setIsEditing(false)}
        disabled={isPending}
      >
        <X className="h-4 w-4" />
      </Button>
      {state && 'type' in state && (
        <span className="text-sm text-destructive">{state.message}</span>
      )}
    </Form>
  )
}
