#!/usr/bin/env bun

/**
 * WAM CSVデータからfacilityデータをインポートするスクリプト
 *
 * 使用方法:
 * bun scripts/import-wam-facilities.ts <csv-path> [--prefecture=都道府県名]
 *
 * 例:
 * bun scripts/import-wam-facilities.ts ./opendata/hokkaido.csv
 * bun scripts/import-wam-facilities.ts ./opendata/all.csv --prefecture=北海道
 */

import fs from 'node:fs'
import { parse } from 'csv-parse/sync'
import { prisma } from '@/lib/prisma'

// 都道府県コードから都道府県名へのマッピング
const PREFECTURE_CODE_MAP: Record<string, string> = {
  '01': '北海道',
  '02': '青森県',
  '03': '岩手県',
  '04': '宮城県',
  '05': '秋田県',
  '06': '山形県',
  '07': '福島県',
  '08': '茨城県',
  '09': '栃木県',
  '10': '群馬県',
  '11': '埼玉県',
  '12': '千葉県',
  '13': '東京都',
  '14': '神奈川県',
  '15': '新潟県',
  '16': '富山県',
  '17': '石川県',
  '18': '福井県',
  '19': '山梨県',
  '20': '長野県',
  '21': '岐阜県',
  '22': '静岡県',
  '23': '愛知県',
  '24': '三重県',
  '25': '滋賀県',
  '26': '京都府',
  '27': '大阪府',
  '28': '兵庫県',
  '29': '奈良県',
  '30': '和歌山県',
  '31': '鳥取県',
  '32': '島根県',
  '33': '岡山県',
  '34': '広島県',
  '35': '山口県',
  '36': '徳島県',
  '37': '香川県',
  '38': '愛媛県',
  '39': '高知県',
  '40': '福岡県',
  '41': '佐賀県',
  '42': '長崎県',
  '43': '熊本県',
  '44': '大分県',
  '45': '宮崎県',
  '46': '鹿児島県',
  '47': '沖縄県',
}

// サービス種別の日本語→英語コードマッピング
const SERVICE_TYPE_MAP: Record<string, string> = {
  居宅介護: 'HOME_CARE',
  重度訪問介護: 'VISITING_CARE_SEVERE',
  同行援護: 'ACCOMPANIMENT',
  行動援護: 'BEHAVIOR_SUPPORT',
  重度障害者等包括支援: 'COMPREHENSIVE_SUPPORT_SEVERE',
  療養介護: 'MEDICAL_CARE',
  生活介護: 'DAILY_LIFE_SUPPORT',
  短期入所: 'SHORT_STAY',
  施設入所支援: 'FACILITY_ADMISSION',
  共同生活援助: 'GROUP_HOME',
  自立生活援助: 'INDEPENDENT_LIFE_SUPPORT',
  '自立訓練（機能訓練）': 'FUNCTIONAL_TRAINING',
  '自立訓練（生活訓練）': 'LIFE_TRAINING',
  宿泊型自立訓練: 'RESIDENTIAL_TRAINING',
  就労移行支援: 'EMPLOYMENT_TRANSITION',
  就労継続支援A型: 'EMPLOYMENT_SUPPORT_A',
  就労継続支援B型: 'EMPLOYMENT_SUPPORT_B',
  就労定着支援: 'EMPLOYMENT_RETENTION',
  '地域相談支援（地域移行支援）': 'COMMUNITY_TRANSITION_SUPPORT',
  '地域相談支援（地域定着支援）': 'COMMUNITY_SETTLEMENT_SUPPORT',
  計画相談支援: 'PLAN_CONSULTATION_SUPPORT',
  障害児相談支援: 'DISABLED_CHILD_CONSULTATION_SUPPORT',
}

type CSVRow = {
  prefectureCode: string
  wamId: string
  designatedOrg: string
  corporationName: string
  corporationNameKana: string
  corporationNumber: string
  corporationCity: string
  corporationDetail: string
  corporationPhone: string
  corporationFax: string
  corporationUrl: string
  serviceType: string
  facilityName: string
  facilityNameKana: string
  officialId: string
  facilityCity: string
  facilityDetail: string
  facilityPhone: string
  facilityFax: string
  facilityUrl: string
  latitude: string
  longitude: string
  weekdayHours: string
  saturdayHours: string
  sundayHours: string
  holidayHours: string
  regularHolidays: string
  specialNotes: string
  capacity: string
}

type ImportResult = {
  success: number
  failed: number
  skipped: number
  errors: Array<{ row: number; wamId: string; error: string }>
}

function parseCSV(filePath: string): CSVRow[] {
  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const records = parse(fileContent, {
    columns: [
      'prefectureCode',
      'wamId',
      'designatedOrg',
      'corporationName',
      'corporationNameKana',
      'corporationNumber',
      'corporationCity',
      'corporationDetail',
      'corporationPhone',
      'corporationFax',
      'corporationUrl',
      'serviceType',
      'facilityName',
      'facilityNameKana',
      'officialId',
      'facilityCity',
      'facilityDetail',
      'facilityPhone',
      'facilityFax',
      'facilityUrl',
      'latitude',
      'longitude',
      'weekdayHours',
      'saturdayHours',
      'sundayHours',
      'holidayHours',
      'regularHolidays',
      'specialNotes',
      'capacity',
    ],
    skip_empty_lines: true,
    from_line: 2, // ヘッダー行をスキップ
  }) as CSVRow[]
  return records
}

function getPrefectureName(code: string): string | null {
  // 都道府県コードまたは市区町村コードから都道府県を抽出
  const prefectureCode = code.substring(0, 2)
  return PREFECTURE_CODE_MAP[prefectureCode] || null
}

