import MagicLinkEmail from '@/emails/magic-link'
import { sendEmail } from '@/lib/email'
import { isDevelopment } from '@/lib/env/server'

export async function sendMagicLinkEmail(email: string, url: string) {
  const subject = 'Care Hub - サインインリンク'

  const text = `
Care Hub - サインインリンク

こんにちは、

Care Hubへのサインインリンクをお送りします。

下記のリンクをクリックしてサインインしてください：
${url}

重要: このリンクは10分間有効です。期限が切れた場合は、再度サインインをお試しください。

このメールに心当たりがない場合は、無視していただいて構いません。

© 2025 Care Hub
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
