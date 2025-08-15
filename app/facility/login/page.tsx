'use client'

import Link from 'next/link'
import { useState } from 'react'
import { authClient } from '@/lib/auth/client'

export default function FacilityLoginPage() {
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
          realm: 'facility',
          callbackURL: '/facility/onboarding',
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
          callbackURL: '/facility/dashboard',
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-3xl font-bold text-gray-900">ミタスケア</h1>
          <h2 className="mt-6 text-center text-xl text-gray-600">
            施設管理者様{isSignUp ? 'アカウント作成' : 'ログイン'}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white p-8 rounded-lg shadow">
            {isSignUp && (
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  お名前
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required={isSignUp}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="山田 太郎"
                />
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                メールアドレス
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="admin@example.com"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                パスワード
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '処理中...' : isSignUp ? 'アカウント作成' : 'ログイン'}
            </button>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                {isSignUp
                  ? 'すでにアカウントをお持ちの方はこちら'
                  : 'アカウントをお持ちでない方はこちら'}
              </button>
            </div>

            <div className="mt-6 text-center space-y-2">
              <Link href="/login" className="block text-sm text-gray-600 hover:text-gray-500">
                利用者の方はこちら
              </Link>
              <Link
                href="/supporter/login"
                className="block text-sm text-gray-600 hover:text-gray-500"
              >
                支援者の方はこちら
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
