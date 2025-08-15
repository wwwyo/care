import { z } from 'zod'

// ユーザータイプの定義
export const userRealmSchema = z.enum(['client', 'supporter', 'facility'])
export type UserRealm = z.infer<typeof userRealmSchema>
