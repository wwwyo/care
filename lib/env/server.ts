import { z } from 'zod'

// サーバー側で使用する環境変数のスキーマ
const serverEnvSchema = z.object({
  // Database
  DATABASE_URL: z.url(),

  // Application
  NEXT_PUBLIC_APP_URL: z.url(),

  // Email
  RESEND_API_KEY: z.string(),
  EMAIL_FROM: z.email(),

  // Better Auth
  BETTER_AUTH_SECRET: z.string().min(32),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),

  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // AI API Keys
  AI_GATEWAY_API_KEY: z.string().min(1),
})

type ServerEnv = z.infer<typeof serverEnvSchema>

// サーバー側環境変数のパース
function parseServerEnv(): ServerEnv {
  // サーバー側でのみ実行
  if (typeof window !== 'undefined') {
    throw new Error('env-server.tsはサーバー側でのみ使用してください')
  }

  try {
    return serverEnvSchema.parse({
      DATABASE_URL: process.env.DATABASE_URL,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      RESEND_API_KEY: process.env.RESEND_API_KEY,
      EMAIL_FROM: process.env.EMAIL_FROM,
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
      NODE_ENV: process.env.NODE_ENV,
      AI_GATEWAY_API_KEY: process.env.AI_GATEWAY_API_KEY,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ サーバー環境変数の検証エラー:')
      console.error(JSON.stringify(z.treeifyError(error), null, 2))
      throw new Error('必要な環境変数が設定されていません')
    }
    throw error
  }
}

// サーバー側環境変数をエクスポート
export const serverEnv = parseServerEnv()

// Helper functions
export const isDevelopment = serverEnv.NODE_ENV === 'development'
export const isProduction = serverEnv.NODE_ENV === 'production'
export const isTest = serverEnv.NODE_ENV === 'test'
