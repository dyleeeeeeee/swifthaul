import { getDotColor, getStatusLabel } from '../../lib/utils'

interface Props {
  status: string
  pulse?: boolean
  size?: 'sm' | 'md'
}

export default function StatusBadge({ status, pulse = false, size = 'md' }: Props) {
  const color = getDotColor(status)
  const label = getStatusLabel(status)
  const isActive = ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'PICKED_UP'].includes(status.toUpperCase())

  return (
    <span
      className={`inline-flex items-center gap-2 glass-sm font-mono ${size === 'sm' ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1.5'}`}
      style={{
        borderLeft: `2px solid ${color}`,
        borderRadius: '8px',
        color,
      }}
    >
      <span
        className={`pulse-dot ${pulse && isActive ? 'animate-pulse' : ''}`}
        style={{
          width: size === 'sm' ? 6 : 8,
          height: size === 'sm' ? 6 : 8,
          borderRadius: '50%',
          background: color,
          display: 'inline-block',
          flexShrink: 0,
          animation: pulse && isActive ? 'pulseDot 2s ease-in-out infinite' : 'none',
        }}
      />
      {label}
    </span>
  )
}
