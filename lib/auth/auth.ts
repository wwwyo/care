import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { createAuthMiddleware } from 'better-auth/api'
import { nextCookies } from 'better-auth/next-js'
import { serverEnv } from '@/lib/env/server'
import { prisma } from '@/lib/prisma'
import { saveFacilityStaffUseCase } from '@/uc/facility-staff/save'
import { saveSupporterUseCase } from '@/uc/supporter/save'
import { SESSION_EXPIRY_DAYS, SESSION_UPDATE_AGE_DAYS } from './constants'
import { USER_REALMS, userRealmSchema } from './schemas'

export const auth = betterAuth({
  appName: 'ミタスケア',
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  session: {
    expiresIn: SESSION_EXPIRY_DAYS * 24 * 60 * 60, // 7日間
    updateAge: SESSION_UPDATE_AGE_DAYS * 24 * 60 * 60, // 1日後に更新
  },
  trustedOrigins: [serverEnv.NEXT_PUBLIC_APP_URL],
  telemetry: {
    enabled: false,
  },
  plugins: [nextCookies()],
  user: {
    modelName: 'User',
    additionalFields: {
      realm: {
        type: 'string',
        required: true,
        defaultValue: USER_REALMS.SUPPORTER,
      },
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ['credential'],
    },
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      // サインアップ後にロール別テーブルに同期
      if (ctx.path === '/sign-up/email' && ctx.method === 'POST') {
        const newSession = ctx.context.newSession

        if (newSession?.user) {
          const user = newSession.user

          // realmをzodでバリデーション
          const realmResult = userRealmSchema.safeParse(user.realm)

          if (!realmResult.success) {
            console.warn(`⚠️ 無効なrealm: ${user.realm}`)
            return
          }

          // realmに応じて適切なユースケースを呼び出し
          let result: { type: string; message: string } | undefined

          switch (realmResult.data) {
            case USER_REALMS.SUPPORTER:
              result = await saveSupporterUseCase({
                userId: user.id,
                email: user.email,
                name: user.name,
              })
              if (!result) {
                console.log(`✅ Supporter テーブルへの同期が完了しました: ${user.email}`)
              }
              break
            case USER_REALMS.FACILITY_STAFF:
              result = await saveFacilityStaffUseCase({
                userId: user.id,
                email: user.email,
                name: user.name,
              })
              if (!result) {
                console.log(`✅ FacilityStaff テーブルへの同期が完了しました: ${user.email}`)
              }
              break
          }

          // エラーがあればログに記録（ユーザー作成自体は成功させる）
          if (result) {
            console.error(`❌ ユーザーロール作成エラー: ${result.type} - ${result.message}`)
          }
        }
      }
    }),
  },
})

export type Session = typeof auth.$Infer.Session
