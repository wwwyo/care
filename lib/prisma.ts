import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/lib/generated/prisma/client'
import { serverEnv } from './env/server'

const adapter = new PrismaPg({
  connectionString: serverEnv.DATABASE_URL,
})
export const prisma = new PrismaClient({ adapter })
