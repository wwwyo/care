import { Client, type ClientData, isClient } from '@/domain/client/model'
import type { ClientRepository } from '@/domain/client/repository'
import { prisma } from '@/lib/prisma'

export type SaveError = { type: 'SaveError'; message: string }

async function save(client: Client): Promise<{ type: 'success' } | SaveError> {
  try {
    const data = client.toData()

    await prisma.$transaction(async (tx) => {
      // 利用者の作成または更新
      await tx.client.upsert({
        where: { id: data.id },
        create: {
          id: data.id,
          tenantId: data.tenantId,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        },
        update: {
          updatedAt: data.updatedAt,
        },
      })

      // プロファイルの作成または更新
      await tx.clientProfile.upsert({
        where: { clientId: data.id },
        create: {
          clientId: data.id,
          name: data.name,
          gender: data.gender,
          birthDate: data.birthDate,
          phone: data.phoneNumber,
          disability: data.disability,
          careLevel: data.careLevel,
          notes: data.notes,
          emergencyContactName: data.emergencyContact.name,
          emergencyContactRelation: data.emergencyContact.relationship,
          emergencyContactPhone: data.emergencyContact.phoneNumber,
        },
        update: {
          name: data.name,
          gender: data.gender,
          birthDate: data.birthDate,
          phone: data.phoneNumber,
          disability: data.disability,
          careLevel: data.careLevel,
          notes: data.notes,
          emergencyContactName: data.emergencyContact.name,
          emergencyContactRelation: data.emergencyContact.relationship,
          emergencyContactPhone: data.emergencyContact.phoneNumber,
        },
      })

      // 住所の作成または更新
      const existingAddress = await tx.clientAddress.findFirst({
        where: { clientId: data.id },
      })

      if (existingAddress) {
        await tx.clientAddress.update({
          where: { id: existingAddress.id },
          data: {
            postalCode: data.address.postalCode,
            prefecture: data.address.prefecture,
            city: data.address.city,
            street: data.address.street,
            building: data.address.building,
          },
        })
      } else {
        await tx.clientAddress.create({
          data: {
            clientId: data.id,
            postalCode: data.address.postalCode,
            prefecture: data.address.prefecture,
            city: data.address.city,
            street: data.address.street,
            building: data.address.building,
          },
        })
      }
    })

    return { type: 'success' }
  } catch (error) {
    return {
      type: 'SaveError',
      message: error instanceof Error ? error.message : '保存に失敗しました',
    }
  }
}

async function findById(id: string): Promise<Client | null> {
  // TODO: tenantIdはcontextから取得する必要がある
  const tenantId = 'default-tenant'
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

async function findBySupporterId(_supporterId: string): Promise<Client[]> {
  // TODO: 実装が必要
  return []
}

async function _findAll(
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

async function deleteById(id: string): Promise<void> {
  await prisma.client.delete({
    where: { id },
  })
}

/**
 * 利用者リポジトリの実装
 */
export const clientRepository: ClientRepository = {
  save,
  findById,
  findBySupporterId,
  delete: deleteById,
}
