import {
  type HearingMemoContent,
  HearingMemoContentSchema,
  HearingMemoModel,
} from '@/domain/hearing-memo/model'
import type {
  HearingMemoRepository,
  HearingMemoRepositoryError,
} from '@/domain/hearing-memo/repository'
import { prisma } from '@/lib/prisma'

const save = async (
  memo: HearingMemoModel,
): Promise<HearingMemoModel | HearingMemoRepositoryError> => {
  try {
    const data = memo.toJSON()
    // contentをJSON文字列に変換してTEXT型として保存
    const contentString = JSON.stringify(data.content)

    const saved = await prisma.hearingMemo.upsert({
      where: { id: data.id },
      update: {
        date: data.date,
        title: data.title,
        content: contentString,
        updatedAt: data.updatedAt,
      },
      create: {
        id: data.id,
        clientId: data.clientId,
        supporterId: data.supporterId,
        date: data.date,
        title: data.title,
        content: contentString,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
    })

    // contentをJSONとしてパースし、Zodでバリデーション
    let content: HearingMemoContent
    try {
      content = HearingMemoContentSchema.parse(JSON.parse(saved.content))
    } catch (error) {
      console.error('Failed to parse or validate content:', error)
      console.error('Raw content:', saved.content)
      content = { document: '', transcription: [] }
    }

    return HearingMemoModel.fromPersistence({
      ...saved,
      content,
    })
  } catch (error) {
    console.error('Failed to save hearing memo:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
      console.error('Error stack:', error.stack)
    }
    return { type: 'SaveFailed', message: 'ヒアリングメモの保存に失敗しました' }
  }
}

const deleteById = async (id: string): Promise<undefined | HearingMemoRepositoryError> => {
  try {
    await prisma.hearingMemo.delete({
      where: { id },
    })
    return undefined
  } catch (error) {
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return { type: 'NotFound', message: 'ヒアリングメモが見つかりません' }
    }
    console.error('Failed to delete hearing memo:', error)
    return { type: 'DeleteFailed', message: 'ヒアリングメモの削除に失敗しました' }
  }
}

const findById = async (id: string): Promise<HearingMemoModel | HearingMemoRepositoryError> => {
  try {
    const memo = await prisma.hearingMemo.findUnique({
      where: { id },
    })

    if (!memo) {
      return { type: 'NotFound', message: 'ヒアリングメモが見つかりません' }
    }

    // contentをJSONとしてパースし、Zodでバリデーション
    let content: HearingMemoContent
    try {
      content = HearingMemoContentSchema.parse(JSON.parse(memo.content))
    } catch (error) {
      console.error('Failed to parse or validate content for memo:', memo.id, error)
      content = { document: '', transcription: [] }
    }

    return HearingMemoModel.fromPersistence({
      ...memo,
      content,
    })
  } catch (error) {
    console.error('Failed to find hearing memo:', error)
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
    return { type: 'NotFound', message: 'ヒアリングメモの取得に失敗しました' }
  }
}

const findByClientId = async (
  clientId: string,
): Promise<HearingMemoModel[] | HearingMemoRepositoryError> => {
  try {
    const memos = await prisma.hearingMemo.findMany({
      where: { clientId },
      orderBy: { date: 'desc' },
    })

    const parsedMemos: HearingMemoModel[] = []
    for (const memo of memos) {
      let content: HearingMemoContent
      try {
        content = HearingMemoContentSchema.parse(JSON.parse(memo.content))
      } catch (error) {
        console.error('Failed to parse or validate content for memo:', memo.id, error)
        content = { document: '', transcription: [] }
      }

      parsedMemos.push(
        HearingMemoModel.fromPersistence({
          ...memo,
          content,
        }),
      )
    }

    return parsedMemos
  } catch (error) {
    console.error('Failed to find hearing memos by client:', error)
    return { type: 'NotFound', message: 'ヒアリングメモの取得に失敗しました' }
  }
}

const findBySupporterId = async (
  supporterId: string,
): Promise<HearingMemoModel[] | HearingMemoRepositoryError> => {
  try {
    const memos = await prisma.hearingMemo.findMany({
      where: { supporterId },
      orderBy: { date: 'desc' },
    })

    const parsedMemos: HearingMemoModel[] = []
    for (const memo of memos) {
      let content: HearingMemoContent
      try {
        content = HearingMemoContentSchema.parse(JSON.parse(memo.content))
      } catch (error) {
        console.error('Failed to parse or validate content for memo:', memo.id, error)
        content = { document: '', transcription: [] }
      }

      parsedMemos.push(
        HearingMemoModel.fromPersistence({
          ...memo,
          content,
        }),
      )
    }

    return parsedMemos
  } catch (error) {
    console.error('Failed to find hearing memos by supporter:', error)
    return { type: 'NotFound', message: 'ヒアリングメモの取得に失敗しました' }
  }
}

export const hearingMemoRepository: HearingMemoRepository = {
  save,
  delete: deleteById,
  findById,
  findByClientId,
  findBySupporterId,
}
