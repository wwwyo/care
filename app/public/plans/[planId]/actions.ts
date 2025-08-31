'use server'

import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function createConsent(planId: string) {
  try {
    // プランが存在し、公開されているか確認
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      select: {
        id: true,
        status: true,
      },
    })

    if (!plan || plan.status !== 'published') {
      return { error: 'プランが見つからないか、公開されていません' }
    }

    // リクエスト情報を取得
    const headersList = await headers()
    const userAgent = headersList.get('user-agent') || null
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || null

    // 同意記録を作成
    const consent = await prisma.consent.create({
      data: {
        planId: planId,
        requestType: 'client_consent',
        token: crypto.randomUUID(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1年後
        status: 'granted',
        grants: {
          create: {
            grantedAt: new Date(),
            grantedBy: 'client',
            method: 'web_form',
            ipAddress: ip,
            userAgent: userAgent,
          },
        },
      },
      select: {
        id: true,
        status: true,
      },
    })

    return { success: true, consentId: consent.id }
  } catch (error) {
    console.error('Failed to create consent:', error)
    return { error: '同意の記録に失敗しました' }
  }
}
