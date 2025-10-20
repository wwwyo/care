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
          nameKana: data.nameKana ?? null,
          gender: data.gender ?? null,
          birthDate: data.birthDate ?? null,
          phone: data.phoneNumber ?? null,
          disability: data.disability ?? null,
          careLevel: data.careLevel ?? null,
          notes: data.notes ?? null,
          emergencyContactName: data.emergencyContact?.name ?? null,
          emergencyContactRelation: data.emergencyContact?.relationship ?? null,
          emergencyContactPhone: data.emergencyContact?.phoneNumber ?? null,
        },
        update: {
          name: data.name,
          nameKana: data.nameKana ?? null,
          gender: data.gender ?? null,
          birthDate: data.birthDate ?? null,
          phone: data.phoneNumber ?? null,
          disability: data.disability ?? null,
          careLevel: data.careLevel ?? null,
          notes: data.notes ?? null,
          emergencyContactName: data.emergencyContact?.name ?? null,
          emergencyContactRelation: data.emergencyContact?.relationship ?? null,
          emergencyContactPhone: data.emergencyContact?.phoneNumber ?? null,
        },
      })

      // 住所の作成または更新
      const existingAddress = await tx.clientAddress.findFirst({
        where: { clientId: data.id },
      })

      if (data.address) {
        if (existingAddress) {
          await tx.clientAddress.update({
            where: { id: existingAddress.id },
            data: {
              postalCode: data.address.postalCode ?? null,
              prefecture: data.address.prefecture ?? null,
              city: data.address.city ?? null,
              street: data.address.street ?? null,
              building: data.address.building ?? null,
            },
          })
        } else {
          await tx.clientAddress.create({
            data: {
              clientId: data.id,
              postalCode: data.address.postalCode ?? null,
              prefecture: data.address.prefecture ?? null,
              city: data.address.city ?? null,
              street: data.address.street ?? null,
              building: data.address.building ?? null,
            },
          })
        }
      } else if (existingAddress) {
        await tx.clientAddress.delete({
          where: { id: existingAddress.id },
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

  const primaryAddress = clientRecord.addresses[0]
  const addressData =
    primaryAddress?.prefecture && primaryAddress.city
      ? {
          postalCode: primaryAddress.postalCode ?? undefined,
          prefecture: primaryAddress.prefecture,
          city: primaryAddress.city,
          street: primaryAddress.street ?? undefined,
          building: primaryAddress.building ?? undefined,
        }
      : undefined

  const clientData: ClientData = {
    id: clientRecord.id,
    tenantId: clientRecord.tenantId,
    name: clientRecord.profile.name,
    nameKana: clientRecord.profile.nameKana,
    birthDate: clientRecord.profile.birthDate || undefined,
    gender: (clientRecord.profile.gender || null) as 'male' | 'female' | 'other' | null,
    address: addressData,
    phoneNumber: clientRecord.profile.phone || undefined,
    emergencyContact:
      clientRecord.profile.emergencyContactName ||
      clientRecord.profile.emergencyContactRelation ||
      clientRecord.profile.emergencyContactPhone
        ? {
            name: clientRecord.profile.emergencyContactName || '',
            relationship: clientRecord.profile.emergencyContactRelation || '',
            phoneNumber: clientRecord.profile.emergencyContactPhone || '',
          }
        : undefined,
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
    if (!record.profile) {
      continue
    }

    const primaryAddress = record.addresses[0]
    const addressData =
      primaryAddress?.prefecture && primaryAddress.city
        ? {
            postalCode: primaryAddress.postalCode ?? undefined,
            prefecture: primaryAddress.prefecture,
            city: primaryAddress.city,
            street: primaryAddress.street ?? undefined,
            building: primaryAddress.building ?? undefined,
          }
        : undefined

    const clientData: ClientData = {
      id: record.id,
      tenantId: record.tenantId,
      name: record.profile.name,
      nameKana: record.profile.nameKana,
      birthDate: record.profile.birthDate || undefined,
      gender: (record.profile.gender || null) as 'male' | 'female' | 'other' | null,
      address: addressData,
      phoneNumber: record.profile.phone || undefined,
      emergencyContact:
        record.profile.emergencyContactName ||
        record.profile.emergencyContactRelation ||
        record.profile.emergencyContactPhone
          ? {
              name: record.profile.emergencyContactName || '',
              relationship: record.profile.emergencyContactRelation || '',
              phoneNumber: record.profile.emergencyContactPhone || '',
            }
          : undefined,
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
