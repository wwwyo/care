import type { Plan } from './model'

export type PlanRepositoryError =
  | { type: 'NotFound'; message: string }
  | { type: 'ConflictError'; message: string }
  | { type: 'UnknownError'; message: string }

export interface PlanRepository {
  save(plan: Plan): Promise<undefined | PlanRepositoryError>
  delete(id: string): Promise<undefined | PlanRepositoryError>
  findById(id: string): Promise<Plan | PlanRepositoryError>
  findByClientId(clientId: string): Promise<Plan[] | PlanRepositoryError>
}
