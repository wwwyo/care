import { Client, type ClientData, isClient } from '@/domain/client/model'
import { prisma } from '@/lib/prisma'

export async function getClientById(id: string, tenantId: string): Promise<Client | null> {
  const clientRecord = await prisma.client.findFirst({
    where: {
      id,
      tenantId,
    },
    include: {
      profile: true,
      addresses: true,
    },
  })

  if (!clientRecord || !clientRecord.profile) {
    return null
  }

  const address = clientRecord.addresses[0]
  if (!address) {
    return null
  }

  const clientData: ClientData = {
    id: clientRecord.id,
    tenantId: clientRecord.tenantId,
    name: clientRecord.profile.name,
    birthDate: clientRecord.profile.birthDate || new Date(),
    gender: (clientRecord.profile.gender || 'other') as 'male' | 'female' | 'other',
    address: {
      postalCode: address.postalCode || undefined,
      prefecture: address.prefecture || '',
      city: address.city || '',
      street: address.street || '',
      building: address.building || undefined,
    },
    phoneNumber: clientRecord.profile.phone || '',
    emergencyContact: {
      name: clientRecord.profile.emergencyContactName || '',
      relationship: clientRecord.profile.emergencyContactRelation || '',
      phoneNumber: clientRecord.profile.emergencyContactPhone || '',
    },
    disability: clientRecord.profile.disability || undefined,
    careLevel: clientRecord.profile.careLevel || undefined,
    notes: clientRecord.profile.notes || undefined,
    createdAt: clientRecord.createdAt,
    updatedAt: clientRecord.updatedAt,
  }

  const client = Client.fromData(clientData)
  return isClient(client) ? client : null
}

export async function getAllClients(
  tenantId: string,
  options?: { limit?: number; offset?: number },
): Promise<Client[]> {
  const clientRecords = await prisma.client.findMany({
    where: { tenantId },
    include: {
      profile: true,
      addresses: true,
    },
    take: options?.limit,
    skip: options?.offset,
    orderBy: { createdAt: 'desc' },
  })

  const clients: Client[] = []

  for (const record of clientRecords) {
    if (!record.profile || record.addresses.length === 0) {
      continue
    }

    const address = record.addresses[0]
    const clientData: ClientData = {
      id: record.id,
      tenantId: record.tenantId,
      name: record.profile.name,
      birthDate: record.profile.birthDate || new Date(),
      gender: (record.profile.gender || 'other') as 'male' | 'female' | 'other',
      address: {
        postalCode: address?.postalCode || undefined,
        prefecture: address?.prefecture || '',
        city: address?.city || '',
        street: address?.street || '',
        building: address?.building || undefined,
      },
      phoneNumber: record.profile.phone || '',
      emergencyContact: {
        name: record.profile.emergencyContactName || '',
        relationship: record.profile.emergencyContactRelation || '',
        phoneNumber: record.profile.emergencyContactPhone || '',
      },
      disability: record.profile.disability || undefined,
      careLevel: record.profile.careLevel || undefined,
      notes: record.profile.notes || undefined,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    }

    const client = Client.fromData(clientData)
    if (isClient(client)) {
      clients.push(client)
    }
  }

  return clients
}
