import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { nextCookies } from 'better-auth/next-js'
import { magicLink } from 'better-auth/plugins'
import { serverEnv } from '@/lib/env/server'
import { prisma } from '@/lib/prisma'
import {
  AUTH_COOKIE_NAME,
  MAGIC_LINK_EXPIRY_MINUTES,
  SESSION_EXPIRY_DAYS,
  SESSION_UPDATE_AGE_DAYS,
} from './constants'
import { sendMagicLinkEmail } from './magic-link'

export const auth = betterAuth({
  appName: 'ミタスケア',
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  session: {
    expiresIn: SESSION_EXPIRY_DAYS * 24 * 60 * 60, // 7日間
    updateAge: SESSION_UPDATE_AGE_DAYS * 24 * 60 * 60, // 1日後に更新
    cookieName: AUTH_COOKIE_NAME,
  },
  trustedOrigins: [serverEnv.NEXT_PUBLIC_APP_URL],
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendMagicLinkEmail(email, url)
      },
      expiresIn: MAGIC_LINK_EXPIRY_MINUTES * 60, // 10分間有効
    }),
    nextCookies(),
  ],
  user: {
    modelName: 'User',
    fields: {
      email: 'email',
      name: 'name',
      emailVerified: 'emailVerified',
    },
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'USER',
      },
      tenantId: {
        type: 'string',
        required: false,
      },
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ['magic-link'],
    },
  },
})

export type Session = typeof auth.$Infer.Session