function mapServiceType(japaneseType: string): string | null {
  return SERVICE_TYPE_MAP[japaneseType] || null
}

async function importFacility(row: CSVRow, _rowIndex: number): Promise<void> {
  // サービス種別のマッピング
  const serviceTypeCode = mapServiceType(row.serviceType)
  if (!serviceTypeCode) {
    throw new Error(`Unknown service type: ${row.serviceType}`)
  }

  // 法人番号で既存の法人を検索または作成
  let corporationId: string | null = null
  if (row.corporationNumber) {
    const existingCorp = await prisma.facilityCorporation.findUnique({
      where: { corporateNumber: row.corporationNumber },
    })

    if (existingCorp) {
      corporationId = existingCorp.id
    } else {
      const newCorp = await prisma.facilityCorporation.create({
        data: {
          name: row.corporationName,
          nameKana: row.corporationNameKana || null,
          corporateNumber: row.corporationNumber,
          postalCode: null,
          addressCity: row.corporationCity || null,
          addressDetail: row.corporationDetail || null,
          phone: row.corporationPhone || null,
          fax: row.corporationFax || null,
          url: row.corporationUrl || null,
        },
      })
      corporationId = newCorp.id
    }
  }

  // WAM IDで既存施設を検索
  const existingFacility = await prisma.facilityProfile.findFirst({
    where: { wamId: row.wamId },
  })

  if (existingFacility) {
    console.log(`  Skipping existing facility: ${row.facilityName} (WAM ID: ${row.wamId})`)
    throw new Error('SKIPPED')
  }

  // 施設データを作成
  const facility = await prisma.facility.create({
    data: {
      profile: {
        create: {
          name: row.facilityName,
          nameKana: row.facilityNameKana || null,
          description: null,
          capacity: row.capacity ? Number.parseInt(row.capacity, 10) : null,
          wamId: row.wamId,
          officialId: row.officialId || null,
          corporationId,
        },
      },
      location: {
        create: {
          postalCode: null,
          addressCity: row.facilityCity || null,
          addressDetail: row.facilityDetail || null,
          building: null,
          latitude: row.latitude ? Number.parseFloat(row.latitude) : null,
          longitude: row.longitude ? Number.parseFloat(row.longitude) : null,
          accessInfo: null,
        },
      },
      contacts: {
        create: {
          contactType: 'main',
          name: null,
          phone: row.facilityPhone || null,
          fax: row.facilityFax || null,
          email: null,
          website: row.facilityUrl || null,
        },
      },
      services: {
        create: {
          serviceType: serviceTypeCode as never,
        },
      },
      businessHours: {
        create: {
          weekdayHours: row.weekdayHours || null,
          saturdayHours: row.saturdayHours || null,
          sundayHours: row.sundayHours || null,
          holidayHours: row.holidayHours || null,
          regularHolidays: row.regularHolidays || null,
        },
      },
    },
  })

  console.log(`  ✓ Imported: ${row.facilityName} (ID: ${facility.id})`)
}

async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.error(
      'Usage: bun scripts/import-wam-facilities.ts <csv-path> [--prefecture=都道府県名]',
    )
    console.error('')
    console.error('Examples:')
    console.error('  bun scripts/import-wam-facilities.ts ./opendata/hokkaido.csv')
    console.error('  bun scripts/import-wam-facilities.ts ./opendata/all.csv --prefecture=北海道')
    process.exit(1)
  }

  const csvPath = args[0]
  if (!csvPath) {
    console.error('Error: CSV path is required')
    process.exit(1)
  }

  const prefectureFilter = args.find((arg) => arg.startsWith('--prefecture='))?.split('=')[1]

  if (!fs.existsSync(csvPath)) {
    console.error(`Error: File not found: ${csvPath}`)
    process.exit(1)
  }

  console.log('🚀 Starting WAM facility import...')
  console.log(`📁 CSV file: ${csvPath}`)
  if (prefectureFilter) {
    console.log(`🗺️  Prefecture filter: ${prefectureFilter}`)
  }
  console.log('')

  const result: ImportResult = {
    success: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  }

  try {
    const rows = parseCSV(csvPath)
    console.log(`📊 Total rows: ${rows.length}`)
    console.log('')

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      if (!row) continue

      const rowNumber = i + 2 // CSVの行番号（ヘッダー含む）

      // 都道府県フィルター
      if (prefectureFilter) {
        const prefecture = getPrefectureName(row.prefectureCode)
        if (prefecture !== prefectureFilter) {
          continue
        }
      }

      try {
        await importFacility(row, rowNumber)
        result.success++
      } catch (error) {
        if (error instanceof Error && error.message === 'SKIPPED') {
          result.skipped++
        } else {
          result.failed++
          const errorMessage = error instanceof Error ? error.message : String(error)
          result.errors.push({
            row: rowNumber,
            wamId: row.wamId,
            error: errorMessage,
          })
          console.error(`  ✗ Error at row ${rowNumber} (WAM ID: ${row.wamId}): ${errorMessage}`)
        }
      }
    }
  } catch (error) {
    console.error('Fatal error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }

  console.log('')
  console.log('📈 Import Summary:')
  console.log(`  ✓ Success: ${result.success}`)
  console.log(`  ⊘ Skipped: ${result.skipped}`)
  console.log(`  ✗ Failed:  ${result.failed}`)
  console.log('')

  if (result.errors.length > 0) {
    console.log('❌ Failed imports:')
    for (const error of result.errors) {
      console.log(`  Row ${error.row} (WAM ID: ${error.wamId}): ${error.error}`)
    }
    console.log('')
  }

  console.log('✅ Import completed!')
}

main().catch((error) => {
  console.error('Unexpected error:', error)
  process.exit(1)
})
