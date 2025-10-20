'use client'

import { ArrowLeft } from 'lucide-react'
import Form from 'next/form'
import Link from 'next/link'
import type { KeyboardEvent } from 'react'
import { useActionState, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { romajiToHiragana } from '@/lib/romaji-to-hiragana'
import { createClientAction } from './actions'

export default function NewClientPage() {
  const [state, formAction, isPending] = useActionState(createClientAction, null)
  const [name, setName] = useState(state?.values?.name ?? '')
  const [nameKana, setNameKana] = useState(state?.values?.nameKana ?? '')
  const [birthDate, setBirthDate] = useState(state?.values?.birthDate ?? '')

  useEffect(() => {
    if (state?.message && !state?.fieldErrors) {
      toast.error(state.message)
      console.error(state)
    }
  }, [state])

  const handleNameKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.metaKey || event.ctrlKey || event.altKey) {
      return
    }

    const { key } = event

    if (key === 'Backspace' || key === 'Delete') {
      setNameKana((prev) => {
        const next = prev.slice(0, -1)
        return romajiToHiragana(next)
      })
      return
    }

    if (key === ' ' || key === '-' || /^[a-zA-Z]$/.test(key)) {
      setNameKana((prev) => {
        const next = `${prev}${key.toLowerCase()}`
        return romajiToHiragana(next)
      })
      return
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/supporters/clients">
            <ArrowLeft className="mr-2 h-4 w-4" />
            戻る
          </Link>
        </Button>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>利用者新規登録</CardTitle>
          <CardDescription>サービス利用者の情報を入力してください</CardDescription>
        </CardHeader>
        <CardContent>
          <Form action={formAction} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">氏名 *</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  value={name}
                  onKeyDown={handleNameKeyDown}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="山田太郎"
                />
                {state?.fieldErrors?.name && (
                  <p className="text-sm text-red-500">{state.fieldErrors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="nameKana">ふりがな *</Label>
                  <p className="text-xs text-muted-foreground">
                    氏名から自動入力されますが、必要に応じて編集できます
                  </p>
                </div>
                <Input
                  id="nameKana"
                  name="nameKana"
                  required
                  value={nameKana}
                  onChange={(event) => {
                    setNameKana(event.target.value)
                  }}
                  inputMode="text"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="やまだたろう"
                />
                {state?.fieldErrors?.nameKana && (
                  <p className="text-sm text-red-500">{state.fieldErrors.nameKana}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthDate">生年月日 *</Label>
                <Input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  required
                  value={birthDate}
                  onChange={(event) => setBirthDate(event.target.value)}
                />
                {state?.fieldErrors?.birthDate && (
                  <p className="text-sm text-red-500">{state.fieldErrors.birthDate}</p>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isPending}>
                {isPending ? '登録中...' : '登録する'}
              </Button>
              <Button type="button" variant="outline" asChild disabled={isPending}>
                <Link href="/supporters/clients">キャンセル</Link>
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
