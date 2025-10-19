'use server'

import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
import type { TranscriptionItem } from './speech-recognition'

const model = openai('gpt-5-nano') // コスト効率の良い高性能モデル

type GenerateMemoResult = { success: true; memo: string } | { type: 'Error'; message: string }

type AnalyzeSuggestionsResult =
  | {
      success: true
      suggestions: {
        missingTopics: string[]
        nextQuestions: string[]
        importantPoints: string[]
      }
    }
  | { type: 'Error'; message: string }

type StructuredSummarySection = {
  slug: string | null
  title: string
  content: string
}

type StructuredSummaryResult =
  | { success: true; sections: StructuredSummarySection[] }
  | { type: 'Error'; message: string }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export async function generateMemoFromTranscription(
  transcription: TranscriptionItem[],
  existingMemo: string,
): Promise<GenerateMemoResult> {
  try {
    if (transcription.length === 0) {
      return { type: 'Error', message: '文字起こしデータがありません' }
    }

    const transcriptionText = transcription
      .map((item) => {
        const time = new Date(item.timestamp).toLocaleTimeString('ja-JP')
        return `[${time}] ${item.text}`
      })
      .join('\n')

    const prompt = `福祉相談の文字起こしから、重要な情報を整理してください。

文字起こし内容（最新5件）:
${transcriptionText}

${
  existingMemo
    ? `現在のメモ:
${existingMemo}

新しい文字起こし内容を踏まえて、メモ全体を更新・整理してください。`
    : '文字起こし内容から、重要な情報を整理してください。'
}

指示:
- プレーンテキストのみ使用（マークダウン記法は絶対に使わない）
- 話された内容から事実のみを抽出し整理
- 以下の観点で情報を整理:
  - 利用者の基本情報（年齢、性別、家族構成など）
  - 現在の状況・困りごと
  - 本人・家族の希望
  - 利用中のサービス
  - 検討中のサービス
  - その他の重要事項
- 新しい情報は適切な箇所に統合
- 古い情報と新しい情報を整合性を保って更新
- 簡潔に事実のみを記載`

    const result = await generateText({
      model,
      prompt,
      temperature: 0.3,
      maxOutputTokens: 100000,
    })

    return { success: true, memo: result.text }
  } catch (error) {
    console.error('メモ生成エラーの詳細:', error)
    if (error instanceof Error) {
      return { type: 'Error', message: `メモの生成に失敗しました: ${error.message}` }
    }
    return { type: 'Error', message: 'メモの生成に失敗しました' }
  }
}

export async function analyzeMemoForSuggestions(
  transcription: TranscriptionItem[],
  currentMemo: string,
): Promise<AnalyzeSuggestionsResult> {
  try {
    const transcriptionText = transcription
      .map((item) => {
        const time = new Date(item.timestamp).toLocaleTimeString('ja-JP')
        return `[${time}] ${item.text}`
      })
      .join('\n')

    const prompt = `あなたは福祉相談支援専門員のアシスタントです。
ヒアリング内容を分析し、相談員が次に確認すべき項目を提案してください。

${
  transcriptionText
    ? `## 文字起こし内容:
${transcriptionText}`
    : ''
}

${
  currentMemo
    ? `## 現在のメモ:
${currentMemo}`
    : ''
}

## タスク:
以下の3つのカテゴリーで、それぞれ最大3項目ずつ提案してください。

1. まだ聞けていない重要項目（福祉相談で一般的に確認すべきこと）
2. 次に確認すべき具体的な質問
3. 現時点で把握できた重要なポイント

## 出力形式:
JSON形式で以下のように出力してください：
{
  "missingTopics": ["項目1", "項目2", "項目3"],
  "nextQuestions": ["質問1", "質問2", "質問3"],
  "importantPoints": ["ポイント1", "ポイント2", "ポイント3"]
}

注意:
- 各配列は最大3項目まで
- 簡潔で具体的な内容にする
- 福祉相談の文脈に即した提案をする
- 既に十分聞けている内容は除外する`

    const result = await generateText({
      model,
      prompt,
      temperature: 0.3,
      maxOutputTokens: 100000,
    })

    try {
      const suggestions = JSON.parse(result.text)
      return {
        success: true,
        suggestions: {
          missingTopics: suggestions.missingTopics || [],
          nextQuestions: suggestions.nextQuestions || [],
          importantPoints: suggestions.importantPoints || [],
        },
      }
    } catch (parseError) {
      console.error('JSON解析エラー:', parseError)
      return { type: 'Error', message: '分析結果の解析に失敗しました' }
    }
  } catch (error) {
    console.error('分析エラー:', error)
    return { type: 'Error', message: '分析に失敗しました' }
  }
}

