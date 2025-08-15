import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import type { Session } from './auth'
import { auth } from './auth'

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

export async function requireRole(role: string, redirectTo = '/unauthorized') {
  const session = await requireAuth()

  if (session.user.role !== role) {
    redirect(redirectTo)
  }

  return session
}

export async function getTenantId(): Promise<string | null> {
  const session = await getSession()
  return session?.user.tenantId || null
}
