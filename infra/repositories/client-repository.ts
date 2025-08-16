import { Client, type ClientAddress, type ClientProfile } from '@/domain/client/model'
import type { ClientRepository } from '@/domain/client/repository'
import { prisma } from '@/lib/prisma'

export const clientRepository: ClientRepository = {
  async save(client: Client): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // Client本体を保存
      await tx.client.create({
        data: {
          id: client.id,
          userId: client.userId,
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
    })
  },

  async findById(id: string): Promise<Client | null> {
    const data = await prisma.client.findUnique({
      where: { id },
      include: {
        profile: true,
        addresses: true,
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

    return new Client(data.id, data.userId, profile, addresses)
  },

  async findByUserId(userId: string): Promise<Client | null> {
    const data = await prisma.client.findFirst({
      where: { userId },
      include: {
        profile: true,
        addresses: true,
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

    return new Client(data.id, data.userId, profile, addresses)
  },
}
