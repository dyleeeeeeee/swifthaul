import { useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Search, Eye, Pencil, Trash2, ChevronUp, ChevronDown,
  X, Filter, ChevronLeft, ChevronRight, Loader2
} from 'lucide-react'
import { api, Parcel } from '../../lib/api'
import StatusBadge from '../../components/ui/StatusBadge'
import { formatDateShort } from '../../lib/utils'
import toast from 'react-hot-toast'

const PAGE_SIZE = 10
const STATUS_OPTS = ['', 'CREATED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'EXCEPTION']

const MOCK_PARCELS: Parcel[] = Array.from({ length: 42 }, (_, i) => ({
  id: `SH-2024-${String(i + 1).padStart(6, '0').replace(/\d/g, d => 'ABCDEFGHIJ'[+d])}`,
  sender_name: ['Alice Johnson', 'Bob Smith', 'Carol Lee', 'David Kim', 'Eve Brown'][i % 5],
  sender_address: '123 Main St',
  sender_country: ['USA', 'UK', 'Germany', 'France', 'Japan'][i % 5],
  receiver_name: ['Frank White', 'Grace Hall', 'Henry Ford', 'Iris Chan', 'Jack Stone'][i % 5],
  receiver_address: '456 Oak Ave',
  receiver_country: ['Australia', 'Canada', 'Brazil', 'UAE', 'Singapore'][i % 5],
  weight_kg: +(1 + Math.random() * 20).toFixed(1),
  dimensions: JSON.stringify({ l: 30, w: 20, h: 15 }),
  service_type: ['EXPRESS', 'STANDARD', 'FREIGHT'][i % 3],
  declared_value: Math.floor(50 + Math.random() * 950),
  current_status: ['CREATED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'EXCEPTION'][i % 5],
  eta: new Date(Date.now() + (i + 1) * 86400000).toISOString(),
  created_at: new Date(Date.now() - i * 3600000 * 6).toISOString(),
  updated_at: new Date(Date.now() - i * 3600000).toISOString(),
}))

type SortKey = keyof Pick<Parcel, 'id' | 'sender_name' | 'receiver_name' | 'current_status' | 'created_at'>

export default function Parcels() {
  const qc = useQueryClient()
  const [urlParams] = useSearchParams()
  const [search, setSearch] = useState(() => urlParams.get('search') ?? '')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortAsc, setSortAsc] = useState(false)
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    const s = urlParams.get('search') ?? ''
    setSearch(s)
    setPage(1)
  }, [urlParams])

  const params = new URLSearchParams()
  if (search) params.set('search', search)
  if (statusFilter) params.set('status', statusFilter)
  params.set('page', String(page))
  params.set('pageSize', String(PAGE_SIZE))

  const { data, isLoading } = useQuery({
    queryKey: ['parcels', search, statusFilter, page],
    queryFn: () => api.getParcels(params.toString()),
    placeholderData: { parcels: MOCK_PARCELS.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), total: MOCK_PARCELS.length, page, pageSize: PAGE_SIZE },
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.deleteParcel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['parcels'] })
      toast.success('Parcel deleted')
      setDeleteId(null)
    },
    onError: () => toast.error('Delete failed'),
  })

  const parcels = data?.parcels ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const sorted = [...parcels].sort((a, b) => {
    const av = a[sortKey] ?? '', bv = b[sortKey] ?? ''
    return sortAsc ? av > bv ? 1 : -1 : av < bv ? 1 : -1
  })

  function toggleSort(key: SortKey) {
    if (key === sortKey) setSortAsc(s => !s)
    else { setSortKey(key); setSortAsc(true) }
  }

  const SortIcon = useCallback(({ col }: { col: SortKey }) => (
    sortKey === col
      ? sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />
      : <ChevronDown size={12} style={{ opacity: 0.3 }} />
  ), [sortKey, sortAsc])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl" style={{ color: 'var(--text-primary)' }}>PARCELS</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{total.toLocaleString()} total shipments</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by ID, sender, receiver…"
            className="glass-input w-full pl-9 pr-3 py-2.5 text-sm"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} style={{ color: 'var(--text-muted)' }} />
          {STATUS_OPTS.slice(1).map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(statusFilter === s ? '' : s); setPage(1) }}
              className="text-xs font-mono px-3 py-1.5 glass-sm transition-all"
              style={{
                borderRadius: '8px',
                borderColor: statusFilter === s ? 'var(--accent-primary)' : undefined,
                color: statusFilter === s ? 'var(--accent-primary)' : 'var(--text-secondary)',
              }}
            >
              {statusFilter === s && <X size={10} className="inline mr-1" />}
              {s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass overflow-hidden" style={{ borderRadius: '16px' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
                {([
                  ['Tracking ID', 'id'],
                  ['Sender', 'sender_name'],
                  ['Receiver', 'receiver_name'],
                  ['Origin', null],
                  ['Destination', null],
                  ['Status', 'current_status'],
                  ['Created', 'created_at'],
                  ['Actions', null],
                ] as [string, SortKey | null][]).map(([label, key]) => (
                  <th
                    key={label}
                    onClick={key ? () => toggleSort(key) : undefined}
                    className="text-left px-4 py-4 font-mono text-xs"
                    style={{
                      color: 'var(--text-muted)',
                      letterSpacing: '0.1em',
                      cursor: key ? 'pointer' : 'default',
                      userSelect: 'none',
                    }}
                  >
                    <span className="flex items-center gap-1">
                      {label}
                      {key && <SortIcon col={key} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="sync">
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="px-4 py-4">
                          <div className="shimmer h-3 rounded" style={{ width: `${40 + j * 8}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))
                  : sorted.map(parcel => (
                    <motion.tr
                      key={parcel.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, height: 0 }}
                      whileHover={{ background: 'rgba(255,255,255,0.025)' }}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        borderLeft: '2px solid transparent',
                      }}
                    >
                      <td className="px-4 py-4 font-mono text-xs" style={{ color: 'var(--accent-primary)' }}>
                        {parcel.id}
                      </td>
                      <td className="px-4 py-4 text-xs" style={{ color: 'var(--text-primary)' }}>{parcel.sender_name}</td>
                      <td className="px-4 py-4 text-xs" style={{ color: 'var(--text-primary)' }}>{parcel.receiver_name}</td>
                      <td className="px-4 py-4 text-xs" style={{ color: 'var(--text-secondary)' }}>{parcel.sender_country}</td>
                      <td className="px-4 py-4 text-xs" style={{ color: 'var(--text-secondary)' }}>{parcel.receiver_country}</td>
                      <td className="px-4 py-4"><StatusBadge status={parcel.current_status} size="sm" /></td>
                      <td className="px-4 py-4 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                        {formatDateShort(parcel.created_at)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {[
                            { icon: Eye,    title: 'View',   color: 'var(--accent-primary)',   action: () => {} },
                            { icon: Pencil, title: 'Edit',   color: 'var(--accent-secondary)', action: () => {} },
                            { icon: Trash2, title: 'Delete', color: '#ff1744',                  action: () => setDeleteId(parcel.id) },
                          ].map(({ icon: Icon, title, color, action }) => (
                            <motion.button
                              key={title}
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.9 }}
                              title={title}
                              onClick={action}
                              className="w-7 h-7 glass-sm flex items-center justify-center"
                              style={{ borderRadius: '8px', color }}
                            >
                              <Icon size={12} />
                            </motion.button>
                          ))}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                }
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-4"
          style={{ borderTop: '1px solid var(--glass-border)' }}>
          <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-1.5 glass-sm disabled:opacity-30" style={{ borderRadius: '8px', color: 'var(--text-secondary)' }}>
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i
              return (
                <button key={p} onClick={() => setPage(p)}
                  className="w-8 h-8 text-xs font-mono glass-sm"
                  style={{
                    borderRadius: '8px',
                    background: p === page ? 'var(--accent-primary)' : undefined,
                    color: p === page ? '#050810' : 'var(--text-secondary)',
                  }}>
                  {p}
                </button>
              )
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-1.5 glass-sm disabled:opacity-30" style={{ borderRadius: '8px', color: 'var(--text-secondary)' }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirm Popover */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-modal"
            style={{ background: 'rgba(5,8,16,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={() => setDeleteId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="glass p-8 max-w-sm w-full mx-4"
              style={{ borderRadius: '24px', borderColor: 'rgba(255,23,68,0.3)' }}
              onClick={e => e.stopPropagation()}
            >
              <Trash2 size={32} className="mb-4" style={{ color: '#ff1744' }} />
              <h3 className="font-display text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>DELETE PARCEL</h3>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                This will permanently remove <span className="font-mono" style={{ color: 'var(--accent-primary)' }}>{deleteId}</span>. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)}
                  className="btn-secondary flex-1 text-sm">Cancel</button>
                <button
                  onClick={() => deleteMut.mutate(deleteId!)}
                  disabled={deleteMut.isPending}
                  className="flex-1 text-sm py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2"
                  style={{ background: '#ff1744', color: '#fff', border: 'none', cursor: 'pointer' }}>
                  {deleteMut.isPending ? <Loader2 size={14} className="animate-spin" /> : null}
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
