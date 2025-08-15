import { magicLinkClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import { clientEnv } from '@/lib/env/client'
import { AUTH_COOKIE_NAME } from './constants'

export const authClient = createAuthClient({
  baseURL: clientEnv.NEXT_PUBLIC_APP_URL,
  session: {
    cookieName: AUTH_COOKIE_NAME,
  },
  plugins: [magicLinkClient()],
})
