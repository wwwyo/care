'use server'

import { generateText } from 'ai'
import { getPlanWithVersions } from '@/features/plan/infra/query/plan-query'
import { prisma } from '@/lib/prisma'

type TranscriptionItem = {
  timestamp: string | Date
  text: string
}

type VoiceSource = {
  type: string
  timestamp: string | Date
  text: string
}

type ParsedContent = {
  metadata?: {
    sources?: VoiceSource[]
  }
  transcription?: TranscriptionItem[]
}

type ServiceData = {
  serviceCategory: string
  serviceType: string
  desiredAmount?: string
  desiredLifeByService?: string
  achievementPeriod?: string
}

type GeneratePlanResult =
  | {
      success: true
      data: {
        desiredLife: string
        troubles: string
        considerations: string
        services: Array<{
          serviceCategory: string
          serviceType: string
          desiredAmount: string
          desiredLifeByService: string
          achievementPeriod: string
        }>
      }
    }
  | { type: 'Error'; message: string }

export async function generatePlanFromHearingMemos(
  memoIds: string[],
  planId?: string,
): Promise<GeneratePlanResult> {
  try {
    if (memoIds.length === 0) {
      return { type: 'Error', message: 'ヒアリングメモを選択してください' }
    }

    // ヒアリングメモを取得
    const hearingMemos = await prisma.hearingMemo.findMany({
      where: {
        id: { in: memoIds },
      },
      orderBy: { date: 'asc' },
    })

    if (hearingMemos.length === 0) {
      return { type: 'Error', message: 'ヒアリングメモが見つかりません' }
    }

    // ヒアリングメモを整形
    const memosText = hearingMemos
      .map(
        (memo) => `日付: ${memo.date.toLocaleDateString('ja-JP')}
タイトル: ${memo.title}
内容:
${memo.content || '内容なし'}

文字起こし:
${
  memo.content && typeof memo.content === 'string'
    ? (
        () => {
          try {
            const parsed = JSON.parse(memo.content) as ParsedContent
            if (parsed.metadata?.sources) {
              return parsed.metadata.sources
                .filter((s) => s.type === 'voice')
                .map(
                  (item) =>
                    `[${new Date(item.timestamp).toLocaleTimeString('ja-JP')}] ${item.text}`,
                )
                .join('\n')
            }
            return 'なし'
          } catch {
            return 'なし'
          }
        }
      )()
    : (
        () => {
          try {
            const parsed =
              typeof memo.content === 'string'
                ? (JSON.parse(memo.content) as ParsedContent)
                : (memo.content as ParsedContent)
            if (parsed.transcription) {
              return parsed.transcription
                .map(
                  (item) =>
                    `[${new Date(item.timestamp).toLocaleTimeString('ja-JP')}] ${item.text}`,
                )
                .join('\n')
            }
          } catch {
            // パースエラーの場合は何もしない
          }
          return 'なし'
        }
      )()
}`,
      )
      .join('\n\n---\n\n')

    // 既存の計画書があれば取得
    let existingPlanText = ''
    if (planId) {
      const existingPlan = await getPlanWithVersions(planId)
      if (existingPlan && existingPlan.versions.length > 0) {
        const latestVersion = existingPlan.versions[0]
        if (latestVersion) {
          existingPlanText = `
## 前回の計画書内容:
### 希望する生活:
${latestVersion.desiredLife || 'なし'}

### 困っていること:
${latestVersion.troubles || 'なし'}

### 配慮事項:
${latestVersion.considerations || 'なし'}

### サービス:
${
  latestVersion.services
    ?.map(
      (s) => `- ${s.serviceCategory} / ${s.serviceType}
  利用量: ${s.desiredAmount || '未定'}
  目標: ${s.desiredLifeByService || '未定'}
  達成期間: ${s.achievementPeriod || '未定'}`,
    )
    .join('\n') || 'なし'
}
`
        }
      }
    }

    const prompt = `あなたは福祉相談支援専門員です。以下のヒアリングメモから、厚生労働省標準様式に準拠したサービス等利用計画書を作成してください。

## ヒアリングメモ:
${memosText}
${existingPlanText}

## タスク:
ヒアリングメモの内容を分析し、サービス等利用計画書の各項目を作成してください。
${existingPlanText ? '前回の計画書内容も考慮し、新しい情報で更新・改善してください。' : ''}

## 作成する項目:
1. 利用者及びその家族の生活に対する意向（希望する生活）
2. 困っていること
3. 必要なサービス（複数提案）
4. サービス提供事業者に配慮してほしいこと

## サービスカテゴリー（以下のコードから必ず選択）:
- home: 居宅介護、重度訪問介護、同行援護、行動援護、重度障害者等包括支援
- residential: 施設入所支援、共同生活援助（グループホーム）、宿泊型自立訓練
- daytime: 生活介護、就労移行支援、就労継続支援A型、就労継続支援B型、自立訓練（機能訓練）、自立訓練（生活訓練）
- child: 児童発達支援、放課後等デイサービス、保育所等訪問支援、居宅訪問型児童発達支援
- other: 短期入所、地域移行支援、地域定着支援、計画相談支援、その他

## 出力形式:
以下のJSON形式のみを出力してください。コードブロックや説明文は一切含めないでください。

{
  "desiredLife": "利用者と家族が希望する生活を具体的に記載",
  "troubles": "現在困っていることを箇条書きで記載",
  "considerations": "移動支援、設備要件、医療的ケア、食事要件など配慮事項を記載",
  "services": [
    {
      "serviceCategory": "カテゴリーコード（home/residential/daytime/child/other）",
      "serviceType": "サービス種別名（上記から選択）",
      "desiredAmount": "週○回、月○回など具体的な利用量",
      "desiredLifeByService": "このサービスで実現したい生活",
      "achievementPeriod": "○ヶ月、○年など達成期間"
    }
  ]
}

注意事項:
- ヒアリングメモから読み取れる事実に基づいて記載
- 利用者の希望と困りごとを中心に考える
- サービスは必要性に応じて複数提案（最大5つ）
- 具体的で実現可能な内容にする
- 専門用語は避け、わかりやすい表現を使う
- 重要: 必ずJSON形式のみを出力し、コードブロックや説明文は一切含めないでください`

    const result = await generateText({
      model: 'google/gemini-2.5-flash',
      prompt,
      temperature: 0.3,
      maxOutputTokens: 10000,
    })

    try {
      // JSONコードブロックを抽出
      let jsonText = result.text

      // ```json ... ``` の形式を処理
      const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (jsonMatch?.[1]) {
        jsonText = jsonMatch[1].trim()
      }

      const planData = JSON.parse(jsonText)

      // カテゴリーマッピング
      const categoryMapping: Record<string, string> = {
        日中活動系: 'daytime',
        訪問系: 'home',
        施設系: 'residential',
        相談系: 'other',
        児童系: 'child',
        home: 'home',
        residential: 'residential',
        daytime: 'daytime',
        child: 'child',
        other: 'other',
      }

      // データの検証と整形
      return {
        success: true,
        data: {
          desiredLife: planData.desiredLife || '',
          troubles: planData.troubles || '',
          considerations: planData.considerations || '',
          services: Array.isArray(planData.services)
            ? planData.services.map((s: ServiceData) => ({
                serviceCategory: categoryMapping[s.serviceCategory] || s.serviceCategory || 'other',
                serviceType: s.serviceType || '',
                desiredAmount: s.desiredAmount || '',
                desiredLifeByService: s.desiredLifeByService || '',
                achievementPeriod: s.achievementPeriod || '',
              }))
            : [],
        },
      }
    } catch (parseError) {
      console.error('JSON解析エラー:', parseError)
      return { type: 'Error', message: '生成結果の解析に失敗しました' }
    }
  } catch (error) {
    console.error('計画書生成エラー:', error)
    return { type: 'Error', message: '計画書の生成に失敗しました' }
  }
}
