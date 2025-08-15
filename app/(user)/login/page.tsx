'use client'

import { useState } from 'react'
import { authClient } from '@/lib/auth/client'

export default function UserLoginPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    await authClient.signIn.magicLink(
      {
        email,
        callbackURL: '/user/dashboard',
      },
      {
        onError: (ctx) => {
          setError(ctx.error.message || 'エラーが発生しました')
          setIsLoading(false)
        },
        onSuccess: () => {
          setIsSuccess(true)
          setIsLoading(false)
        },
      },
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white p-8 rounded-lg shadow">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">メールを確認してください</h2>
              <p className="text-gray-600 mb-4">{email} にログインリンクを送信しました。</p>
              <p className="text-sm text-gray-500">
                メールが届かない場合は、迷惑メールフォルダをご確認ください。
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-3xl font-bold text-gray-900">ミタスケア</h1>
          <h2 className="mt-6 text-center text-xl text-gray-600">利用者様ログイン</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white p-8 rounded-lg shadow">
            <div>
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
                placeholder="user@example.com"
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
              {isLoading ? '送信中...' : 'ログインリンクを送信'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
