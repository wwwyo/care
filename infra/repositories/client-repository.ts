import {
  Client,
  type ClientAddress,
  type ClientProfile,
  type ClientSupporter,
} from '@/domain/client/model'
import type { ClientRepository } from '@/domain/client/repository'
import { prisma } from '@/lib/prisma'

export const clientRepository: ClientRepository = {
  async save(client: Client): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // Client本体を保存
      await tx.client.create({
        data: {
          id: client.id,
          tenantId: client.tenantId,
        },
      })

      // プロフィールがあれば保存
      if (client.profile) {
        await tx.clientProfile.create({
          data: {
            id: client.profile.id,
            clientId: client.id,
            name: client.profile.name,
            nameKana: client.profile.nameKana,
            gender: client.profile.gender,
            birthDate: client.profile.birthDate,
            phone: client.profile.phone,
          },
        })
      }

      // 住所があれば保存
      if (client.addresses.length > 0) {
        await tx.clientAddress.createMany({
          data: client.addresses.map((address) => ({
            id: address.id,
            clientId: client.id,
            postalCode: address.postalCode,
            prefecture: address.prefecture,
            city: address.city,
            street: address.street,
            building: address.building,
          })),
        })
      }

      // サポーターがあれば保存
      if (client.supporters.length > 0) {
        await tx.clientSupporter.createMany({
          data: client.supporters.map((supporter) => ({
            id: supporter.id,
            clientId: client.id,
            supporterId: supporter.supporterId,
          })),
        })
      }
    })
  },

  async findById(id: string): Promise<Client | null> {
    const data = await prisma.client.findUnique({
      where: { id },
      include: {
        profile: true,
        addresses: true,
        clientSupporters: true,
      },
    })

    if (!data) return null

    const profile: ClientProfile | undefined = data.profile
      ? {
          id: data.profile.id,
          clientId: data.profile.clientId,
          name: data.profile.name,
          nameKana: data.profile.nameKana ?? undefined,
          gender: data.profile.gender ?? undefined,
          birthDate: data.profile.birthDate ?? undefined,
          phone: data.profile.phone ?? undefined,
        }
      : undefined

    const addresses: ClientAddress[] = data.addresses.map((addr) => ({
      id: addr.id,
      clientId: addr.clientId,
      postalCode: addr.postalCode ?? undefined,
      prefecture: addr.prefecture ?? undefined,
      city: addr.city ?? undefined,
      street: addr.street ?? undefined,
      building: addr.building ?? undefined,
    }))

    const supporters: ClientSupporter[] = data.clientSupporters.map((cs) => ({
      id: cs.id,
      clientId: cs.clientId,
      supporterId: cs.supporterId,
      createdAt: cs.createdAt,
      updatedAt: cs.updatedAt,
    }))

    return new Client(data.id, data.tenantId, profile, addresses, supporters)
  },

  async findBySupporterId(supporterId: string): Promise<Client[]> {
    const clients = await prisma.client.findMany({
      where: {
        clientSupporters: {
          some: {
            supporterId,
          },
        },
      },
      include: {
        profile: true,
        addresses: true,
        clientSupporters: true,
      },
    })

    return clients.map((data) => {
      const profile: ClientProfile | undefined = data.profile
        ? {
            id: data.profile.id,
            clientId: data.profile.clientId,
            name: data.profile.name,
            nameKana: data.profile.nameKana ?? undefined,
            gender: data.profile.gender ?? undefined,
            birthDate: data.profile.birthDate ?? undefined,
            phone: data.profile.phone ?? undefined,
          }
        : undefined

      const addresses: ClientAddress[] = data.addresses.map((addr) => ({
        id: addr.id,
        clientId: addr.clientId,
        postalCode: addr.postalCode ?? undefined,
        prefecture: addr.prefecture ?? undefined,
        city: addr.city ?? undefined,
        street: addr.street ?? undefined,
        building: addr.building ?? undefined,
      }))

      const supporters: ClientSupporter[] = data.clientSupporters.map((cs) => ({
        id: cs.id,
        clientId: cs.clientId,
        supporterId: cs.supporterId,
        createdAt: cs.createdAt,
        updatedAt: cs.updatedAt,
      }))

      return new Client(data.id, data.tenantId, profile, addresses, supporters)
    })
  },
}
