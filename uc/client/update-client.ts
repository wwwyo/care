import type { Client } from '@/domain/client/model'
import type { ClientRepository } from '@/domain/client/repository'

type UpdateClientData = {
  name: string
  birthDate: Date
  gender: 'male' | 'female' | 'other'
  address: {
    postalCode?: string
    prefecture: string
    city: string
    street: string
    building?: string
  }
  phoneNumber: string
  emergencyContact: {
    name: string
    relationship: string
    phoneNumber: string
  }
  disability?: string
  careLevel?: string
  notes?: string
}

type UpdateClientError = {
  type: 'MissingName' | 'InvalidPhoneNumber' | 'InvalidEmergencyContact' | 'SaveError'
}

type UpdateClientSuccess = {
  type: 'success'
  client: Client
}

export async function updateClient(
  client: Client,
  data: UpdateClientData,
  repository: ClientRepository,
): Promise<UpdateClientSuccess | UpdateClientError> {
  // 名前の検証
  if (!data.name || data.name.trim().length === 0) {
    return { type: 'MissingName' }
  }

  // 電話番号の検証
  if (!data.phoneNumber || !/^\d{2,3}-\d{4}-\d{4}$/.test(data.phoneNumber)) {
    return { type: 'InvalidPhoneNumber' }
  }

  // 緊急連絡先の検証
  if (
    !data.emergencyContact.name ||
    !data.emergencyContact.relationship ||
    !data.emergencyContact.phoneNumber ||
    !/^\d{2,3}-\d{4}-\d{4}$/.test(data.emergencyContact.phoneNumber)
  ) {
    return { type: 'InvalidEmergencyContact' }
  }

  // 更新されたクライアントオブジェクトを作成
  const updatedClient = client.update({
    name: data.name,
    birthDate: data.birthDate,
    gender: data.gender,
    address: {
      postalCode: data.address.postalCode,
      prefecture: data.address.prefecture,
      city: data.address.city,
      street: data.address.street,
      building: data.address.building,
    },
    phoneNumber: data.phoneNumber,
    emergencyContact: {
      name: data.emergencyContact.name,
      relationship: data.emergencyContact.relationship,
      phoneNumber: data.emergencyContact.phoneNumber,
    },
    disability: data.disability,
    careLevel: data.careLevel,
    notes: data.notes,
  })

  // updateメソッドがエラーを返した場合
  if ('type' in updatedClient) {
    return { type: 'SaveError' }
  }

  // リポジトリに保存
  const saveResult = await repository.save(updatedClient)

  if (saveResult.type !== 'success') {
    return { type: 'SaveError' }
  }

  return {
    type: 'success',
    client: updatedClient,
  }
}
