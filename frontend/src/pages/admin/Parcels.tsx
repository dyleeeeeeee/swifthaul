import { useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Search, Eye, Pencil, Trash2, ChevronUp, ChevronDown,
  X, Filter, ChevronLeft, ChevronRight, Loader2, Save
} from 'lucide-react'
import { api, Parcel } from '../../lib/api'
import StatusBadge from '../../components/ui/StatusBadge'
import GlassInput from '../../components/ui/GlassInput'
import { formatDateShort } from '../../lib/utils'
import toast from 'react-hot-toast'

const PAGE_SIZE = 10
const STATUS_OPTS = ['', 'CREATED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'EXCEPTION']
const SERVICE_TYPES = ['EXPRESS', 'STANDARD', 'FREIGHT']

const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Angola','Argentina','Australia','Austria',
  'Bangladesh','Belarus','Belgium','Benin','Bolivia','Bosnia and Herzegovina',
  'Botswana','Brazil','Bulgaria','Burkina Faso','Cambodia','Cameroon','Canada',
  'Cape Verde','Chile','China','Colombia','Costa Rica','Croatia','Cuba','Cyprus',
  'Czech Republic','DR Congo',"Côte d'Ivoire",'Denmark','Dominican Republic',
  'Ecuador','Egypt','El Salvador','Estonia','Ethiopia','Fiji','Finland','France',
  'Germany','Ghana','Greece','Guatemala','Guinea','Honduras','Hong Kong','Hungary',
  'Iceland','India','Indonesia','Iran','Iraq','Ireland','Israel','Italy','Jamaica',
  'Japan','Jordan','Kazakhstan','Kenya','Kuwait','Kyrgyzstan','Laos','Latvia',
  'Lebanon','Liberia','Libya','Lithuania','Luxembourg','Madagascar','Malawi',
  'Malaysia','Maldives','Mali','Malta','Mauritius','Mexico','Moldova','Mongolia',
  'Montenegro','Morocco','Mozambique','Myanmar','Namibia','Nepal','Netherlands',
  'New Zealand','Nicaragua','Niger','Nigeria','North Korea','North Macedonia',
  'Norway','Oman','Pakistan','Palestine','Panama','Papua New Guinea','Paraguay',
  'Peru','Philippines','Poland','Portugal','Puerto Rico','Qatar','Romania','Russia',
  'Rwanda','Samoa','Saudi Arabia','Senegal','Serbia','Sierra Leone','Singapore',
  'Slovakia','Slovenia','Somalia','South Africa','South Korea','South Sudan',
  'Spain','Sri Lanka','Sudan','Sweden','Switzerland','Syria','Taiwan','Tajikistan',
  'Tanzania','Thailand','Togo','Tonga','Trinidad and Tobago','Tunisia','Turkey',
  'Turkmenistan','UAE','Uganda','Ukraine','United Kingdom','United States',
  'Uruguay','Uzbekistan','Vanuatu','Venezuela','Vietnam','Yemen','Zambia','Zimbabwe',
].sort()

