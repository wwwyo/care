import { z } from 'zod'

// クライアント側で使用可能な環境変数のスキーマ
const clientEnvSchema = z.object({
  // Public環境変数のみ
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  NEXT_PUBLIC_APP_URL: z.url(),
})

type ClientEnv = z.infer<typeof clientEnvSchema>

// クライアント側環境変数のパース
function parseClientEnv(): ClientEnv {
  try {
    return clientEnvSchema.parse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ クライアント環境変数の検証エラー:')
      console.error(JSON.stringify(z.treeifyError(error), null, 2))
      throw new Error('必要な環境変数が設定されていません')
    }
    throw error
  }
}

// クライアント側環境変数をエクスポート
export const clientEnv = parseClientEnv()
