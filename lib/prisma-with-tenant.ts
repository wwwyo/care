import type { Prisma, PrismaClient } from '@/lib/generated/prisma/client'
import { prisma } from '@/lib/prisma'

/**
 * テナントIDを設定してPrismaクライアントを使用するヘルパー
 * RLSでテナント分離を実現するため、各クエリ実行前にテナントIDを設定
 */
export async function prismaWithTenant<T>(
  tenantId: string,
  fn: (prisma: PrismaClient) => Promise<T>,
): Promise<T> {
  // PostgreSQLのセッション変数にテナントIDを設定
  await prisma.$executeRaw`SET LOCAL app.current_tenant_id = ${tenantId}`

  try {
    // 実際のクエリを実行
    return await fn(prisma)
  } finally {
    // セッション変数をリセット（オプション）
    await prisma.$executeRaw`RESET app.current_tenant_id`
  }
}

/**
 * トランザクション内でテナントIDを設定する場合
 */
export async function prismaTransactionWithTenant<T>(
  tenantId: string,
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    // トランザクション内でテナントIDを設定
    await tx.$executeRaw`SET LOCAL app.current_tenant_id = ${tenantId}`
    return fn(tx)
  })
}

// 使用例：
// const supporters = await prismaWithTenant(tenantId, async (prisma) => {
//   return prisma.supporter.findMany();
// });

// トランザクションの例：
// const result = await prismaTransactionWithTenant(tenantId, async (tx) => {
//   const supporter = await tx.supporter.create({ data: { ... } });
//   const plan = await tx.plan.create({ data: { ... } });
//   return { supporter, plan };
// });
