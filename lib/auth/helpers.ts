import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import type { Session } from './auth'
import { auth } from './auth'
import { type UserRealm, userRealmSchema } from './schemas'

export async function getSession(): Promise<Session | null> {
  return auth.api.getSession({
    headers: await headers(),
  })
}

export async function requireAuth(redirectTo = '/login'): Promise<Session> {
  const session = await getSession()

  if (!session) {
    redirect(redirectTo)
  }

  return session
}

export async function requireRealm(
  realm: UserRealm,
  redirectTo = '/unauthorized',
): Promise<Session> {
  // realmに応じた認証失敗時のリダイレクト先を設定
  const authRedirectTo = realm === 'supporter' ? '/supporter/login' : '/login'
  const session = await requireAuth(authRedirectTo)

  const userRealm = session.user.realm

  // realmをzodでバリデーション
  const parsed = userRealmSchema.safeParse(userRealm)
  if (!parsed.success || parsed.data !== realm) {
    redirect(redirectTo)
  }

  return session
}

export async function getUserRealm(): Promise<UserRealm | null> {
  const session = await getSession()
  if (!session) return null

  const userRealm = session?.user.realm

  // realmをzodでバリデーション
  const parsed = userRealmSchema.safeParse(userRealm)
  return parsed.success ? parsed.data : null
}

export function getRedirectPathByRealm(realm: UserRealm | null): string {
  switch (realm) {
    case 'supporter':
      return '/supporter/dashboard'
    case 'facility_staff':
      return '/facility/dashboard'
    default:
      return '/login'
  }
}
