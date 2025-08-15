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
import { authClient } from '@/lib/auth/client'

export default function SupporterLoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (isSignUp) {
      // サインアップ時にrealmを指定
      await authClient.signUp.email(
        {
          email,
          password,
          name,
          realm: 'supporter',
          callbackURL: '/supporter/onboarding',
        },
        {
          onSuccess: () => {
            setIsLoading(false)
          },
          onError: (ctx) => {
            setError(ctx.error.message || 'サインアップに失敗しました')
            setIsLoading(false)
          },
        },
      )
    } else {
      // ログイン
      await authClient.signIn.email(
        {
          email,
          password,
          callbackURL: '/supporter/dashboard',
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
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">MitasCare</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>支援者様{isSignUp ? 'アカウント作成' : 'ログイン'}</CardTitle>
            <CardDescription>
              {isSignUp
                ? '新規アカウントを作成してください'
                : 'アカウント情報を入力してログインしてください'}
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="name">お名前</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required={isSignUp}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="山田 太郎"
                  />
                </div>
              )}

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
                  placeholder="supporter@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">パスワード</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
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
                {isLoading ? '処理中...' : isSignUp ? 'アカウント作成' : 'ログイン'}
              </Button>

              <Button
                type="button"
                variant="link"
                className="w-full"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp
                  ? 'すでにアカウントをお持ちの方はこちら'
                  : 'アカウントをお持ちでない方はこちら'}
              </Button>

              <div className="text-center space-y-2 pt-4 border-t w-full">
                <Link
                  href="/login"
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  利用者の方はこちら
                </Link>
                <Link
                  href="/facility/login"
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  施設スタッフの方はこちら
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
