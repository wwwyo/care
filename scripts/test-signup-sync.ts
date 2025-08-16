import { USER_REALMS } from '@/lib/auth/schemas'
import { prisma } from '@/lib/prisma'

async function testSignupSync() {
  console.log('🧪 サインアップ同期機能のテストを開始します...\n')

  // テスト用のユーザーデータ
  const testUsers = [
    {
      id: 'test-supporter-' + Date.now(),
      name: 'テスト支援者',
      email: `test-supporter-${Date.now()}@example.com`,
      emailVerified: true,
      realm: USER_REALMS.SUPPORTER,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'test-client-' + Date.now(),
      name: 'テスト利用者',
      email: `test-client-${Date.now()}@example.com`,
      emailVerified: true,
      realm: USER_REALMS.CLIENT,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'test-staff-' + Date.now(),
      name: 'テスト施設スタッフ',
      email: `test-staff-${Date.now()}@example.com`,
      emailVerified: true,
      realm: USER_REALMS.FACILITY_STAFF,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  // デフォルトテナントの確認または作成
  let defaultTenant = await prisma.tenant.findFirst({
    where: { name: 'デフォルト組織' },
  })

  if (!defaultTenant) {
    console.log('📝 デフォルトテナントを作成します...')
    defaultTenant = await prisma.tenant.create({
      data: {
        name: 'デフォルト組織',
      },
    })
    console.log('✅ デフォルトテナントを作成しました\n')
  }

  // 各ロールのユーザーを作成してテスト
  for (const userData of testUsers) {
    console.log(`📝 ${userData.realm} ユーザーを作成します...`)
    console.log(`   Email: ${userData.email}`)

    try {
      // ユーザーを作成
      const user = await prisma.user.create({
        data: userData,
      })

      // auth.tsのonCreateロジックをシミュレート
      if (user.realm === USER_REALMS.SUPPORTER) {
        await prisma.supporter.create({
          data: {
            userId: user.id,
            tenantId: defaultTenant.id,
          },
        })

        // 作成されたことを確認
        const supporter = await prisma.supporter.findFirst({
          where: { userId: user.id },
        })

        if (supporter) {
          console.log(`✅ Supporterテーブルへの同期成功`)
          console.log(`   Supporter ID: ${supporter.id}`)
          console.log(`   Tenant ID: ${supporter.tenantId}\n`)
        }
      } else if (user.realm === USER_REALMS.CLIENT) {
        await prisma.client.create({
          data: {
            userId: user.id,
          },
        })

        // 作成されたことを確認
        const client = await prisma.client.findFirst({
          where: { userId: user.id },
        })

        if (client) {
          console.log(`✅ Clientテーブルへの同期成功`)
          console.log(`   Client ID: ${client.id}\n`)
        }
      } else if (user.realm === USER_REALMS.FACILITY_STAFF) {
        await prisma.facilityStaff.create({
          data: {
            userId: user.id,
          },
        })

        // 作成されたことを確認
        const facilityStaff = await prisma.facilityStaff.findFirst({
          where: { userId: user.id },
        })

        if (facilityStaff) {
          console.log(`✅ FacilityStaffテーブルへの同期成功`)
          console.log(`   FacilityStaff ID: ${facilityStaff.id}\n`)
        }
      }
    } catch (error) {
      console.error(`❌ エラーが発生しました:`, error)
    }
  }

  // 統計情報を表示
  console.log('📊 データベースの統計情報:')
  const userCount = await prisma.user.count()
  const supporterCount = await prisma.supporter.count()
  const clientCount = await prisma.client.count()
  const facilityStaffCount = await prisma.facilityStaff.count()

  console.log(`   総ユーザー数: ${userCount}`)
  console.log(`   支援者数: ${supporterCount}`)
  console.log(`   利用者数: ${clientCount}`)
  console.log(`   施設スタッフ数: ${facilityStaffCount}`)

  console.log('\n✅ テストが完了しました')
}

testSignupSync()
  .catch((e) => {
    console.error('❌ テストが失敗しました:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
