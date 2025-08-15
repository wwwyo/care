import type { PrismaConfig } from 'prisma'

export default {
  migrations: {
    seed: 'bun run prisma/seed.ts',
  },
} satisfies PrismaConfig
