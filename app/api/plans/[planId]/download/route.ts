import type { NextRequest } from 'next/server'
import { exportPlanUseCase } from '@/uc/plan/export-plan'

function toArrayBuffer(buffer: Buffer): ArrayBuffer {
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer
}

export async function GET(_request: NextRequest, { params }: { params: { planId: string } }) {
  const url = new URL(_request.url)
  const versionId = url.searchParams.get('versionId') ?? undefined

  const result = await exportPlanUseCase({ planId: params.planId, versionId })

  if (result.type === 'error') {
    return new Response(result.message, { status: 404 })
  }

  const body = toArrayBuffer(result.buffer)

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${result.filename}"`,
    },
  })
}
