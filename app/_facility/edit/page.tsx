import { requireRealm } from '@/features/auth/helpers'
import { getFacilityByStaffUserId } from '@/features/facility/infra/query/facility-query'
import { FacilityEditForm } from './facility-edit-form'

export default async function FacilityEditPage() {
  const session = await requireRealm('facility_staff', '/login')

  const facility = await getFacilityByStaffUserId(session.user.id)
  if (!facility) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-800">施設情報が登録されていません。管理者にお問い合わせください。</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">施設情報編集</h1>
        <p className="text-gray-600">施設の基本情報を編集できます</p>
      </div>

      <FacilityEditForm facility={facility} />
    </div>
  )
}
