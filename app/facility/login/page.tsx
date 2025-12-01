'use client'

import { AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/features/auth/client'

export default function FacilityLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // ログイン
    await authClient.signIn.email(
      {
        email,
        password,
        callbackURL: '/facility',
      },
      {
        onSuccess: () => {
          setIsLoading(false)
        },
        onError: (ctx) => {
          setError(ctx.error.message || 'ログインに失敗しました')
          setIsLoading(false)
        },
      },
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">CareHub</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>施設管理者様ログイン</CardTitle>
            <CardDescription>アカウント情報を入力してログインしてください</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">パスワード</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-6">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? '処理中...' : 'ログイン'}
              </Button>

              <Link href="/facility/signup" className="w-full">
                <Button type="button" variant="link" className="w-full">
                  アカウントをお持ちでない方はこちら
                </Button>
              </Link>

              <div className="text-center space-y-2 pt-4 border-t w-full">
                <Link
                  href="/supporter/login"
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  相談員の方はこちら
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
