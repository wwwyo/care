import { notFound } from 'next/navigation'
import type { ClientData } from '@/domain/client/model'
import { getClientById } from '@/infra/query/client-query'
import { getSupporterByUserId } from '@/infra/query/supporter-query'
import { requireRealm } from '@/lib/auth/helpers'
import EditClientForm from './edit-client-form'

interface EditClientPageProps {
  params: Promise<{ id: string }>
}

export default async function EditClientPage({ params }: EditClientPageProps) {
  const { id } = await params
  const session = await requireRealm('supporter')
  const supporter = await getSupporterByUserId(session.user.id)

  if (!supporter) {
    throw new Error('サポーター情報が見つかりません')
  }

  const client = await getClientById(id, supporter.tenantId)

  if (!client) {
    notFound()
  }

  const data: ClientData = client.toData()

  // 日付をフォーマット（非nullアサーションを使用）
  const birthDateString = data.birthDate.toISOString().split('T')[0]!

  // フォーム用のデータに変換
  const clientData = {
    id: data.id,
    name: data.name,
    birthDate: birthDateString, // YYYY-MM-DD形式
    gender: data.gender,
    postalCode: data.address.postalCode,
    prefecture: data.address.prefecture,
    city: data.address.city,
    street: data.address.street || '', // streetは必須フィールドなので空文字列をデフォルトに
    building: data.address.building,
    phoneNumber: data.phoneNumber,
    disability: data.disability,
    careLevel: data.careLevel,
    emergencyContactName: data.emergencyContact.name,
    emergencyContactRelationship: data.emergencyContact.relationship,
    emergencyContactPhone: data.emergencyContact.phoneNumber,
    notes: data.notes,
  }

  return <EditClientForm clientData={clientData} />
}
