import { CallStatus, STATUS_COLORS, STATUS_LABELS } from '@/lib/types'

export default function StatusBadge({ status }: { status: CallStatus }) {
  const hex = STATUS_COLORS[status].hex
  return (
    <span
      style={{ background: `${hex}18`, color: hex, border: `1px solid ${hex}28` }}
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
    >
      <span style={{ background: hex }} className="w-1.5 h-1.5 rounded-full flex-shrink-0" />
      {STATUS_LABELS[status]}
    </span>
  )
}
