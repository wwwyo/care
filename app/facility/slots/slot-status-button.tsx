'use client'

import type { AvailabilityStatus } from '@/domain/availability/status'
import { cn } from '@/lib/utils'

type SlotStatusButtonProps = {
  status: AvailabilityStatus
  selected: boolean
  onClick: () => void
}

const statusConfig: Record<AvailabilityStatus, { emoji: string; label: string; color: string }> = {
  available: {
    emoji: '🟢',
    label: '空きあり',
    color: 'bg-green-100 hover:bg-green-200 border-green-300 text-green-900',
  },
  limited: {
    emoji: '🟡',
    label: '要相談',
    color: 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300 text-yellow-900',
  },
  unavailable: {
    emoji: '🔴',
    label: '空きなし',
    color: 'bg-red-100 hover:bg-red-200 border-red-300 text-red-900',
  },
}

export function SlotStatusButton({ status, selected, onClick }: SlotStatusButtonProps) {
  const config = statusConfig[status]

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center gap-2 p-6 rounded-lg border-2 transition-all',
        'min-h-[120px] min-w-[120px]',
        config.color,
        selected && 'ring-4 ring-offset-2 ring-blue-500',
      )}
    >
      <span className="text-4xl" role="img" aria-label={config.label}>
        {config.emoji}
      </span>
      <span className="font-semibold text-lg">{config.label}</span>
    </button>
  )
}
