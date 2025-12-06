import { promises as fs } from 'node:fs'
import path from 'node:path'
import { deflateRawSync, inflateRawSync } from 'node:zlib'
import { prisma } from '@/lib/prisma'

const LOCAL_FILE_HEADER_SIGNATURE = 0x04034b50
const CENTRAL_DIRECTORY_SIGNATURE = 0x02014b50
const END_OF_CENTRAL_DIRECTORY_SIGNATURE = 0x06054b50

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n += 1) {
    let c = n
    for (let k = 0; k < 8; k += 1) {
      if ((c & 1) === 1) {
        c = 0xedb88320 ^ (c >>> 1)
      } else {
        c >>>= 1
      }
    }
    table[n] = c >>> 0
  }
  return table
})()

function crc32(buffer: Buffer): number {
  let crc = 0 ^ -1
  for (const byte of buffer) {
    const tableIndex = (crc ^ byte) & 0xff
    const tableValue = CRC_TABLE[tableIndex] ?? 0
    crc = (crc >>> 8) ^ tableValue
  }
  return (crc ^ -1) >>> 0
}

type ZipEntry = {
  name: string
  data: Buffer
  modTime: number
  modDate: number
  isDirectory: boolean
}

type ParsedZip = {
  entries: ZipEntry[]
}

function readZip(buffer: Buffer): ParsedZip {
  const entries: ZipEntry[] = []
  let offset = 0

  while (offset + 4 <= buffer.length) {
    const signature = buffer.readUInt32LE(offset)

    if (signature === LOCAL_FILE_HEADER_SIGNATURE) {
      const compressionMethod = buffer.readUInt16LE(offset + 8)
      const modTime = buffer.readUInt16LE(offset + 10)
      const modDate = buffer.readUInt16LE(offset + 12)
      const compressedSize = buffer.readUInt32LE(offset + 18)
      const uncompressedSize = buffer.readUInt32LE(offset + 22)
      const fileNameLength = buffer.readUInt16LE(offset + 26)
      const extraFieldLength = buffer.readUInt16LE(offset + 28)

      const fileNameStart = offset + 30
      const fileNameEnd = fileNameStart + fileNameLength
      const name = buffer.slice(fileNameStart, fileNameEnd).toString('utf-8')

      const dataStart = fileNameEnd + extraFieldLength
      const dataEnd = dataStart + compressedSize
      const compressedData = buffer.slice(dataStart, dataEnd)

      let data: Buffer
      if (compressionMethod === 0) {
        data = Buffer.from(compressedData)
      } else if (compressionMethod === 8) {
        data = inflateRawSync(compressedData)
      } else {
        throw new Error(`Unsupported compression method: ${compressionMethod} in file ${name}`)
      }

      if (uncompressedSize !== 0 && data.length !== uncompressedSize) {
        throw new Error(
          `Unexpected uncompressed size: expected ${uncompressedSize}, got ${data.length} for file ${name}`,
        )
      }

      entries.push({
        name,
        data,
        modTime,
        modDate,
        isDirectory: name.endsWith('/'),
      })

      offset = dataEnd
      continue
    }

    if (signature === CENTRAL_DIRECTORY_SIGNATURE || signature === END_OF_CENTRAL_DIRECTORY_SIGNATURE) {
      break
    }

    throw new Error('Invalid zip structure encountered')
  }

  return { entries }
}

