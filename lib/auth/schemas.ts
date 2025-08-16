import { z } from 'zod'

// realm定数の定義
export const USER_REALMS = {
  SUPPORTER: 'supporter',
  FACILITY_STAFF: 'facility_staff',
} as const

// ユーザータイプの定義
export const userRealmSchema = z.enum([USER_REALMS.SUPPORTER, USER_REALMS.FACILITY_STAFF])
export type UserRealm = z.infer<typeof userRealmSchema>