export async function generateStructuredSummary(
  transcription: TranscriptionItem[],
  sections: StructuredSummarySection[],
): Promise<StructuredSummaryResult> {
  try {
    if (transcription.length === 0) {
      return { type: 'Error', message: '文字起こしデータがありません' }
    }

    const recentSegments = transcription.slice(-10)
    const transcriptionText = recentSegments
      .map((item) => {
        const time = new Date(item.timestamp).toLocaleTimeString('ja-JP')
        return `[${time}] ${item.text}`
      })
      .join('\n')

    const sectionDefinitions = sections
      .map(
        (section, index) =>
          `${index + 1}. ${section.title}${section.slug ? ` (slug: ${section.slug})` : ''}`,
      )
      .join('\n')

    const existingSummary = sections
      .map((section) => `${section.title}: ${section.content || '（未入力）'}`)
      .join('\n')

    const prompt = `あなたは福祉相談のヒアリング内容を整理するアシスタントです。
最新の文字起こしと現在の要約を基に、各セクションの内容を更新してください。

## 文字起こし（最新${recentSegments.length}件）:
${transcriptionText}

## 現在の要約:
${existingSummary}

## セクション定義:
${sectionDefinitions}

## 指示:
- セクションの順序は入力と同じにする
- 各セクションのタイトルは必要に応じて補正できるが、大きく変更しない
- 新しい情報がない場合は既存の内容を保つ
- JSON配列のみで返答し、ペイロードは以下の形式とする
[
  { "slug": "support-history", "title": "支援経過", "content": "本文" },
  ...
]
- slugが入力でnullの場合は出力もnullのまま
- マークダウンや追加の説明は絶対に付けない`

    const result = await generateText({
      model,
      prompt,
      temperature: 0.2,
      maxOutputTokens: 4000,
    })

    const cleaned = result.text
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```$/i, '')
      .trim()

    const parsed = JSON.parse(cleaned)
    if (!Array.isArray(parsed)) {
      return { type: 'Error', message: 'AIの要約結果が不正な形式です' }
    }

    const normalized: StructuredSummarySection[] = parsed.map((item, index) => {
      const source = sections[index] ?? null
      const itemRecord = isRecord(item) ? item : {}

      const resolvedSlug =
        typeof itemRecord.slug === 'string' ? itemRecord.slug : (source?.slug ?? null)

      const inputTitle = typeof itemRecord.title === 'string' ? itemRecord.title.trim() : ''
      const resolvedTitle =
        inputTitle.length > 0 ? inputTitle : (source?.title ?? `セクション${index + 1}`)

      const inputContent = typeof itemRecord.content === 'string' ? itemRecord.content.trim() : ''
      const resolvedContent = inputContent.length > 0 ? inputContent : (source?.content ?? '')

      return {
        slug: resolvedSlug,
        title: resolvedTitle,
        content: resolvedContent,
      }
    })

    return { success: true, sections: normalized }
  } catch (error) {
    console.error('構造化要約の生成に失敗しました:', error)
    if (error instanceof SyntaxError) {
      return { type: 'Error', message: 'AIの要約結果を読み取れませんでした' }
    }
    return { type: 'Error', message: 'AIによる要約生成に失敗しました' }
  }
}
