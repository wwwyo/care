import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const role = requestUrl.searchParams.get('role') || 'supporter'

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // ロールに応じてリダイレクト先を決定
  let redirectPath = '/'
  switch (role) {
    case 'supporter':
      redirectPath = '/dashboard'
      break
    case 'facility':
      redirectPath = '/facility/slots'
      break
    case 'user':
      redirectPath = '/my/plans'
      break
  }

  return NextResponse.redirect(new URL(redirectPath, requestUrl.origin))
}
