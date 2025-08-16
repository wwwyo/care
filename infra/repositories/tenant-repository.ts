import { prisma } from '@/lib/prisma'

export type Tenant = {
  id: string
  name: string
}

export async function getOrCreateDefaultTenant(): Promise<Tenant> {
  let tenant = await prisma.tenant.findFirst({
    where: { name: 'デフォルト組織' },
  })

  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: 'デフォルト組織',
      },
    })
  }

  return {
    id: tenant.id,
    name: tenant.name,
  }
}
