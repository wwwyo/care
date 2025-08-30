import type { Inquiry } from './inquiry'

export interface InquiryRepository {
  save(inquiry: Inquiry): Promise<Inquiry>
  findById(id: string): Promise<Inquiry | null>
  findByPlanId(planId: string): Promise<Inquiry[]>
}
