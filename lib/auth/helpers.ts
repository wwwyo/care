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
  const session = await requireAuth()

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
    case 'client':
      return '/dashboard'
    case 'supporter':
      return '/supporter/dashboard'
    case 'facility':
      return '/facility/dashboard'
    default:
      return '/login'
  }
}
