'use client'

import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { sendMagicLink } from './actions'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const role = searchParams.get('role') || 'supporter'
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const result = await sendMagicLink(email, role)
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({ type: 'success', text: 'ログインリンクをメールで送信しました。' })
        setEmail('')
      }
    } catch (_error) {
      setMessage({ type: 'error', text: 'エラーが発生しました。' })
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleLabel = () => {
    switch (role) {
      case 'supporter':
        return '支援者'
      case 'facility':
        return '施設スタッフ'
      case 'user':
        return '利用者'
      default:
        return ''
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold">{getRoleLabel()}ログイン</h2>
          <p className="mt-2 text-center text-gray-600">メールアドレスを入力してください</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="your@email.com"
              disabled={isLoading}
            />
          </div>

          {message && (
            <div
              className={`rounded-md p-4 ${
                message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}
            >
              <p className="text-sm">{message.text}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? '送信中...' : 'ログインリンクを送信'}
          </button>
        </form>
      </div>
    </div>
  )
}
