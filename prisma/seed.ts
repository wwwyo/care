import { prisma } from '@/lib/prisma'

function generateId(): string {
  return crypto.randomUUID()
}

async function main() {
  // 既存データをクリア
  await prisma.$transaction([
    prisma.audit.deleteMany(),
    prisma.inquiryReply.deleteMany(),
    prisma.inquiryMessage.deleteMany(),
    prisma.inquiry.deleteMany(),
    prisma.consentGrant.deleteMany(),
    prisma.consent.deleteMany(),
    prisma.supporterAvailabilityNote.deleteMany(),
    prisma.planService.deleteMany(),
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
    prisma.clientUser.deleteMany(),
    prisma.hearingTranscript.deleteMany(),
    prisma.hearingMemo.deleteMany(),
    prisma.supporterProfile.deleteMany(),
    prisma.facility.deleteMany(),
    prisma.client.deleteMany(),
    prisma.invitation.deleteMany(),
    prisma.member.deleteMany(),
    prisma.organization.deleteMany(),
    prisma.verification.deleteMany(),
    prisma.account.deleteMany(),
    prisma.session.deleteMany(),
    prisma.user.deleteMany(),
  ])

  // Organization作成
  const organization1 = await prisma.organization.create({
    data: {
      id: generateId(),
      name: 'テスト事業所A',
      slug: 'test-org-a',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })

  const organization2 = await prisma.organization.create({
    data: {
      id: generateId(),
      name: 'テスト事業所B',
      slug: 'test-org-b',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })

  // Better Auth用のUserを作成（Supporter）
  const userSupporter1 = await prisma.user.create({
    data: {
      id: generateId(),
      name: '山田太郎',
      email: 'yamada@example.com',
      emailVerified: true,
      realm: 'supporter',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })

  const userSupporter2 = await prisma.user.create({
    data: {
      id: generateId(),
      name: '佐藤花子',
      email: 'sato@example.com',
      emailVerified: true,
      realm: 'supporter',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })

  // MemberでOrganizationとUserを関連付け
  await prisma.member.create({
    data: {
      id: generateId(),
      organizationId: organization1.id,
      userId: userSupporter1.id,
      role: 'owner',
      createdAt: new Date(),
    },
  })

  await prisma.member.create({
    data: {
      id: generateId(),
      organizationId: organization2.id,
      userId: userSupporter2.id,
      role: 'owner',
      createdAt: new Date(),
    },
  })

  // SupporterProfile作成
  await prisma.supporterProfile.create({
    data: {
      userId: userSupporter1.id,
      name: '山田太郎',
      nameKana: 'ヤマダタロウ',
      gender: '男性',
      birthDate: new Date('1980-01-01'),
      phone: '090-1234-5678',
    },
  })

  await prisma.supporterProfile.create({
    data: {
      userId: userSupporter2.id,
      name: '佐藤花子',
      nameKana: 'サトウハナコ',
      gender: '女性',
      birthDate: new Date('1985-05-15'),
      phone: '090-8765-4321',
    },
  })

  // 利用者作成
  const client1 = await prisma.client.create({
    data: {
      organizationId: organization1.id,
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

  const client2 = await prisma.client.create({
    data: {
      organizationId: organization2.id,
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

  // 利用者とユーザーの関連付け（ClientUser）
  await prisma.clientUser.create({
    data: {
      clientId: client1.id,
      userId: userSupporter1.id,
    },
  })

  await prisma.clientUser.create({
    data: {
      clientId: client2.id,
      userId: userSupporter2.id,
    },
  })

  // client1には複数のサポーターを割り当て
  await prisma.clientUser.create({
    data: {
      clientId: client1.id,
      userId: userSupporter2.id,
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
          addressCity: '東京都千代田区',
          addressDetail: '千代田1-1',
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
        create: [{ serviceType: 'DAILY_LIFE_SUPPORT' }, { serviceType: 'EMPLOYMENT_SUPPORT_B' }],
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
          addressCity: '神奈川県横浜市中区',
          addressDetail: '本町3-3',
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
        create: [{ serviceType: 'EMPLOYMENT_SUPPORT_A' }, { serviceType: 'EMPLOYMENT_SUPPORT_B' }],
      },
      conditions: {
        create: [
          { conditionType: 'wheelchair_accessible', conditionValue: 'false' },
          { conditionType: 'has_pickup', conditionValue: 'false' },
        ],
      },
    },
  })

  // プラン作成
  const plan1 = await prisma.plan.create({
    data: {
      organizationId: organization1.id,
      clientId: client1.id,
      status: 'active',
    },
  })

  const plan2 = await prisma.plan.create({
    data: {
      organizationId: organization2.id,
      clientId: client2.id,
      status: 'draft',
    },
  })

  // プランバージョン作成
  const planVersion1 = await prisma.planVersion.create({
    data: {
      planId: plan1.id,
      versionNumber: 1,
      versionType: 'draft',
      desiredLife: '地域で自立した生活を送りたい',
      troubles: '日常生活での身体介助が必要。移動に車椅子を使用。',
      considerations: '医療的ケアが必要な場合があります。',
      createdBy: userSupporter1.id,
      reasonForUpdate: '初回作成',
      services: {
        create: [
          {
            serviceCategory: 'daytime',
            serviceType: '生活介護',
            desiredAmount: '週3日',
            desiredLifeByService: '日中活動を通じて生活リズムを整える',
            achievementPeriod: '6ヶ月',
          },
          {
            serviceCategory: 'home',
            serviceType: '居宅介護',
            desiredAmount: '週2回',
            desiredLifeByService: '自宅での安定した生活を維持する',
            achievementPeriod: '継続',
          },
        ],
      },
      accessibilityRequirements: {
        create: [
          { requirementType: 'wheelchair', details: '車椅子での移動が必要' },
          { requirementType: 'pickup', details: '送迎サービスが必要' },
        ],
      },
    },
  })

  // 相談員側空き状況メモ
  await prisma.supporterAvailabilityNote.create({
    data: {
      facilityId: facility1.id,
      userId: userSupporter1.id,
      planId: plan1.id,
      clientId: client1.id,
      status: 'limited',
      intent: 'pre_inquiry',
      note: '受入条件について面談予定。医療的ケアは条件付きで可とのこと。',
      contextSummary: '医療的ケアは条件付き対応',
      contextDetails: [],
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  })

  // プランバージョン作成（プラン2用）
  const planVersion2 = await prisma.planVersion.create({
    data: {
      planId: plan2.id,
      versionNumber: 1,
      versionType: 'draft',
      desiredLife: '就労を通じて社会参加したい',
      troubles: '一般就労が困難な状況。作業能力の向上が必要。',
      considerations: '集中力の持続が困難な場合があります。',
      createdBy: userSupporter2.id,
      reasonForUpdate: '初回作成',
      services: {
        create: [
          {
            serviceCategory: 'daytime',
            serviceType: '就労継続支援B型',
            desiredAmount: '週5日',
            desiredLifeByService: '作業能力の向上と就労意欲の維持',
            achievementPeriod: '1年',
          },
          {
            serviceCategory: 'other',
            serviceType: '相談支援',
            desiredAmount: '月1回',
            desiredLifeByService: '定期的な相談による生活の安定',
            achievementPeriod: '継続',
          },
        ],
      },
      accessibilityRequirements: {
        create: [{ requirementType: 'no_stairs', details: '階段の昇降が困難' }],
      },
    },
  })

  await prisma.supporterAvailabilityNote.create({
    data: {
      facilityId: facility2.id,
      userId: userSupporter2.id,
      planId: plan2.id,
      clientId: client2.id,
      status: 'unavailable',
      intent: 'post_meeting',
      note: '現在は満床だが、来月以降空きが出るかもしれないとの回答。',
      contextSummary: '満床だが翌月に空き予定',
      contextDetails: [],
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  })

  // 現在のバージョンを設定
  await prisma.plan.update({
    where: { id: plan1.id },
    data: { currentVersionId: planVersion1.id },
  })

  await prisma.plan.update({
    where: { id: plan2.id },
    data: { currentVersionId: planVersion2.id },
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
