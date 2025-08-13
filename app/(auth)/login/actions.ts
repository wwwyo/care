'use server'

import { createClient } from '@/lib/supabase/server'

export async function sendMagicLink(email: string, role: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?role=${role}`,
      data: {
        role,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
