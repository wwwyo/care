import type { AvailabilityStatus } from '@/features/availability/model/status'

type SlotStatusDisplayProps = {
  status: AvailabilityStatus | string | null
  note?: string | null
  updatedAt?: Date | null
}

function normalizeStatus(status: string | null): AvailabilityStatus | null {
  if (!status) return null

  switch (status) {
    case 'available':
    case 'open':
      return 'available'
    case 'limited':
      return 'limited'
    case 'unavailable':
    case 'closed':
      return 'unavailable'
    default:
      return null
  }
}

const statusConfig: Record<AvailabilityStatus, { emoji: string; label: string; className: string }> = {
  available: {
    emoji: '🟢',
    label: '空きあり',
    className: 'text-green-700 bg-green-50',
  },
  limited: {
    emoji: '🟡',
    label: '要相談',
    className: 'text-yellow-700 bg-yellow-50',
  },
  unavailable: {
    emoji: '🔴',
    label: '空きなし',
    className: 'text-red-700 bg-red-50',
  },
}

export function SlotStatusDisplay({ status, note, updatedAt }: SlotStatusDisplayProps) {
  const normalizedStatus = normalizeStatus(status)

  if (!normalizedStatus || !(normalizedStatus in statusConfig)) {
    return (
      <div className="p-4 rounded-lg bg-gray-50 text-gray-600">
        <p className="text-sm">空き状況未設定</p>
      </div>
    )
  }

  const config = statusConfig[normalizedStatus]
  const formattedDate = updatedAt
    ? new Intl.DateTimeFormat('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(updatedAt)
    : null

  return (
    <div className={`p-4 rounded-lg ${config.className}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl" role="img" aria-label={config.label}>
          {config.emoji}
        </span>
        <span className="font-semibold text-lg">{config.label}</span>
      </div>
      {note && <p className="text-sm mt-2 opacity-80 whitespace-pre-wrap">{note}</p>}
      {formattedDate && <p className="text-xs mt-2 opacity-60">最終更新: {formattedDate}</p>}
    </div>
  )
}
