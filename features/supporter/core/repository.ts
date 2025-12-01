import type { Supporter } from './model'

export interface SupporterRepository {
  save(supporter: Supporter): Promise<void>
  findById(id: string): Promise<Supporter | null>
  findByUserId(userId: string): Promise<Supporter | null>
}