function writeZip(parsed: ParsedZip): Buffer {
  const localParts: Buffer[] = []
  const centralParts: Buffer[] = []

  let offset = 0

  for (const entry of parsed.entries) {
    const fileNameBuffer = Buffer.from(entry.name, 'utf-8')
    const extraField = Buffer.alloc(0)
    const data = entry.data

    const compressedData = entry.isDirectory ? Buffer.alloc(0) : deflateRawSync(data)
    const compressionMethod = entry.isDirectory ? 0 : 8
    const compressedSize = entry.isDirectory ? 0 : compressedData.length
    const uncompressedSize = entry.isDirectory ? 0 : data.length
    const crc = entry.isDirectory ? 0 : crc32(data)

    const localHeader = Buffer.alloc(30)
    localHeader.writeUInt32LE(LOCAL_FILE_HEADER_SIGNATURE, 0)
    localHeader.writeUInt16LE(20, 4)
    localHeader.writeUInt16LE(0, 6)
    localHeader.writeUInt16LE(compressionMethod, 8)
    localHeader.writeUInt16LE(entry.modTime ?? 0, 10)
    localHeader.writeUInt16LE(entry.modDate ?? 0, 12)
    localHeader.writeUInt32LE(crc, 14)
    localHeader.writeUInt32LE(compressedSize, 18)
    localHeader.writeUInt32LE(uncompressedSize, 22)
    localHeader.writeUInt16LE(fileNameBuffer.length, 26)
    localHeader.writeUInt16LE(extraField.length, 28)

    localParts.push(localHeader, fileNameBuffer, extraField, entry.isDirectory ? Buffer.alloc(0) : compressedData)

    const centralHeader = Buffer.alloc(46)
    centralHeader.writeUInt32LE(CENTRAL_DIRECTORY_SIGNATURE, 0)
    centralHeader.writeUInt16LE(0x031e, 4)
    centralHeader.writeUInt16LE(20, 6)
    centralHeader.writeUInt16LE(0, 8)
    centralHeader.writeUInt16LE(compressionMethod, 10)
    centralHeader.writeUInt16LE(entry.modTime ?? 0, 12)
    centralHeader.writeUInt16LE(entry.modDate ?? 0, 14)
    centralHeader.writeUInt32LE(crc, 16)
    centralHeader.writeUInt32LE(compressedSize, 20)
    centralHeader.writeUInt32LE(uncompressedSize, 24)
    centralHeader.writeUInt16LE(fileNameBuffer.length, 28)
    centralHeader.writeUInt16LE(extraField.length, 30)
    centralHeader.writeUInt16LE(0, 32)
    centralHeader.writeUInt16LE(0, 34)
    centralHeader.writeUInt16LE(0, 36)
    centralHeader.writeUInt32LE(0, 38)
    centralHeader.writeUInt32LE(offset, 42)

    centralParts.push(centralHeader, fileNameBuffer, extraField)

    offset += localHeader.length + fileNameBuffer.length + extraField.length + compressedSize
  }

  const centralDirectory = Buffer.concat(centralParts)
  const centralSize = centralDirectory.length
  const centralOffset = offset

  const endRecord = Buffer.alloc(22)
  endRecord.writeUInt32LE(END_OF_CENTRAL_DIRECTORY_SIGNATURE, 0)
  endRecord.writeUInt16LE(0, 4)
  endRecord.writeUInt16LE(0, 6)
  endRecord.writeUInt16LE(parsed.entries.length, 8)
  endRecord.writeUInt16LE(parsed.entries.length, 10)
  endRecord.writeUInt32LE(centralSize, 12)
  endRecord.writeUInt32LE(centralOffset, 16)
  endRecord.writeUInt16LE(0, 20)

  return Buffer.concat([...localParts, centralDirectory, endRecord])
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function normalizeCellValue(value: string): string {
  const escaped = escapeXml(value)
  return escaped.replace(/\r?\n/g, '&#10;')
}

type CellUpdate = {
  ref: string
  value: string
}

function applyCellUpdates(sheetXml: string, updates: CellUpdate[]): string {
  let updatedXml = sheetXml

  for (const update of updates) {
    const { ref, value } = update
    if (!value) {
      continue
    }

    const target = `<c r="${ref}"`
    const startIndex = updatedXml.indexOf(target)
    if (startIndex === -1) {
      continue
    }

    const cursor = updatedXml.indexOf('>', startIndex)
    if (cursor === -1) {
      continue
    }

    let isSelfClosing = false
    let attributesSegment = updatedXml.slice(startIndex + 2, cursor)
    if (attributesSegment.endsWith('/')) {
      isSelfClosing = true
      attributesSegment = attributesSegment.slice(0, -1).trimEnd()
    }

    const attrRegex = /([\w:]+)="([^"]*)"/g
    const attributes: Record<string, string> = {}
    let match: RegExpExecArray | null = attrRegex.exec(attributesSegment)
    while (match) {
      const key = match[1]
      const attributeValue = match[2]
      if (key !== undefined) {
        attributes[key] = attributeValue ?? ''
      }
      match = attrRegex.exec(attributesSegment)
    }

    attributes.t = 'inlineStr'
    const orderedKeys: string[] = []
    if ('r' in attributes) {
      orderedKeys.push('r')
    }
    if ('s' in attributes) {
      orderedKeys.push('s')
    }
    orderedKeys.push('t')
    for (const key of Object.keys(attributes)) {
      if (!orderedKeys.includes(key)) {
        orderedKeys.push(key)
      }
    }

    const attributeString = orderedKeys.map((key) => `${key}="${attributes[key]}"`).join(' ')
    const cellContent = `<c ${attributeString}><is><t xml:space="preserve">${normalizeCellValue(value)}</t></is></c>`

    if (isSelfClosing) {
      updatedXml = `${updatedXml.slice(0, startIndex)}${cellContent}${updatedXml.slice(cursor + 1)}`
      continue
    }

    const closeTag = updatedXml.indexOf('</c>', cursor)
    if (closeTag === -1) {
      continue
    }

    updatedXml = `${updatedXml.slice(0, startIndex)}${cellContent}${updatedXml.slice(closeTag + 4)}`
  }

  return updatedXml
}

