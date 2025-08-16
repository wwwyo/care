import type { Client } from './model'

export interface ClientRepository {
  save(client: Client): Promise<void>
  findById(id: string): Promise<Client | null>
  findBySupporterId(supporterId: string): Promise<Client[]>
}
