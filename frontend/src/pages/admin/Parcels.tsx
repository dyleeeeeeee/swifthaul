import { useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Search, Eye, Pencil, Trash2, ChevronUp, ChevronDown, X,
  Filter, ChevronLeft, ChevronRight, Loader2, Save, Plus,
  MapPin, Clock, AlertTriangle, Package, Activity
} from 'lucide-react'
import { api, Parcel, TrackingEvent } from '../../lib/api'
import StatusBadge from '../../components/ui/StatusBadge'
import GlassInput from '../../components/ui/GlassInput'
import { formatDateShort } from '../../lib/utils'
import toast from 'react-hot-toast'

const PAGE_SIZE = 10
const STATUS_OPTS = ['CREATED','PICKED_UP','ARRIVED_HUB','DEPARTED_HUB','IN_TRANSIT','CUSTOMS_CLEARED','OUT_FOR_DELIVERY','DELIVERED','EXCEPTION']
const EVENT_TYPES = ['CREATED','PICKED_UP','ARRIVED_HUB','DEPARTED_HUB','IN_TRANSIT','CUSTOMS_CLEARED','OUT_FOR_DELIVERY','DELIVERED','EXCEPTION']
const SERVICE_TYPES = ['EXPRESS', 'STANDARD', 'FREIGHT']
const FILTER_STATUSES = ['CREATED','IN_TRANSIT','OUT_FOR_DELIVERY','DELIVERED','EXCEPTION']

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
  id: `SH-2024-${String(i+1).padStart(6,'0').replace(/\d/g, d => 'ABCDEFGHIJ'[+d])}`,
  sender_name: ['Alice Johnson','Bob Smith','Carol Lee','David Kim','Eve Brown'][i%5],
  sender_address: '123 Main St', sender_country: ['United States','United Kingdom','Germany','France','Japan'][i%5],
  receiver_name: ['Frank White','Grace Hall','Henry Ford','Iris Chan','Jack Stone'][i%5],
  receiver_address: '456 Oak Ave', receiver_country: ['Australia','Canada','Brazil','UAE','Singapore'][i%5],
  weight_kg: +(1+Math.random()*20).toFixed(1), dimensions: '30x20x15',
  service_type: ['EXPRESS','STANDARD','FREIGHT'][i%3],
  declared_value: Math.floor(50+Math.random()*950),
  current_status: ['CREATED','IN_TRANSIT','OUT_FOR_DELIVERY','DELIVERED','EXCEPTION'][i%5],
  eta: new Date(Date.now()+(i+1)*86400000).toISOString(),
  created_at: new Date(Date.now()-i*3600000*6).toISOString(),
  updated_at: new Date(Date.now()-i*3600000).toISOString(),
}))

type SortKey = keyof Pick<Parcel, 'id'|'sender_name'|'receiver_name'|'current_status'|'created_at'>
type EditTab = 'details' | 'events'
type EditForm = {
  sender_name: string; sender_address: string; sender_country: string
  receiver_name: string; receiver_address: string; receiver_country: string
  weight_kg: number|''; dimensions: string; service_type: string
  declared_value: number|''; current_status: string; eta: string
}

