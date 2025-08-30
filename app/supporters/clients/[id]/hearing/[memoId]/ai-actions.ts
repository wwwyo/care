'use server'

import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
import type { TranscriptionItem } from '@/domain/hearing-memo/model'

const model = openai('gpt-5-nano') // 最新の高性能モデル

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

export async function generateMemoFromTranscription(
  transcription: TranscriptionItem[],
  existingMemo: string,
): Promise<GenerateMemoResult> {
  try {
    if (transcription.length === 0) {
      return { type: 'Error', message: '文字起こしデータがありません' }
    }

    // 文字起こしを整形
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
    console.error('メモ生成エラー:', error)
    return { type: 'Error', message: 'メモの生成に失敗しました' }
  }
}

export async function analyzeMemoForSuggestions(
  transcription: TranscriptionItem[],
  currentMemo: string,
): Promise<AnalyzeSuggestionsResult> {
  try {
    // 文字起こしを整形
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
      maxOutputTokens: 1000,
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
