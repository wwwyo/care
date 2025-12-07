import { render } from '@react-email/components'
import type React from 'react'
import { Resend } from 'resend'
import { isDevelopment, serverEnv } from './env/server'

// Resendクライアント
const resend = new Resend(serverEnv.RESEND_API_KEY)

interface SendEmailOptions {
  to: string | string[]
  subject: string
  template: React.ReactElement
  text?: string
  from?: string
}

export async function sendEmail({ to, subject, template, text, from = serverEnv.EMAIL_FROM }: SendEmailOptions) {
  // React EmailコンポーネントをHTMLに変換
  const html = await render(template)

  // 開発環境ではログに出力するだけ
  if (isDevelopment) {
    console.log('\n📧 [DEV] メール送信をスキップしました:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`From: ${from}`)
    console.log(`To: ${Array.isArray(to) ? to.join(', ') : to}`)
    console.log(`Subject: ${subject}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('HTML:')
    console.log(html)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    return
  }

  // 本番環境では実際に送信
  await resend.emails.send({
    from,
    to,
    subject,
    html,
    text,
  })
}
