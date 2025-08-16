import type { Client } from './model'

export interface ClientRepository {
  save(client: Client): Promise<void>
  findById(id: string): Promise<Client | null>
  findByUserId(userId: string): Promise<Client | null>
}