type ExportPlanInput = {
  planId: string
  versionId?: string
}

type ExportPlanSuccess = {
  type: 'success'
  buffer: Buffer
  filename: string
}

type ExportPlanFailure = {
  type: 'error'
  message: string
}

export type ExportPlanResult = ExportPlanSuccess | ExportPlanFailure

type WorkbookResult = { type: 'success'; buffer: Buffer } | ExportPlanFailure

type PlanServiceData = {
  serviceType: string
  desiredAmount?: string | null
  desiredLifeByService?: string | null
  achievementPeriod?: string | null
}

type WorkbookData = {
  clientName: string
  clientNameKana?: string | null
  addressLine?: string | null
  postalCode?: string | null
  disability?: string | null
  careLevel?: string | null
  planCreatedAt: Date
  desiredLife?: string | null
  troubles?: string | null
  considerations?: string | null
  services: PlanServiceData[]
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function formatMonth(date: Date): string {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
  }).format(date)
}

function buildAddressLine(data: WorkbookData): string | null {
  const parts = []
  if (data.postalCode) {
    parts.push(`〒${data.postalCode}`)
  }
  if (data.addressLine) {
    parts.push(data.addressLine)
  }
  if (parts.length === 0) {
    return null
  }
  return parts.join('\n')
}

async function generateWorkbook(data: WorkbookData): Promise<WorkbookResult> {
  const templatePath = path.join(process.cwd(), '.agent', 'nakanoku.xlsx')
  const templateBuffer = await fs.readFile(templatePath)
  const zip = readZip(templateBuffer)

  const sheetEntry = zip.entries.find((entry) => entry.name === 'xl/worksheets/sheet1.xml')
  if (!sheetEntry) {
    return { type: 'error', message: 'Excelシートのエントリーが見つかりませんでした。' }
  }

  let sheetXml = sheetEntry.data.toString('utf-8')

  const updates: CellUpdate[] = [
    { ref: 'B3', value: data.clientName },
    { ref: 'C3', value: data.clientNameKana ?? '' },
    { ref: 'G3', value: buildAddressLine(data) ?? '' },
    { ref: 'B4', value: data.disability ?? '' },
    { ref: 'E4', value: data.careLevel ?? '' },
    { ref: 'B6', value: formatDate(data.planCreatedAt) },
    { ref: 'D6', value: formatMonth(data.planCreatedAt) },
    { ref: 'B7', value: data.desiredLife ?? '' },
    { ref: 'B12', value: data.desiredLife ?? '' },
    { ref: 'B14', value: data.troubles ?? '' },
    { ref: 'B17', value: data.troubles ?? '' },
    { ref: 'J17', value: data.considerations ?? '' },
  ]

  const rowOffsets = [20, 24, 28, 32, 36]
  data.services.slice(0, rowOffsets.length).forEach((service, index) => {
    const row = rowOffsets[index]
    updates.push({ ref: `B${row}`, value: data.troubles ?? '' })
    updates.push({ ref: `C${row}`, value: service.desiredLifeByService ?? data.desiredLife ?? '' })
    updates.push({ ref: `E${row}`, value: service.achievementPeriod ?? '' })
    const serviceLabel = service.desiredAmount
      ? `${service.serviceType}（${service.desiredAmount}）`
      : service.serviceType
    updates.push({ ref: `F${row}`, value: serviceLabel })
    updates.push({ ref: `J${row}`, value: service.desiredAmount ?? '' })
  })

  sheetXml = applyCellUpdates(sheetXml, updates)
  sheetEntry.data = Buffer.from(sheetXml, 'utf-8')

  return { type: 'success', buffer: writeZip(zip) }
}

