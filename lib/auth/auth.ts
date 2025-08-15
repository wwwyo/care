import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { nextCookies } from 'better-auth/next-js'
import { serverEnv } from '@/lib/env/server'
import { prisma } from '@/lib/prisma'
import { AUTH_COOKIE_NAME, SESSION_EXPIRY_DAYS, SESSION_UPDATE_AGE_DAYS } from './constants'

export const auth = betterAuth({
  appName: 'ミタスケア',
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: SESSION_EXPIRY_DAYS * 24 * 60 * 60, // 7日間
    updateAge: SESSION_UPDATE_AGE_DAYS * 24 * 60 * 60, // 1日後に更新
    cookieName: AUTH_COOKIE_NAME,
  },
  trustedOrigins: [serverEnv.NEXT_PUBLIC_APP_URL],
  telemetry: {
    enabled: false,
  },
  plugins: [nextCookies()],
  user: {
    modelName: 'User',
    fields: {
      email: 'email',
      name: 'name',
      emailVerified: 'emailVerified',
    },
    additionalFields: {
      realm: {
        type: 'string',
        required: true,
        defaultValue: 'client',
      },
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ['credential'],
    },
  },
})

export type Session = typeof auth.$Infer.Session
