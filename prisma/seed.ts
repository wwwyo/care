import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  // 既存データをクリア
  await prisma.$transaction([
    prisma.audit.deleteMany(),
    prisma.inquiryReply.deleteMany(),
    prisma.inquiryMessage.deleteMany(),
    prisma.inquiry.deleteMany(),
    prisma.consentGrant.deleteMany(),
    prisma.consent.deleteMany(),
    prisma.slotDetail.deleteMany(),
    prisma.slot.deleteMany(),
    prisma.planCustomField.deleteMany(),
    prisma.planAccessibilityRequirement.deleteMany(),
    prisma.planVersion.deleteMany(),
    prisma.plan.deleteMany(),
    prisma.facilityCondition.deleteMany(),
    prisma.facilityService.deleteMany(),
    prisma.facilityContact.deleteMany(),
    prisma.facilityLocation.deleteMany(),
    prisma.facilityProfile.deleteMany(),
    prisma.clientAddress.deleteMany(),
    prisma.clientProfile.deleteMany(),
    prisma.supporterProfile.deleteMany(),
    prisma.facilityStaffRole.deleteMany(),
    prisma.facilityStaffFacility.deleteMany(),
    prisma.facilityStaff.deleteMany(),
    prisma.facility.deleteMany(),
    prisma.user.deleteMany(),
    prisma.supporter.deleteMany(),
    prisma.tenant.deleteMany(),
  ])

  // テナント作成
  const tenant1 = await prisma.tenant.create({
    data: {
      name: 'テスト事業所A',
    },
  })

  const tenant2 = await prisma.tenant.create({
    data: {
      name: 'テスト事業所B',
    },
  })

  // サポーター作成
  const supporter1 = await prisma.supporter.create({
    data: {
      tenantId: tenant1.id,
      profile: {
        create: {
          name: '山田太郎',
          nameKana: 'ヤマダタロウ',
          gender: '男性',
          birthDate: new Date('1980-01-01'),
          phone: '090-1234-5678',
        },
      },
    },
  })

  const supporter2 = await prisma.supporter.create({
    data: {
      tenantId: tenant2.id,
      profile: {
        create: {
          name: '佐藤花子',
          nameKana: 'サトウハナコ',
          gender: '女性',
          birthDate: new Date('1985-05-15'),
          phone: '090-8765-4321',
        },
      },
    },
  })

  // ユーザー作成
  const user1 = await prisma.user.create({
    data: {
      profile: {
        create: {
          name: '田中一郎',
          nameKana: 'タナカイチロウ',
          gender: '男性',
          birthDate: new Date('1995-03-20'),
          phone: '080-1111-2222',
        },
      },
      addresses: {
        create: {
          postalCode: '123-4567',
          prefecture: '東京都',
          city: '新宿区',
          street: '西新宿1-1-1',
          building: 'テストビル101',
        },
      },
    },
  })

  const user2 = await prisma.user.create({
    data: {
      profile: {
        create: {
          name: '鈴木二郎',
          nameKana: 'スズキジロウ',
          gender: '男性',
          birthDate: new Date('1990-07-10'),
          phone: '080-3333-4444',
        },
      },
      addresses: {
        create: {
          postalCode: '234-5678',
          prefecture: '神奈川県',
          city: '横浜市',
          street: '中区本町2-2-2',
        },
      },
    },
  })

  // 施設作成
  const facility1 = await prisma.facility.create({
    data: {
      profile: {
        create: {
          name: 'あさひケアセンター',
          nameKana: 'アサヒケアセンター',
          description: '地域に根ざした生活介護施設です。',
          capacity: 20,
        },
      },
      location: {
        create: {
          postalCode: '100-0001',
          prefecture: '東京都',
          city: '千代田区',
          street: '千代田1-1',
          latitude: 35.6762,
          longitude: 139.6503,
        },
      },
      contacts: {
        create: [
          {
            contactType: 'main',
            name: '施設担当者',
            phone: '03-1234-5678',
            email: 'info@asahi-care.jp',
          },
          {
            contactType: 'emergency',
            name: '緊急連絡先',
            phone: '03-1234-5679',
          },
        ],
      },
      services: {
        create: [{ serviceType: '生活介護' }, { serviceType: '就労継続支援B型' }],
      },
      conditions: {
        create: [
          { conditionType: 'wheelchair_accessible', conditionValue: 'true' },
          { conditionType: 'has_pickup', conditionValue: 'true' },
        ],
      },
    },
  })

  const facility2 = await prisma.facility.create({
    data: {
      profile: {
        create: {
          name: 'みどり作業所',
          nameKana: 'ミドリサギョウショ',
          description: '就労支援を中心とした施設です。',
          capacity: 15,
        },
      },
      location: {
        create: {
          postalCode: '231-0001',
          prefecture: '神奈川県',
          city: '横浜市中区',
          street: '本町3-3',
          latitude: 35.4437,
          longitude: 139.638,
        },
      },
      contacts: {
        create: {
          contactType: 'main',
          name: '施設管理者',
          phone: '045-234-5678',
          email: 'contact@midori-work.jp',
        },
      },
      services: {
        create: [{ serviceType: '就労継続支援A型' }, { serviceType: '就労継続支援B型' }],
      },
      conditions: {
        create: [
          { conditionType: 'wheelchair_accessible', conditionValue: 'false' },
          { conditionType: 'has_pickup', conditionValue: 'false' },
        ],
      },
    },
  })

  // 施設スタッフ作成
  const facilityStaff1 = await prisma.facilityStaff.create({
    data: {
      facilities: {
        create: {
          facilityId: facility1.id,
        },
      },
      roles: {
        create: {
          facilityId: facility1.id,
          role: 'admin',
        },
      },
    },
  })

  // 空き状況作成
  await prisma.slot.create({
    data: {
      facilityId: facility1.id,
      status: 'open',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30日後
      updatedBy: facilityStaff1.id,
      details: {
        create: [
          { detailType: 'available_days', detailValue: '月水金' },
          { detailType: 'time_slot', detailValue: '9:00-16:00' },
        ],
      },
    },
  })

  await prisma.slot.create({
    data: {
      facilityId: facility2.id,
      status: 'limited',
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14日後
      updatedBy: facilityStaff1.id,
      details: {
        create: {
          detailType: 'note',
          detailValue: '残り2名まで受け入れ可能',
        },
      },
    },
  })

  // プラン作成
  const plan1 = await prisma.plan.create({
    data: {
      tenantId: tenant1.id,
      supporterId: supporter1.id,
      userId: user1.id,
      status: 'active',
    },
  })

  // プランバージョン作成
  const planVersion1 = await prisma.planVersion.create({
    data: {
      planId: plan1.id,
      versionNumber: 1,
      serviceType: '生活介護',
      frequency: '週3日',
      area: '東京都内',
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1年後
      notes: '初回のケアプランです。',
      createdBy: supporter1.id,
      accessibilityRequirements: {
        create: [
          { requirementType: 'wheelchair', details: '車椅子での移動が必要' },
          { requirementType: 'pickup', details: '送迎サービスが必要' },
        ],
      },
    },
  })

  // 現在のバージョンを設定
  await prisma.plan.update({
    where: { id: plan1.id },
    data: { currentVersionId: planVersion1.id },
  })

  console.log('シードデータの作成が完了しました。')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