const MOCK_PARCELS: Parcel[] = Array.from({ length: 42 }, (_, i) => ({
  id: `SH-2024-${String(i + 1).padStart(6, '0').replace(/\d/g, d => 'ABCDEFGHIJ'[+d])}`,
  sender_name: ['Alice Johnson', 'Bob Smith', 'Carol Lee', 'David Kim', 'Eve Brown'][i % 5],
  sender_address: '123 Main St',
  sender_country: ['United States', 'United Kingdom', 'Germany', 'France', 'Japan'][i % 5],
  receiver_name: ['Frank White', 'Grace Hall', 'Henry Ford', 'Iris Chan', 'Jack Stone'][i % 5],
  receiver_address: '456 Oak Ave',
  receiver_country: ['Australia', 'Canada', 'Brazil', 'UAE', 'Singapore'][i % 5],
  weight_kg: +(1 + Math.random() * 20).toFixed(1),
  dimensions: '30x20x15',
  service_type: ['EXPRESS', 'STANDARD', 'FREIGHT'][i % 3],
  declared_value: Math.floor(50 + Math.random() * 950),
  current_status: ['CREATED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'EXCEPTION'][i % 5],
  eta: new Date(Date.now() + (i + 1) * 86400000).toISOString(),
  created_at: new Date(Date.now() - i * 3600000 * 6).toISOString(),
  updated_at: new Date(Date.now() - i * 3600000).toISOString(),
}))

type SortKey = keyof Pick<Parcel, 'id' | 'sender_name' | 'receiver_name' | 'current_status' | 'created_at'>

type EditForm = {
  sender_name: string; sender_address: string; sender_country: string
  receiver_name: string; receiver_address: string; receiver_country: string
  weight_kg: number | ''; dimensions: string; service_type: string
  declared_value: number | ''; current_status: string
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[]
}) {
  return (
    <div>
      <label className="block text-xs mb-1.5 font-body" style={{ color: 'var(--text-secondary)' }}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="glass-input w-full px-3 py-2.5 text-sm" style={{ appearance: 'none' }}>
        {options.map(o => <option key={o} value={o} style={{ background: '#0a0f1e' }}>{o}</option>)}
      </select>
    </div>
  )
}

