import { STATUS_COLORS } from '../../lib/constants'
export default function StatusBadge({ status, size = 'md' }) {
  const c = STATUS_COLORS[status] ?? STATUS_COLORS.Green
  const sz = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1'
  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full ${sz}`} style={{ backgroundColor: c.bg, color: c.text }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.dot }} />
      {status}
    </span>
  )
}
