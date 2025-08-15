import MagicLinkEmail from '@/emails/magic-link'
import { sendEmail } from '@/lib/email'
import { isDevelopment } from '@/lib/env/server'

export async function sendMagicLinkEmail(email: string, url: string) {
  const subject = 'ミタスケア - ログインリンク'

  const text = `
ミタスケア - ログインリンク

こんにちは、

ミタスケアへのログインリンクをお送りします。

下記のリンクをクリックしてログインしてください：
${url}

重要: このリンクは10分間有効です。期限が切れた場合は、再度ログインをお試しください。

このメールに心当たりがない場合は、無視していただいて構いません。

© 2025 ミタスケア
  `.trim()

  await sendEmail({
    to: email,
    subject,
    template: MagicLinkEmail({ url, email }),
    text,
  })

  // 開発環境ではURLもログに出力
  if (isDevelopment) {
    console.log(`\n🔗 Magic Link URL: ${url}\n`)
  }
}