export default function Parcels() {
  const qc = useQueryClient()
  const [urlParams] = useSearchParams()
  const [search, setSearch] = useState(() => urlParams.get('search') ?? '')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortAsc, setSortAsc] = useState(false)
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editParcel, setEditParcel] = useState<Parcel | null>(null)
  const [editForm, setEditForm] = useState<EditForm | null>(null)

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
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['parcels'] }); toast.success('Parcel deleted'); setDeleteId(null) },
    onError: () => toast.error('Delete failed'),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Parcel> }) => api.updateParcel(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['parcels'] })
      toast.success('Parcel updated')
      setEditParcel(null); setEditForm(null)
    },
    onError: (err: any) => toast.error(err?.message ?? 'Update failed'),
  })

  function openEdit(parcel: Parcel) {
    setEditParcel(parcel)
    setEditForm({
      sender_name: parcel.sender_name ?? '', sender_address: parcel.sender_address ?? '',
      sender_country: parcel.sender_country ?? 'United States',
      receiver_name: parcel.receiver_name ?? '', receiver_address: parcel.receiver_address ?? '',
      receiver_country: parcel.receiver_country ?? 'United Kingdom',
      weight_kg: parcel.weight_kg ?? '', dimensions: parcel.dimensions ?? '',
      service_type: parcel.service_type ?? 'STANDARD',
      declared_value: parcel.declared_value ?? '', current_status: parcel.current_status ?? 'CREATED',
    })
  }

  function setField<K extends keyof EditForm>(key: K, val: EditForm[K]) {
    setEditForm(f => f ? { ...f, [key]: val } : f)
  }

  function submitEdit() {
    if (!editParcel || !editForm) return
    updateMut.mutate({
      id: editParcel.id,
      data: {
        ...editForm,
        weight_kg: editForm.weight_kg === '' ? 0 : Number(editForm.weight_kg),
        declared_value: editForm.declared_value === '' ? 0 : Number(editForm.declared_value),
      },
    })
  }

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
      <div>
        <h1 className="font-display text-3xl" style={{ color: 'var(--text-primary)' }}>PARCELS</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{total.toLocaleString()} total shipments</p>
      </div>

      {/* Filters */}
      <div className="glass p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by ID, sender, receiver…" className="glass-input w-full pl-9 pr-3 py-2.5 text-sm" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} style={{ color: 'var(--text-muted)' }} />
          {STATUS_OPTS.slice(1).map(s => (
            <button key={s} onClick={() => { setStatusFilter(statusFilter === s ? '' : s); setPage(1) }}
              className="text-xs font-mono px-3 py-1.5 glass-sm transition-all"
              style={{ borderRadius: '8px', borderColor: statusFilter === s ? 'var(--accent-primary)' : undefined, color: statusFilter === s ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
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
                {([['Tracking ID','id'],['Sender','sender_name'],['Receiver','receiver_name'],['Origin',null],['Destination',null],['Status','current_status'],['Created','created_at'],['Actions',null]] as [string, SortKey | null][]).map(([label, key]) => (
                  <th key={label} onClick={key ? () => toggleSort(key) : undefined}
                    className="text-left px-4 py-4 font-mono text-xs"
                    style={{ color: 'var(--text-muted)', letterSpacing: '0.1em', cursor: key ? 'pointer' : 'default', userSelect: 'none' }}>
                    <span className="flex items-center gap-1">{label}{key && <SortIcon col={key} />}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="sync">
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-4"><div className="shimmer h-3 rounded" style={{ width: `${40 + j * 8}%` }} /></td>
                    ))}</tr>
                  ))
                  : sorted.map(parcel => (
                    <motion.tr key={parcel.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }}
                      whileHover={{ background: 'rgba(255,255,255,0.025)' }}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', borderLeft: '2px solid transparent' }}>
                      <td className="px-4 py-4 font-mono text-xs" style={{ color: 'var(--accent-primary)' }}>{parcel.id}</td>
                      <td className="px-4 py-4 text-xs" style={{ color: 'var(--text-primary)' }}>{parcel.sender_name}</td>
                      <td className="px-4 py-4 text-xs" style={{ color: 'var(--text-primary)' }}>{parcel.receiver_name}</td>
                      <td className="px-4 py-4 text-xs" style={{ color: 'var(--text-secondary)' }}>{parcel.sender_country}</td>
                      <td className="px-4 py-4 text-xs" style={{ color: 'var(--text-secondary)' }}>{parcel.receiver_country}</td>
                      <td className="px-4 py-4"><StatusBadge status={parcel.current_status} size="sm" /></td>
                      <td className="px-4 py-4 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{formatDateShort(parcel.created_at)}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {[
                            { icon: Eye,    title: 'View',   color: 'var(--accent-primary)',   action: () => window.open(`/track?id=${parcel.id}`, '_blank') },
                            { icon: Pencil, title: 'Edit',   color: 'var(--accent-secondary)', action: () => openEdit(parcel) },
                            { icon: Trash2, title: 'Delete', color: '#ff1744',                  action: () => setDeleteId(parcel.id) },
                          ].map(({ icon: Icon, title, color, action }) => (
                            <motion.button key={title} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                              title={title} onClick={action}
                              className="w-7 h-7 glass-sm flex items-center justify-center"
                              style={{ borderRadius: '8px', color }}>
                              <Icon size={12} />
                            </motion.button>
                          ))}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-4" style={{ borderTop: '1px solid var(--glass-border)' }}>
          <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>Page {page} of {totalPages}</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-1.5 glass-sm disabled:opacity-30" style={{ borderRadius: '8px', color: 'var(--text-secondary)' }}>
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i
              return (
                <button key={p} onClick={() => setPage(p)} className="w-8 h-8 text-xs font-mono glass-sm"
                  style={{ borderRadius: '8px', background: p === page ? 'var(--accent-primary)' : undefined, color: p === page ? '#050810' : 'var(--text-secondary)' }}>
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

      {/* Edit Modal */}
      <AnimatePresence>
        {editParcel && editForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-modal p-4"
            style={{ background: 'rgba(5,8,16,0.75)', backdropFilter: 'blur(10px)' }}
            onClick={() => { setEditParcel(null); setEditForm(null) }}>
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }} transition={{ ease: [0.23, 1, 0.32, 1], duration: 0.35 }}
              className="glass w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              style={{ borderRadius: '24px' }} onClick={e => e.stopPropagation()}>

              <div className="flex items-center justify-between p-6 pb-0">
                <div>
                  <h2 className="font-display text-2xl" style={{ color: 'var(--text-primary)' }}>EDIT PARCEL</h2>
                  <p className="font-mono text-xs mt-1" style={{ color: 'var(--accent-primary)' }}>{editParcel.id}</p>
                </div>
                <button onClick={() => { setEditParcel(null); setEditForm(null) }}
                  className="w-8 h-8 glass-sm flex items-center justify-center"
                  style={{ borderRadius: '10px', color: 'var(--text-muted)' }}>
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Sender */}
                <div>
                  <p className="text-xs font-mono font-bold mb-3" style={{ color: 'var(--accent-primary)' }}>SENDER</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <GlassInput label="Full Name" value={editForm.sender_name} onChange={e => setField('sender_name', e.target.value)} />
                    <GlassInput label="Address" value={editForm.sender_address} onChange={e => setField('sender_address', e.target.value)} />
                    <div className="sm:col-span-2">
                      <SelectField label="Country" value={editForm.sender_country} onChange={v => setField('sender_country', v)} options={COUNTRIES} />
                    </div>
                  </div>
                </div>

                {/* Receiver */}
                <div>
                  <p className="text-xs font-mono font-bold mb-3" style={{ color: 'var(--accent-primary)' }}>RECEIVER</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <GlassInput label="Full Name" value={editForm.receiver_name} onChange={e => setField('receiver_name', e.target.value)} />
                    <GlassInput label="Address" value={editForm.receiver_address} onChange={e => setField('receiver_address', e.target.value)} />
                    <div className="sm:col-span-2">
                      <SelectField label="Country" value={editForm.receiver_country} onChange={v => setField('receiver_country', v)} options={COUNTRIES} />
                    </div>
                  </div>
                </div>

                {/* Package */}
                <div>
                  <p className="text-xs font-mono font-bold mb-3" style={{ color: 'var(--accent-primary)' }}>PACKAGE</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <GlassInput label="Weight (kg)" type="number" min={0} step={0.1} value={editForm.weight_kg}
                      onChange={e => setField('weight_kg', e.target.value === '' ? '' : +e.target.value)} />
                    <GlassInput label="Dimensions" placeholder="30x20x15" value={editForm.dimensions}
                      onChange={e => setField('dimensions', e.target.value)} />
                    <GlassInput label="Declared Value ($)" type="number" min={0} value={editForm.declared_value}
                      onChange={e => setField('declared_value', e.target.value === '' ? '' : +e.target.value)} />
                    <SelectField label="Service" value={editForm.service_type}
                      onChange={v => setField('service_type', v)} options={SERVICE_TYPES} />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <p className="text-xs font-mono font-bold mb-3" style={{ color: 'var(--accent-primary)' }}>STATUS</p>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_OPTS.slice(1).map(s => (
                      <button key={s} type="button" onClick={() => setField('current_status', s)}
                        className="text-xs font-mono px-3 py-2 glass-sm transition-all"
                        style={{
                          borderRadius: '8px',
                          borderColor: editForm.current_status === s ? 'var(--accent-primary)' : undefined,
                          background: editForm.current_status === s ? 'rgba(0,229,255,0.08)' : undefined,
                          color: editForm.current_status === s ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        }}>
                        {s.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setEditParcel(null); setEditForm(null) }} className="btn-secondary flex-1 text-sm">Cancel</button>
                  <button type="button" onClick={submitEdit} disabled={updateMut.isPending}
                    className="btn-primary flex-1 text-sm flex items-center justify-center gap-2">
                    {updateMut.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    {updateMut.isPending ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-modal"
            style={{ background: 'rgba(5,8,16,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={() => setDeleteId(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="glass p-8 max-w-sm w-full mx-4"
              style={{ borderRadius: '24px', borderColor: 'rgba(255,23,68,0.3)' }}
              onClick={e => e.stopPropagation()}>
              <Trash2 size={32} className="mb-4" style={{ color: '#ff1744' }} />
              <h3 className="font-display text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>DELETE PARCEL</h3>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                This will permanently remove <span className="font-mono" style={{ color: 'var(--accent-primary)' }}>{deleteId}</span>. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1 text-sm">Cancel</button>
                <button onClick={() => deleteMut.mutate(deleteId!)} disabled={deleteMut.isPending}
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
