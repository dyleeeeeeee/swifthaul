export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function getStatusColor(status: string): string {
  switch (status.toUpperCase()) {
    case 'IN_TRANSIT':      return 'status-in-transit'
    case 'OUT_FOR_DELIVERY':return 'status-out-delivery'
    case 'DELIVERED':       return 'status-delivered'
    case 'EXCEPTION':       return 'status-exception'
    default:                return 'status-created'
  }
}

export function getStatusLabel(status: string): string {
  switch (status.toUpperCase()) {
    case 'CREATED':          return 'Created'
    case 'PICKED_UP':        return 'Picked Up'
    case 'IN_TRANSIT':       return 'In Transit'
    case 'ARRIVED_HUB':      return 'Arrived at Hub'
    case 'OUT_FOR_DELIVERY': return 'Out for Delivery'
    case 'DELIVERED':        return 'Delivered'
    case 'EXCEPTION':        return 'Exception'
    default:                 return status
  }
}

export function getDotColor(status: string): string {
  switch (status.toUpperCase()) {
    case 'IN_TRANSIT':       return '#00e5ff'
    case 'OUT_FOR_DELIVERY': return '#ff6d00'
    case 'DELIVERED':        return '#00e676'
    case 'EXCEPTION':        return '#ff1744'
    default:                 return 'rgba(240,244,255,0.55)'
  }
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text)
}

export function generateMockParcelId(): string {
  const year = new Date().getFullYear()
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let random = ''
  for (let i = 0; i < 6; i++) random += chars[Math.floor(Math.random() * chars.length)]
  return `SH-${year}-${random}`
}

export function timeUntil(eta: string): string {
  const now = Date.now()
  const then = new Date(eta).getTime()
  const diff = then - now
  if (diff <= 0) return 'Delivered'
  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  if (d > 0) return `${d}d ${h}h ${m}m`
  if (h > 0) return `${h}h ${m}m ${s}s`
  return `${m}m ${s}s`
}
