import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { createAuthMiddleware } from 'better-auth/api'
import { nextCookies } from 'better-auth/next-js'
import { serverEnv } from '@/lib/env/server'
import { prisma } from '@/lib/prisma'
import { SESSION_EXPIRY_DAYS, SESSION_UPDATE_AGE_DAYS } from './constants'
import { USER_REALMS } from './schemas'

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
        defaultValue: USER_REALMS.CLIENT,
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

          try {
            switch (user.realm) {
              case USER_REALMS.SUPPORTER: {
                // Supporterテーブルにレコードを作成
                // デフォルトテナントまたは最初のテナントを使用
                let tenant = await prisma.tenant.findFirst({
                  where: { name: 'デフォルト組織' },
                })

                // デフォルトテナントが存在しない場合は作成
                if (!tenant) {
                  tenant = await prisma.tenant.create({
                    data: {
                      name: 'デフォルト組織',
                    },
                  })
                }

                await prisma.supporter.create({
                  data: {
                    userId: user.id,
                    tenantId: tenant.id,
                  },
                })

                console.log(`✅ Supporter テーブルへの同期が完了しました: ${user.email}`)
                break
              }
              case USER_REALMS.CLIENT: {
                // Clientテーブルにレコードを作成
                await prisma.client.create({
                  data: {
                    userId: user.id,
                  },
                })

                console.log(`✅ Client テーブルへの同期が完了しました: ${user.email}`)
                break
              }
              case USER_REALMS.FACILITY_STAFF: {
                // FacilityStaffテーブルにレコードを作成
                await prisma.facilityStaff.create({
                  data: {
                    userId: user.id,
                  },
                })

                console.log(`✅ FacilityStaff テーブルへの同期が完了しました: ${user.email}`)
                break
              }
              default:
                console.warn(`⚠️ 未知のrealm: ${user.realm}`)
            }
          } catch (error) {
            console.error(`❌ ユーザー ${user.email} の同期に失敗しました:`, error)
            // エラーをスローしないことで、ユーザー作成自体は成功させる
            // ただし、ログに記録して後で対処できるようにする
          }
        }
      }
    }),
  },
})

export type Session = typeof auth.$Infer.Session