function createFilename(planId: string, createdAt: Date): string {
  const date = createdAt.toISOString().slice(0, 10)
  return `plan-${planId}-${date}.xlsx`
}

export async function exportPlanUseCase(input: ExportPlanInput): Promise<ExportPlanResult> {
  const plan = await prisma.plan.findUnique({
    where: { id: input.planId },
    include: {
      client: {
        include: {
          profile: true,
          addresses: {
            orderBy: { createdAt: 'asc' },
            take: 1,
          },
        },
      },
      versions: {
        orderBy: { versionNumber: 'desc' },
        include: {
          services: {
            orderBy: { createdAt: 'asc' },
          },
        },
      },
    },
  })

  if (!plan) {
    return { type: 'error', message: '計画書が見つかりませんでした。' }
  }

  const targetVersion = input.versionId
    ? plan.versions.find((version) => version.id === input.versionId)
    : plan.versions[0]

  if (!targetVersion) {
    return { type: 'error', message: '出力対象の計画バージョンが存在しません。' }
  }

  const profile = plan.client.profile
  const address = plan.client.addresses?.[0] ?? null

  const addressLine = address
    ? [address.prefecture, address.city, address.street, address.building].filter(Boolean).join('')
    : null

  const workbookData: WorkbookData = {
    clientName: profile?.name ?? '利用者',
    clientNameKana: profile?.nameKana ?? null,
    addressLine,
    postalCode: address?.postalCode ?? null,
    disability: profile?.disability ?? null,
    careLevel: profile?.careLevel ?? null,
    planCreatedAt: targetVersion.createdAt,
    desiredLife: targetVersion.desiredLife ?? null,
    troubles: targetVersion.troubles ?? null,
    considerations: targetVersion.considerations ?? null,
    services: targetVersion.services.map((service) => ({
      serviceType: service.serviceType,
      desiredAmount: service.desiredAmount,
      desiredLifeByService: service.desiredLifeByService,
      achievementPeriod: service.achievementPeriod,
    })),
  }

  const workbookResult = await generateWorkbook(workbookData)
  if (workbookResult.type === 'error') {
    return workbookResult
  }

  return {
    type: 'success',
    buffer: workbookResult.buffer,
    filename: createFilename(plan.id, targetVersion.createdAt),
  }
}