// ── helpers ──────────────────────────────────────────────────────────
function toLocalInput(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString().slice(0,16)
}
function fromLocalInput(s: string) { return s ? new Date(s).toISOString() : new Date().toISOString() }
function fmtDT(iso: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString(undefined, { day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit' })
}

function SelectField({ label, value, onChange, options }: { label:string; value:string; onChange:(v:string)=>void; options:string[] }) {
  return (
    <div>
      <label className="block text-xs mb-1.5 font-body" style={{ color:'var(--text-secondary)' }}>{label}</label>
      <select value={value} onChange={e=>onChange(e.target.value)} className="glass-input w-full px-3 py-2.5 text-sm" style={{ appearance:'none' }}>
        {options.map(o=><option key={o} value={o} style={{ background:'#0a0f1e' }}>{o}</option>)}
      </select>
    </div>
  )
}

// ── EventsTab ────────────────────────────────────────────────────────
function EventsTab({ parcelId, qc }: { parcelId: string; qc: ReturnType<typeof useQueryClient> }) {
  const queryKey = ['events', parcelId]
  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => api.getTrackingEvents(parcelId),
  })

  const [editEvt, setEditEvt] = useState<TrackingEvent|null>(null)
  const [deleteEvt, setDeleteEvt] = useState<TrackingEvent|null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newEvt, setNewEvt] = useState({ event_type:'IN_TRANSIT', location:'', description:'', timestamp: toLocalInput(new Date().toISOString()) })
  const [editForm, setEditForm] = useState<{ event_type:string; location:string; description:string; timestamp:string } | null>(null)

  function openEdit(ev: TrackingEvent) {
    setEditEvt(ev)
    setEditForm({ event_type: ev.event_type, location: ev.location, description: ev.description??'', timestamp: toLocalInput(ev.timestamp) })
  }

  const inv = () => { qc.invalidateQueries({ queryKey }); qc.invalidateQueries({ queryKey: ['parcels'] }) }

  const addMut = useMutation({
    mutationFn: () => api.addTrackingEvent(parcelId, { ...newEvt, timestamp: fromLocalInput(newEvt.timestamp) }),
    onSuccess: () => { inv(); toast.success('Event added'); setShowAdd(false); setNewEvt({ event_type:'IN_TRANSIT', location:'', description:'', timestamp: toLocalInput(new Date().toISOString()) }) },
    onError: (e:any) => toast.error(e?.message ?? 'Failed'),
  })

  const updateMut = useMutation({
    mutationFn: (d: { id:string; payload:any }) => api.updateTrackingEvent(d.id, d.payload),
    onSuccess: () => { inv(); toast.success('Event updated'); setEditEvt(null) },
    onError: (e:any) => toast.error(e?.message ?? 'Failed'),
  })

  const deleteMut = useMutation({
    mutationFn: (id:string) => api.deleteTrackingEvent(id),
    onSuccess: () => { inv(); toast.success('Event deleted'); setDeleteEvt(null) },
    onError: (e:any) => toast.error(e?.message ?? 'Failed'),
  })

  const events: TrackingEvent[] = (data?.events ?? []).slice().sort((a,b)=>new Date(a.timestamp).getTime()-new Date(b.timestamp).getTime())

  if (isLoading) return (
    <div className="space-y-3 py-4">
      {[1,2,3].map(i=><div key={i} className="shimmer h-12 rounded-xl" />)}
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Add button */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-mono" style={{ color:'var(--text-muted)' }}>{events.length} event{events.length!==1?'s':''}</p>
        <button onClick={()=>setShowAdd(v=>!v)} className="btn-primary text-xs px-3 py-2 flex items-center gap-1.5">
          {showAdd ? <X size={11}/> : <Plus size={11}/>}
          {showAdd ? 'Cancel' : 'Add Event'}
        </button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
            style={{ overflow:'hidden' }}>
            <div className="glass-sm p-4 space-y-3" style={{ borderRadius:'14px', borderColor:'rgba(0,229,255,0.2)' }}>
              <p className="text-xs font-mono font-bold" style={{ color:'var(--accent-primary)' }}>NEW EVENT</p>
              <div className="grid grid-cols-3 gap-1.5">
                {EVENT_TYPES.map(t=>(
                  <button key={t} type="button" onClick={()=>setNewEvt(e=>({...e,event_type:t}))}
                    className="px-2 py-1.5 text-xs font-mono truncate transition-all"
                    style={{ borderRadius:'8px', background: newEvt.event_type===t?'rgba(0,229,255,0.1)':'var(--glass-bg)', border:`1px solid ${newEvt.event_type===t?'var(--accent-primary)':'var(--glass-border)'}`, color: newEvt.event_type===t?'var(--accent-primary)':'var(--text-secondary)' }}>
                    {t.replace(/_/g,' ')}
                  </button>
                ))}
              </div>
              <div>
                <label className="block text-xs mb-1 font-body" style={{ color:'var(--text-secondary)' }}>Date & Time</label>
                <input type="datetime-local" value={newEvt.timestamp} onChange={e=>setNewEvt(v=>({...v,timestamp:e.target.value}))}
                  className="glass-input w-full px-3 py-2 text-sm font-mono" style={{ colorScheme:'dark' }} />
                {newEvt.timestamp && new Date(fromLocalInput(newEvt.timestamp))>new Date() && (
                  <p className="flex items-center gap-1 mt-1 text-xs" style={{ color:'#ffab00' }}><AlertTriangle size={10}/> Future time</p>
                )}
              </div>
              <GlassInput label="Location" value={newEvt.location} icon={<MapPin size={12}/>}
                onChange={e=>setNewEvt(v=>({...v,location:e.target.value}))} placeholder="e.g. Lagos Hub, Nigeria" />
              <div>
                <label className="block text-xs mb-1 font-body" style={{ color:'var(--text-secondary)' }}>Description (optional)</label>
                <textarea value={newEvt.description} onChange={e=>setNewEvt(v=>({...v,description:e.target.value}))}
                  rows={2} placeholder="e.g. Package arrived at sorting facility"
                  className="glass-input w-full px-3 py-2 text-sm resize-none" style={{ borderRadius:'10px' }} />
              </div>
              <button onClick={()=>addMut.mutate()} disabled={addMut.isPending||!newEvt.location.trim()}
                className="btn-primary w-full text-sm flex items-center justify-center gap-2 disabled:opacity-40">
                {addMut.isPending?<Loader2 size={13} className="animate-spin"/>:<Plus size={13}/>}
                {addMut.isPending?'Adding…':'Add Event'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeline */}
      {events.length===0 && !showAdd && (
        <p className="text-xs text-center py-8" style={{ color:'var(--text-muted)' }}>No events yet — add the first one above.</p>
      )}

      <div>
        {events.map((ev, i)=>(
          <div key={ev.id} className="flex gap-3 group">
            <div className="flex flex-col items-center pt-1 shrink-0" style={{ width:18 }}>
              <div className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: i===events.length-1?'var(--accent-primary)':'var(--glass-border)', border:'2px solid var(--glass-border)' }} />
              {i<events.length-1 && <div className="flex-1 w-px mt-1" style={{ background:'var(--glass-border)', minHeight:28 }}/>}
            </div>
            <div className="flex-1 pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-mono font-bold" style={{ color:'var(--text-primary)' }}>
                      {ev.event_type.replace(/_/g,' ')}
                    </span>
                    {i===events.length-1 && (
                      <span className="text-xs font-mono px-1 py-0.5 rounded" style={{ background:'rgba(0,229,255,0.1)', color:'var(--accent-primary)', fontSize:'9px' }}>LATEST</span>
                    )}
                  </div>
                  <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color:'var(--text-secondary)' }}>
                    <MapPin size={9}/> {ev.location}
                  </p>
                  {ev.description && <p className="text-xs mt-0.5" style={{ color:'var(--text-muted)' }}>{ev.description}</p>}
                  <p className="text-xs mt-0.5 flex items-center gap-1 font-mono" style={{ color:'var(--text-muted)' }}>
                    <Clock size={9}/> {fmtDT(ev.timestamp)}
                  </p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }} onClick={()=>openEdit(ev)}
                    title="Edit event" className="w-6 h-6 glass-sm flex items-center justify-center"
                    style={{ borderRadius:'7px', color:'var(--accent-secondary)' }}><Pencil size={10}/></motion.button>
                  <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }} onClick={()=>setDeleteEvt(ev)}
                    title="Delete event" className="w-6 h-6 glass-sm flex items-center justify-center"
                    style={{ borderRadius:'7px', color:'#ff1744' }}><Trash2 size={10}/></motion.button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit event modal */}
      <AnimatePresence>
        {editEvt && editForm && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 flex items-center justify-center z-[60] p-4"
            style={{ background:'rgba(5,8,16,0.85)', backdropFilter:'blur(12px)' }}
            onClick={()=>setEditEvt(null)}>
            <motion.div initial={{ scale:0.92, y:16, opacity:0 }} animate={{ scale:1, y:0, opacity:1 }} exit={{ scale:0.92, y:16, opacity:0 }}
              transition={{ ease:[0.23,1,0.32,1], duration:0.28 }}
              className="glass w-full max-w-md" style={{ borderRadius:'22px' }} onClick={e=>e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 pb-0">
                <h3 className="font-display text-lg" style={{ color:'var(--text-primary)' }}>EDIT EVENT</h3>
                <button onClick={()=>setEditEvt(null)} className="w-7 h-7 glass-sm flex items-center justify-center"
                  style={{ borderRadius:'9px', color:'var(--text-muted)' }}><X size={14}/></button>
              </div>
              <div className="p-5 space-y-3">
                <div className="grid grid-cols-3 gap-1.5">
                  {EVENT_TYPES.map(t=>(
                    <button key={t} type="button" onClick={()=>setEditForm(f=>f?{...f,event_type:t}:f)}
                      className="px-2 py-1.5 text-xs font-mono truncate transition-all"
                      style={{ borderRadius:'8px', background: editForm.event_type===t?'rgba(0,229,255,0.1)':'var(--glass-bg)', border:`1px solid ${editForm.event_type===t?'var(--accent-primary)':'var(--glass-border)'}`, color: editForm.event_type===t?'var(--accent-primary)':'var(--text-secondary)' }}>
                      {t.replace(/_/g,' ')}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="block text-xs mb-1 font-body" style={{ color:'var(--text-secondary)' }}>Date & Time</label>
                  <input type="datetime-local" value={editForm.timestamp} onChange={e=>setEditForm(f=>f?{...f,timestamp:e.target.value}:f)}
                    className="glass-input w-full px-3 py-2.5 text-sm font-mono" style={{ colorScheme:'dark' }} />
                  {editForm.timestamp && new Date(fromLocalInput(editForm.timestamp))>new Date() && (
                    <p className="flex items-center gap-1 mt-1 text-xs" style={{ color:'#ffab00' }}><AlertTriangle size={10}/> Future time</p>
                  )}
                </div>
                <GlassInput label="Location" value={editForm.location} icon={<MapPin size={12}/>}
                  onChange={e=>setEditForm(f=>f?{...f,location:e.target.value}:f)} />
                <div>
                  <label className="block text-xs mb-1 font-body" style={{ color:'var(--text-secondary)' }}>Description</label>
                  <textarea value={editForm.description} onChange={e=>setEditForm(f=>f?{...f,description:e.target.value}:f)}
                    rows={2} className="glass-input w-full px-3 py-2 text-sm resize-none" style={{ borderRadius:'10px' }} />
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={()=>setEditEvt(null)} className="btn-secondary flex-1 text-sm">Cancel</button>
                  <button onClick={()=>updateMut.mutate({ id: editEvt.id as unknown as string, payload: { ...editForm, timestamp: fromLocalInput(editForm.timestamp) } })}
                    disabled={updateMut.isPending||!editForm.location.trim()}
                    className="btn-primary flex-1 text-sm flex items-center justify-center gap-2">
                    {updateMut.isPending?<Loader2 size={13} className="animate-spin"/>:<Save size={13}/>}
                    {updateMut.isPending?'Saving…':'Save'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete event confirm */}
      <AnimatePresence>
        {deleteEvt && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 flex items-center justify-center z-[60] p-4"
            style={{ background:'rgba(5,8,16,0.85)', backdropFilter:'blur(12px)' }}
            onClick={()=>setDeleteEvt(null)}>
            <motion.div initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.9, opacity:0 }}
              className="glass p-6 max-w-xs w-full" style={{ borderRadius:'20px', borderColor:'rgba(255,23,68,0.25)' }}
              onClick={e=>e.stopPropagation()}>
              <Trash2 size={24} className="mb-3" style={{ color:'#ff1744' }}/>
              <p className="text-sm font-semibold mb-1" style={{ color:'var(--text-primary)' }}>Delete this event?</p>
              <p className="text-xs mb-1" style={{ color:'var(--text-secondary)' }}>
                <span className="font-mono" style={{ color:'var(--accent-primary)' }}>{deleteEvt.event_type.replace(/_/g,' ')}</span> · {fmtDT(deleteEvt.timestamp)}
              </p>
              <p className="text-xs mb-4" style={{ color:'var(--text-muted)' }}>Parcel status will be recalculated from remaining events.</p>
              <div className="flex gap-2">
                <button onClick={()=>setDeleteEvt(null)} className="btn-secondary flex-1 text-xs">Cancel</button>
                <button onClick={()=>deleteMut.mutate(deleteEvt.id as unknown as string)} disabled={deleteMut.isPending}
                  className="flex-1 text-xs py-2.5 px-3 rounded-xl font-semibold flex items-center justify-center gap-1.5"
                  style={{ background:'#ff1744', color:'#fff', border:'none', cursor:'pointer' }}>
                  {deleteMut.isPending?<Loader2 size={12} className="animate-spin"/>:null} Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────
export default function Parcels() {
  const qc = useQueryClient()
  const [urlParams] = useSearchParams()
  const [search, setSearch] = useState(()=>urlParams.get('search')??'')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortAsc, setSortAsc] = useState(false)
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string|null>(null)
  const [editParcel, setEditParcel] = useState<Parcel|null>(null)
  const [editForm, setEditForm] = useState<EditForm|null>(null)
  const [editTab, setEditTab] = useState<EditTab>('details')

  useEffect(() => {
    setSearch(urlParams.get('search')??''); setPage(1)
  }, [urlParams])

  const params = new URLSearchParams()
  if (search) params.set('search', search)
  if (statusFilter) params.set('status', statusFilter)
  params.set('page', String(page)); params.set('pageSize', String(PAGE_SIZE))

  const { data, isLoading } = useQuery({
    queryKey: ['parcels', search, statusFilter, page],
    queryFn: () => api.getParcels(params.toString()),
    placeholderData: { parcels: MOCK_PARCELS.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE), total: MOCK_PARCELS.length, page, pageSize: PAGE_SIZE },
  })

  const deleteMut = useMutation({
    mutationFn: (id:string) => api.deleteParcel(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey:['parcels'] }); toast.success('Parcel deleted'); setDeleteId(null) },
    onError: () => toast.error('Delete failed'),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }:{ id:string; data:Partial<Parcel> }) => api.updateParcel(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey:['parcels'] }); toast.success('Parcel updated') },
    onError: (e:any) => toast.error(e?.message??'Update failed'),
  })

  function openEdit(parcel: Parcel) {
    setEditParcel(parcel); setEditTab('details')
    setEditForm({
      sender_name: parcel.sender_name??'', sender_address: parcel.sender_address??'',
      sender_country: parcel.sender_country??'United States',
      receiver_name: parcel.receiver_name??'', receiver_address: parcel.receiver_address??'',
      receiver_country: parcel.receiver_country??'United Kingdom',
      weight_kg: parcel.weight_kg??'', dimensions: parcel.dimensions??'',
      service_type: parcel.service_type??'STANDARD',
      declared_value: parcel.declared_value??'',
      current_status: parcel.current_status??'CREATED',
      eta: toLocalInput(parcel.eta??''),
    })
  }

  function setField<K extends keyof EditForm>(key:K, val:EditForm[K]) {
    setEditForm(f=>f?{...f,[key]:val}:f)
  }

  function submitDetails() {
    if (!editParcel||!editForm) return
    updateMut.mutate({ id: editParcel.id, data: {
      ...editForm,
      weight_kg: editForm.weight_kg===''?0:Number(editForm.weight_kg),
      declared_value: editForm.declared_value===''?0:Number(editForm.declared_value),
      eta: editForm.eta ? fromLocalInput(editForm.eta) : undefined,
    }})
  }

  const parcels = data?.parcels??[]
  const total = data?.total??0
  const totalPages = Math.max(1, Math.ceil(total/PAGE_SIZE))
  const sorted = [...parcels].sort((a,b)=>{
    const av=a[sortKey]??'', bv=b[sortKey]??''
    return sortAsc?(av>bv?1:-1):(av<bv?1:-1)
  })
  function toggleSort(key:SortKey) {
    if (key===sortKey) setSortAsc(s=>!s); else { setSortKey(key); setSortAsc(true) }
  }
  const SortIcon = useCallback(({col}:{col:SortKey})=>(
    sortKey===col ? sortAsc?<ChevronUp size={12}/>:<ChevronDown size={12}/> : <ChevronDown size={12} style={{ opacity:0.3 }}/>
  ), [sortKey, sortAsc])

  const TABS: { id:EditTab; label:string; icon:React.ElementType }[] = [
    { id:'details', label:'Details', icon:Package },
    { id:'events',  label:'Events',  icon:Activity },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl" style={{ color:'var(--text-primary)' }}>PARCELS</h1>
        <p className="text-sm mt-1" style={{ color:'var(--text-secondary)' }}>{total.toLocaleString()} total shipments</p>
      </div>

      {/* Filters */}
      <div className="glass p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:'var(--text-muted)' }}/>
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}}
            placeholder="Search by ID, sender, receiver…" className="glass-input w-full pl-9 pr-3 py-2.5 text-sm"/>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} style={{ color:'var(--text-muted)' }}/>
          {FILTER_STATUSES.map(s=>(
            <button key={s} onClick={()=>{setStatusFilter(statusFilter===s?'':s);setPage(1)}}
              className="text-xs font-mono px-3 py-1.5 glass-sm transition-all"
              style={{ borderRadius:'8px', borderColor:statusFilter===s?'var(--accent-primary)':undefined, color:statusFilter===s?'var(--accent-primary)':'var(--text-secondary)' }}>
              {statusFilter===s&&<X size={10} className="inline mr-1"/>}
              {s.replace(/_/g,' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass overflow-hidden" style={{ borderRadius:'16px' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom:'1px solid var(--glass-border)', background:'rgba(255,255,255,0.02)' }}>
                {([['Tracking ID','id'],['Sender','sender_name'],['Receiver','receiver_name'],['Origin',null],['Destination',null],['Status','current_status'],['Created','created_at'],['Actions',null]] as [string,SortKey|null][]).map(([label,key])=>(
                  <th key={label} onClick={key?()=>toggleSort(key):undefined}
                    className="text-left px-4 py-4 font-mono text-xs"
                    style={{ color:'var(--text-muted)', letterSpacing:'0.1em', cursor:key?'pointer':'default', userSelect:'none' }}>
                    <span className="flex items-center gap-1">{label}{key&&<SortIcon col={key}/>}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="sync">
                {isLoading
                  ? Array.from({length:5}).map((_,i)=>(
                    <tr key={i}>{Array.from({length:8}).map((_,j)=>(
                      <td key={j} className="px-4 py-4"><div className="shimmer h-3 rounded" style={{ width:`${40+j*8}%` }}/></td>
                    ))}</tr>
                  ))
                  : sorted.map(parcel=>(
                    <motion.tr key={parcel.id} initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0, height:0 }}
                      whileHover={{ background:'rgba(255,255,255,0.025)' }}
                      style={{ borderBottom:'1px solid rgba(255,255,255,0.04)', borderLeft:'2px solid transparent' }}>
                      <td className="px-4 py-4 font-mono text-xs" style={{ color:'var(--accent-primary)' }}>{parcel.id}</td>
                      <td className="px-4 py-4 text-xs" style={{ color:'var(--text-primary)' }}>{parcel.sender_name}</td>
                      <td className="px-4 py-4 text-xs" style={{ color:'var(--text-primary)' }}>{parcel.receiver_name}</td>
                      <td className="px-4 py-4 text-xs" style={{ color:'var(--text-secondary)' }}>{parcel.sender_country}</td>
                      <td className="px-4 py-4 text-xs" style={{ color:'var(--text-secondary)' }}>{parcel.receiver_country}</td>
                      <td className="px-4 py-4"><StatusBadge status={parcel.current_status} size="sm"/></td>
                      <td className="px-4 py-4 font-mono text-xs" style={{ color:'var(--text-muted)' }}>{formatDateShort(parcel.created_at)}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {[
                            { icon:Eye,    title:'View',   color:'var(--accent-primary)',   action:()=>window.open(`/track?id=${parcel.id}`,'_blank') },
                            { icon:Pencil, title:'Edit',   color:'var(--accent-secondary)', action:()=>openEdit(parcel) },
                            { icon:Trash2, title:'Delete', color:'#ff1744',                  action:()=>setDeleteId(parcel.id) },
                          ].map(({icon:Icon,title,color,action})=>(
                            <motion.button key={title} whileHover={{ scale:1.15 }} whileTap={{ scale:0.9 }}
                              title={title} onClick={action} className="w-7 h-7 glass-sm flex items-center justify-center"
                              style={{ borderRadius:'8px', color }}>
                              <Icon size={12}/>
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
        <div className="flex items-center justify-between px-4 py-4" style={{ borderTop:'1px solid var(--glass-border)' }}>
          <span className="text-xs font-mono" style={{ color:'var(--text-muted)' }}>Page {page} of {totalPages}</span>
          <div className="flex items-center gap-2">
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
              className="p-1.5 glass-sm disabled:opacity-30" style={{ borderRadius:'8px', color:'var(--text-secondary)' }}>
              <ChevronLeft size={14}/>
            </button>
            {Array.from({length:Math.min(5,totalPages)},(_,i)=>{
              const p=Math.max(1,Math.min(totalPages-4,page-2))+i
              return <button key={p} onClick={()=>setPage(p)} className="w-8 h-8 text-xs font-mono glass-sm"
                style={{ borderRadius:'8px', background:p===page?'var(--accent-primary)':undefined, color:p===page?'#050810':'var(--text-secondary)' }}>{p}</button>
            })}
            <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
              className="p-1.5 glass-sm disabled:opacity-30" style={{ borderRadius:'8px', color:'var(--text-secondary)' }}>
              <ChevronRight size={14}/>
            </button>
          </div>
        </div>
      </div>

      {/* ── Edit Modal ── */}
      <AnimatePresence>
        {editParcel && editForm && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 flex items-center justify-center z-modal p-4"
            style={{ background:'rgba(5,8,16,0.78)', backdropFilter:'blur(12px)' }}
            onClick={()=>{ setEditParcel(null); setEditForm(null) }}>
            <motion.div
              initial={{ scale:0.92, opacity:0, y:20 }} animate={{ scale:1, opacity:1, y:0 }}
              exit={{ scale:0.92, opacity:0, y:20 }} transition={{ ease:[0.23,1,0.32,1], duration:0.35 }}
              className="glass w-full max-w-2xl flex flex-col"
              style={{ borderRadius:'24px', maxHeight:'92vh' }}
              onClick={e=>e.stopPropagation()}>

              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
                <div>
                  <h2 className="font-display text-2xl" style={{ color:'var(--text-primary)' }}>EDIT PARCEL</h2>
                  <p className="font-mono text-xs mt-0.5" style={{ color:'var(--accent-primary)' }}>{editParcel.id}</p>
                </div>
                <button onClick={()=>{ setEditParcel(null); setEditForm(null) }}
                  className="w-8 h-8 glass-sm flex items-center justify-center"
                  style={{ borderRadius:'10px', color:'var(--text-muted)' }}>
                  <X size={16}/>
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 px-6 pb-0 shrink-0" style={{ borderBottom:'1px solid var(--glass-border)' }}>
                {TABS.map(tab=>(
                  <button key={tab.id} onClick={()=>setEditTab(tab.id)}
                    className="flex items-center gap-2 px-4 py-3 text-sm font-body transition-all relative"
                    style={{ color: editTab===tab.id?'var(--accent-primary)':'var(--text-secondary)', borderBottom: editTab===tab.id?'2px solid var(--accent-primary)':'2px solid transparent', marginBottom:'-1px' }}>
                    <tab.icon size={14}/>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content — scrollable */}
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <AnimatePresence mode="wait">
                  {editTab==='details' && (
                    <motion.div key="details" initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-10 }}
                      transition={{ duration:0.2 }} className="space-y-5">

                      {/* Sender */}
                      <div>
                        <p className="text-xs font-mono font-bold mb-3" style={{ color:'var(--accent-primary)' }}>SENDER</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <GlassInput label="Full Name" value={editForm.sender_name} onChange={e=>setField('sender_name',e.target.value)}/>
                          <GlassInput label="Address" value={editForm.sender_address} onChange={e=>setField('sender_address',e.target.value)}/>
                          <div className="sm:col-span-2">
                            <SelectField label="Country" value={editForm.sender_country} onChange={v=>setField('sender_country',v)} options={COUNTRIES}/>
                          </div>
                        </div>
                      </div>

                      {/* Receiver */}
                      <div>
                        <p className="text-xs font-mono font-bold mb-3" style={{ color:'var(--accent-primary)' }}>RECEIVER</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <GlassInput label="Full Name" value={editForm.receiver_name} onChange={e=>setField('receiver_name',e.target.value)}/>
                          <GlassInput label="Address" value={editForm.receiver_address} onChange={e=>setField('receiver_address',e.target.value)}/>
                          <div className="sm:col-span-2">
                            <SelectField label="Country" value={editForm.receiver_country} onChange={v=>setField('receiver_country',v)} options={COUNTRIES}/>
                          </div>
                        </div>
                      </div>

                      {/* Package */}
                      <div>
                        <p className="text-xs font-mono font-bold mb-3" style={{ color:'var(--accent-primary)' }}>PACKAGE</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <GlassInput label="Weight (kg)" type="number" min={0} step={0.1} value={editForm.weight_kg}
                            onChange={e=>setField('weight_kg', e.target.value===''?'':+e.target.value)}/>
                          <GlassInput label="Dimensions" placeholder="30x20x15" value={editForm.dimensions}
                            onChange={e=>setField('dimensions',e.target.value)}/>
                          <GlassInput label="Declared Value ($)" type="number" min={0} value={editForm.declared_value}
                            onChange={e=>setField('declared_value', e.target.value===''?'':+e.target.value)}/>
                          <SelectField label="Service" value={editForm.service_type} onChange={v=>setField('service_type',v)} options={SERVICE_TYPES}/>
                        </div>
                      </div>

                      {/* ETA */}
                      <div>
                        <p className="text-xs font-mono font-bold mb-3" style={{ color:'var(--accent-primary)' }}>ETA</p>
                        <div>
                          <label className="block text-xs mb-1.5 font-body" style={{ color:'var(--text-secondary)' }}>Expected Delivery</label>
                          <input type="datetime-local" value={editForm.eta}
                            onChange={e=>setField('eta', e.target.value)}
                            className="glass-input w-full px-4 py-3 text-sm font-mono" style={{ colorScheme:'dark' }}/>
                        </div>
                      </div>

                      {/* Status */}
                      <div>
                        <p className="text-xs font-mono font-bold mb-3" style={{ color:'var(--accent-primary)' }}>STATUS</p>
                        <div className="flex flex-wrap gap-2">
                          {STATUS_OPTS.map(s=>(
                            <button key={s} type="button" onClick={()=>setField('current_status',s)}
                              className="text-xs font-mono px-3 py-2 glass-sm transition-all"
                              style={{ borderRadius:'8px', borderColor:editForm.current_status===s?'var(--accent-primary)':undefined, background:editForm.current_status===s?'rgba(0,229,255,0.08)':undefined, color:editForm.current_status===s?'var(--accent-primary)':'var(--text-secondary)' }}>
                              {s.replace(/_/g,' ')}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button type="button" onClick={()=>{ setEditParcel(null); setEditForm(null) }} className="btn-secondary flex-1 text-sm">Cancel</button>
                        <button type="button" onClick={submitDetails} disabled={updateMut.isPending}
                          className="btn-primary flex-1 text-sm flex items-center justify-center gap-2">
                          {updateMut.isPending?<Loader2 size={14} className="animate-spin"/>:<Save size={14}/>}
                          {updateMut.isPending?'Saving…':'Save Details'}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {editTab==='events' && (
                    <motion.div key="events" initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-10 }}
                      transition={{ duration:0.2 }}>
                      <EventsTab parcelId={editParcel.id} qc={qc}/>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete parcel confirm */}
      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 flex items-center justify-center z-modal"
            style={{ background:'rgba(5,8,16,0.7)', backdropFilter:'blur(8px)' }}
            onClick={()=>setDeleteId(null)}>
            <motion.div initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.9, opacity:0 }}
              className="glass p-8 max-w-sm w-full mx-4" style={{ borderRadius:'24px', borderColor:'rgba(255,23,68,0.3)' }}
              onClick={e=>e.stopPropagation()}>
              <Trash2 size={32} className="mb-4" style={{ color:'#ff1744' }}/>
              <h3 className="font-display text-2xl mb-2" style={{ color:'var(--text-primary)' }}>DELETE PARCEL</h3>
              <p className="text-sm mb-6" style={{ color:'var(--text-secondary)' }}>
                This will permanently remove <span className="font-mono" style={{ color:'var(--accent-primary)' }}>{deleteId}</span> and all its events.
              </p>
              <div className="flex gap-3">
                <button onClick={()=>setDeleteId(null)} className="btn-secondary flex-1 text-sm">Cancel</button>
                <button onClick={()=>deleteMut.mutate(deleteId!)} disabled={deleteMut.isPending}
                  className="flex-1 text-sm py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2"
                  style={{ background:'#ff1744', color:'#fff', border:'none', cursor:'pointer' }}>
                  {deleteMut.isPending?<Loader2 size={14} className="animate-spin"/>:null} Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
