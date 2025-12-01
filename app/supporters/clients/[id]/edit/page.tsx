import { notFound } from 'next/navigation'
import { requireRealm } from '@/features/auth/helpers'
import { getClientById } from '@/features/client/infra/client-query'
import { getSupporterByUserId } from '@/features/supporter/infra/query/supporter-query'
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

  const clientRecord = await getClientById(id, supporter.tenantId)

  if (!clientRecord || !clientRecord.profile || !clientRecord.addresses[0]) {
    notFound()
  }

  const profile = clientRecord.profile
  const address = clientRecord.addresses[0]
  const birthDateString = profile.birthDate ? profile.birthDate.toISOString().split('T')[0]! : ''

  // フォーム用のデータに変換
  const clientData = {
    id: clientRecord.id,
    name: profile.name,
    birthDate: birthDateString, // YYYY-MM-DD形式
    gender: (profile.gender || 'other') as 'male' | 'female' | 'other',
    postalCode: address.postalCode || undefined,
    prefecture: address.prefecture || '',
    city: address.city || '',
    street: address.street || '',
    building: address.building || undefined,
    phoneNumber: profile.phone || '',
    disability: profile.disability || undefined,
    careLevel: profile.careLevel || undefined,
    emergencyContactName: profile.emergencyContactName || '',
    emergencyContactRelationship: profile.emergencyContactRelation || '',
    emergencyContactPhone: profile.emergencyContactPhone || '',
    notes: profile.notes || undefined,
  }

  return <EditClientForm clientData={clientData} />
}
