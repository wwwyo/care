import { Decimal } from '@prisma/client/runtime/library'
import { HearingTranscriptModel } from '@/domain/hearing-transcript/model'
import type {
  HearingTranscriptRepository,
  HearingTranscriptRepositoryError,
} from '@/domain/hearing-transcript/repository'
import { prisma } from '@/lib/prisma'

const save = async (
  transcript: HearingTranscriptModel,
): Promise<HearingTranscriptModel | HearingTranscriptRepositoryError> => {
  try {
    const data = transcript.toJSON()

    const saved = await prisma.hearingTranscript.upsert({
      where: { id: data.id },
      update: {
        content: data.content,
        timestamp: new Decimal(data.timestamp),
        endTimestamp: data.endTimestamp ? new Decimal(data.endTimestamp) : null,
        speaker: data.speaker,
        confidence: data.confidence ? new Decimal(data.confidence) : null,
      },
      create: {
        id: data.id,
        hearingMemoId: data.hearingMemoId,
        transcriptType: data.transcriptType,
        content: data.content,
        timestamp: new Decimal(data.timestamp),
        endTimestamp: data.endTimestamp ? new Decimal(data.endTimestamp) : null,
        speaker: data.speaker,
        confidence: data.confidence ? new Decimal(data.confidence) : null,
        createdAt: data.createdAt,
      },
    })

    return HearingTranscriptModel.fromPersistence({
      ...saved,
      hearingMemoId: saved.hearingMemoId!,
      transcriptType: saved.transcriptType as 'partial' | 'final',
      speaker: saved.speaker as 'supporter' | 'client' | 'unknown' | null,
      timestamp: saved.timestamp.toNumber(),
      endTimestamp: saved.endTimestamp?.toNumber() ?? null,
      confidence: saved.confidence?.toNumber() ?? null,
    })
  } catch (error) {
    console.error('Failed to save hearing transcript:', error)

    // エラーの詳細情報を含めて返す
    if (error instanceof Error) {
      // 外部キー制約エラーの場合
      if (error.message.includes('Foreign key constraint failed')) {
        return {
          type: 'SaveFailed',
          message: 'ヒアリングメモが見つからないため、文字起こしを保存できません',
        }
      }

      // その他のPrismaエラー
      if (error.message.includes('Unique constraint failed')) {
        return { type: 'SaveFailed', message: '重複する文字起こしデータです' }
      }

      console.error('Detailed error:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      })

      return { type: 'SaveFailed', message: `文字起こしの保存に失敗しました: ${error.message}` }
    }

    return { type: 'SaveFailed', message: '文字起こしの保存に失敗しました' }
  }
}

const deleteById = async (id: string): Promise<undefined | HearingTranscriptRepositoryError> => {
  try {
    await prisma.hearingTranscript.delete({
      where: { id },
    })
    return undefined
  } catch (error) {
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return { type: 'NotFound', message: '文字起こしが見つかりません' }
    }
    console.error('Failed to delete hearing transcript:', error)
    return { type: 'DeleteFailed', message: '文字起こしの削除に失敗しました' }
  }
}

const findById = async (
  id: string,
): Promise<HearingTranscriptModel | HearingTranscriptRepositoryError> => {
  try {
    const transcript = await prisma.hearingTranscript.findUnique({
      where: { id },
    })

    if (!transcript) {
      return { type: 'NotFound', message: '文字起こしが見つかりません' }
    }

    return HearingTranscriptModel.fromPersistence({
      ...transcript,
      hearingMemoId: transcript.hearingMemoId!,
      transcriptType: transcript.transcriptType as 'partial' | 'final',
      speaker: transcript.speaker as 'supporter' | 'client' | 'unknown' | null,
      timestamp: transcript.timestamp.toNumber(),
      endTimestamp: transcript.endTimestamp?.toNumber() ?? null,
      confidence: transcript.confidence?.toNumber() ?? null,
    })
  } catch (error) {
    console.error('Failed to find hearing transcript:', error)
    return { type: 'NotFound', message: '文字起こしの取得に失敗しました' }
  }
}

const findByHearingMemoId = async (
  hearingMemoId: string,
): Promise<HearingTranscriptModel[] | HearingTranscriptRepositoryError> => {
  try {
    const transcripts = await prisma.hearingTranscript.findMany({
      where: { hearingMemoId },
      orderBy: { timestamp: 'asc' },
    })

    return transcripts.map((transcript) =>
      HearingTranscriptModel.fromPersistence({
        ...transcript,
        hearingMemoId: transcript.hearingMemoId!,
        transcriptType: transcript.transcriptType as 'partial' | 'final',
        speaker: transcript.speaker as 'supporter' | 'client' | 'unknown' | null,
        timestamp: transcript.timestamp.toNumber(),
        endTimestamp: transcript.endTimestamp?.toNumber() ?? null,
        confidence: transcript.confidence?.toNumber() ?? null,
      }),
    )
  } catch (error) {
    console.error('Failed to find hearing transcripts by memo:', error)
    return { type: 'NotFound', message: '文字起こしの取得に失敗しました' }
  }
}

export const hearingTranscriptRepository: HearingTranscriptRepository = {
  save,
  delete: deleteById,
  findById,
  findByHearingMemoId,
}
