import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Search, Plus, MapPin, Loader2, CheckCircle, Pencil,
  Trash2, Clock, ChevronDown, ChevronUp, X, Save, AlertTriangle
} from 'lucide-react'
import { api, TrackingEvent } from '../../lib/api'
import GlassInput from '../../components/ui/GlassInput'
import StatusBadge from '../../components/ui/StatusBadge'
import toast from 'react-hot-toast'

const EVENT_TYPES = [
  'CREATED', 'PICKED_UP', 'ARRIVED_HUB', 'DEPARTED_HUB',
  'IN_TRANSIT', 'CUSTOMS_CLEARED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'EXCEPTION',
]

function toLocalInput(isoOrEmpty: string): string {
  if (!isoOrEmpty) return ''
  const d = new Date(isoOrEmpty)
  if (isNaN(d.getTime())) return ''
  // datetime-local needs "YYYY-MM-DDTHH:mm"
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16)
}

function fromLocalInput(localStr: string): string {
  if (!localStr) return new Date().toISOString()
  return new Date(localStr).toISOString()
}

function formatDateTime(iso: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// ─── Edit Event Modal ───────────────────────────────────────────────
type EditEventModalProps = {
  event: TrackingEvent
  onClose: () => void
  onSave: (data: Partial<TrackingEvent>) => void
  isPending: boolean
}

function EditEventModal({ event, onClose, onSave, isPending }: EditEventModalProps) {
  const [form, setForm] = useState({
    event_type: event.event_type,
    location: event.location,
    description: event.description ?? '',
    timestamp: toLocalInput(event.timestamp),
  })

  const isFuture = form.timestamp && new Date(fromLocalInput(form.timestamp)) > new Date()

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-modal p-4"
      style={{ background: 'rgba(5,8,16,0.8)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.92, y: 20, opacity: 0 }}
        transition={{ ease: [0.23, 1, 0.32, 1], duration: 0.3 }}
        className="glass w-full max-w-lg"
        style={{ borderRadius: '24px' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 pb-0">
          <div>
            <h2 className="font-display text-xl" style={{ color: 'var(--text-primary)' }}>EDIT EVENT</h2>
            <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>{event.id}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 glass-sm flex items-center justify-center"
            style={{ borderRadius: '10px', color: 'var(--text-muted)' }}>
            <X size={15} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Event type */}
          <div>
            <label className="block text-xs mb-2 font-body" style={{ color: 'var(--text-secondary)' }}>Event Type</label>
            <div className="grid grid-cols-3 gap-1.5">
              {EVENT_TYPES.map(t => (
                <button key={t} type="button" onClick={() => setForm(f => ({ ...f, event_type: t }))}
                  className="px-2 py-2 text-xs font-mono text-left transition-all truncate"
                  style={{
                    borderRadius: '8px',
                    background: form.event_type === t ? 'rgba(0,229,255,0.1)' : 'var(--glass-bg)',
                    border: `1px solid ${form.event_type === t ? 'var(--accent-primary)' : 'var(--glass-border)'}`,
                    color: form.event_type === t ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  }}>
                  {t.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Timestamp */}
          <div>
            <label className="block text-xs mb-1.5 font-body" style={{ color: 'var(--text-secondary)' }}>
              Date & Time
            </label>
            <input
              type="datetime-local"
              value={form.timestamp}
              onChange={e => setForm(f => ({ ...f, timestamp: e.target.value }))}
              className="glass-input w-full px-4 py-3 text-sm font-mono"
              style={{ colorScheme: 'dark' }}
            />
            {isFuture && (
              <p className="flex items-center gap-1 mt-1.5 text-xs" style={{ color: '#ffab00' }}>
                <AlertTriangle size={11} /> This time is in the future
              </p>
            )}
          </div>

          <GlassInput label="Location" value={form.location} icon={<MapPin size={13} />}
            onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
            placeholder="e.g. Frankfurt Hub, Germany" />

          <div>
            <label className="block text-xs mb-1.5 font-body" style={{ color: 'var(--text-secondary)' }}>
              Description (optional)
            </label>
            <textarea value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2} placeholder="Additional details…"
              className="glass-input w-full px-4 py-3 text-sm resize-none"
              style={{ borderRadius: '12px' }} />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 text-sm">Cancel</button>
            <button type="button" disabled={isPending || !form.location.trim()}
              onClick={() => onSave({
                event_type: form.event_type,
                location: form.location,
                description: form.description,
                timestamp: fromLocalInput(form.timestamp),
              })}
              className="btn-primary flex-1 text-sm flex items-center justify-center gap-2">
              {isPending ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              {isPending ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Delete Confirm ─────────────────────────────────────────────────
function DeleteConfirm({ event, onClose, onConfirm, isPending }: {
  event: TrackingEvent; onClose: () => void; onConfirm: () => void; isPending: boolean
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-modal p-4"
      style={{ background: 'rgba(5,8,16,0.8)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="glass p-8 max-w-sm w-full" style={{ borderRadius: '24px', borderColor: 'rgba(255,23,68,0.3)' }}
        onClick={e => e.stopPropagation()}>
        <Trash2 size={28} className="mb-3" style={{ color: '#ff1744' }} />
        <h3 className="font-display text-xl mb-1" style={{ color: 'var(--text-primary)' }}>DELETE EVENT</h3>
        <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
          <span className="font-mono" style={{ color: 'var(--accent-primary)' }}>{event.event_type.replace(/_/g, ' ')}</span> at {formatDateTime(event.timestamp)}
        </p>
        <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
          The parcel status will be recalculated from remaining events.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1 text-sm">Cancel</button>
          <button onClick={onConfirm} disabled={isPending}
            className="flex-1 text-sm py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2"
            style={{ background: '#ff1744', color: '#fff', border: 'none', cursor: 'pointer' }}>
            {isPending ? <Loader2 size={13} className="animate-spin" /> : null} Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────
export default function UpdateTracking() {
  const qc = useQueryClient()
  const [inputId, setInputId] = useState('')
  const [parcelId, setParcelId] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editEvent, setEditEvent] = useState<TrackingEvent | null>(null)
  const [deleteEvent, setDeleteEvent] = useState<TrackingEvent | null>(null)
  const [newEvent, setNewEvent] = useState({
    event_type: 'IN_TRANSIT',
    location: '',
    description: '',
    timestamp: toLocalInput(new Date().toISOString()),
  })

  // Fetch parcel + events when parcelId is set
  const { data, isLoading, isError } = useQuery({
    queryKey: ['events', parcelId],
    queryFn: () => api.getTrackingEvents(parcelId),
    enabled: !!parcelId,
    retry: false,
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['events', parcelId] })

  const addMut = useMutation({
    mutationFn: () => api.addTrackingEvent(parcelId, {
      event_type: newEvent.event_type,
      location: newEvent.location,
      description: newEvent.description,
      timestamp: fromLocalInput(newEvent.timestamp),
    }),
    onSuccess: () => {
      invalidate()
      toast.success('Event added')
      setShowAddForm(false)
      setNewEvent({ event_type: 'IN_TRANSIT', location: '', description: '', timestamp: toLocalInput(new Date().toISOString()) })
    },
    onError: (err: any) => toast.error(err?.message ?? 'Failed to add event'),
  })

  const updateMut = useMutation({
    mutationFn: (data: { id: string; payload: Partial<TrackingEvent> }) =>
      api.updateTrackingEvent(data.id, data.payload),
    onSuccess: () => { invalidate(); toast.success('Event updated'); setEditEvent(null) },
    onError: (err: any) => toast.error(err?.message ?? 'Failed to update event'),
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.deleteTrackingEvent(id),
    onSuccess: () => { invalidate(); toast.success('Event deleted'); setDeleteEvent(null) },
    onError: (err: any) => toast.error(err?.message ?? 'Failed to delete event'),
  })

  function handleSearch() {
    const cleaned = inputId.trim().toUpperCase()
    if (!cleaned) return
    setParcelId(cleaned)
    setShowAddForm(false)
  }

  const events: TrackingEvent[] = (data?.events ?? []).slice().sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )
  const parcel = data?.parcel

  const isFutureNew = newEvent.timestamp && new Date(fromLocalInput(newEvent.timestamp)) > new Date()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl" style={{ color: 'var(--text-primary)' }}>UPDATE TRACKING</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Search a shipment, manage its events and timestamps.
        </p>
      </div>

      {/* Search */}
      <div className="glass p-5" style={{ borderRadius: '20px' }}>
        <div className="flex gap-3">
          <div className="flex-1">
            <GlassInput
              label="Tracking ID"
              value={inputId}
              onChange={e => setInputId(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              icon={<Search size={13} />}
              placeholder="SH-2024-XXXXXX"
            />
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
            onClick={handleSearch} disabled={!inputId.trim() || isLoading}
            className="btn-primary text-sm self-end mb-0.5 px-5 py-3 flex items-center gap-2 disabled:opacity-40">
            {isLoading ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
            Find
          </motion.button>
        </div>

        {isError && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mt-3 text-xs font-mono px-4 py-2 rounded-xl"
            style={{ background: 'rgba(255,23,68,0.08)', color: '#ff1744', border: '1px solid rgba(255,23,68,0.2)' }}>
            Parcel not found — check the ID and try again.
          </motion.p>
        )}
      </div>

      {/* Parcel summary */}
      {parcel && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="glass p-5" style={{ borderRadius: '20px' }}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="font-mono text-sm font-bold" style={{ color: 'var(--accent-primary)' }}>{parcel.id}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                {parcel.sender_name} → {parcel.receiver_name}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {parcel.sender_country} → {parcel.receiver_country}
              </p>
            </div>
            <StatusBadge status={parcel.current_status} size="sm" />
          </div>
        </motion.div>
      )}

      {/* Timeline */}
      {parcel && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="glass p-5 space-y-1" style={{ borderRadius: '20px' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Event History ({events.length})
            </h3>
            <button onClick={() => setShowAddForm(v => !v)}
              className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5">
              {showAddForm ? <ChevronUp size={12} /> : <Plus size={12} />}
              {showAddForm ? 'Cancel' : 'Add Event'}
            </button>
          </div>

          {events.length === 0 && (
            <p className="text-xs text-center py-6" style={{ color: 'var(--text-muted)' }}>No events yet.</p>
          )}

          {/* Event rows */}
          <div className="space-y-0">
            {events.map((ev, i) => (
              <div key={ev.id} className="flex gap-3 group">
                {/* Timeline spine */}
                <div className="flex flex-col items-center pt-1 shrink-0" style={{ width: 20 }}>
                  <div className="w-3 h-3 rounded-full shrink-0"
                    style={{ background: i === events.length - 1 ? 'var(--accent-primary)' : 'var(--glass-border)', border: '2px solid var(--glass-border)' }} />
                  {i < events.length - 1 && (
                    <div className="flex-1 w-px mt-1" style={{ background: 'var(--glass-border)', minHeight: 32 }} />
                  )}
                </div>

                {/* Event card */}
                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
                          {ev.event_type.replace(/_/g, ' ')}
                        </span>
                        {i === events.length - 1 && (
                          <span className="text-xs font-mono px-1.5 py-0.5 rounded"
                            style={{ background: 'rgba(0,229,255,0.1)', color: 'var(--accent-primary)', fontSize: '10px' }}>
                            LATEST
                          </span>
                        )}
                      </div>
                      <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                        <MapPin size={10} /> {ev.location}
                      </p>
                      {ev.description && (
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{ev.description}</p>
                      )}
                      <p className="text-xs mt-1 flex items-center gap-1 font-mono"
                        style={{ color: 'var(--text-muted)' }}>
                        <Clock size={10} /> {formatDateTime(ev.timestamp)}
                      </p>
                    </div>

                    {/* Actions — visible on hover */}
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        title="Edit event" onClick={() => setEditEvent(ev)}
                        className="w-7 h-7 glass-sm flex items-center justify-center"
                        style={{ borderRadius: '8px', color: 'var(--accent-secondary)' }}>
                        <Pencil size={11} />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        title="Delete event" onClick={() => setDeleteEvent(ev)}
                        className="w-7 h-7 glass-sm flex items-center justify-center"
                        style={{ borderRadius: '8px', color: '#ff1744' }}>
                        <Trash2 size={11} />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add new event form — inline below timeline */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} transition={{ ease: [0.23, 1, 0.32, 1], duration: 0.3 }}
                style={{ overflow: 'hidden' }}>
                <div className="pt-4 border-t space-y-4" style={{ borderColor: 'var(--glass-border)' }}>
                  <p className="text-xs font-mono font-bold" style={{ color: 'var(--accent-primary)' }}>NEW EVENT</p>

                  {/* Event type */}
                  <div>
                    <label className="block text-xs mb-2 font-body" style={{ color: 'var(--text-secondary)' }}>Event Type</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {EVENT_TYPES.map(t => (
                        <button key={t} type="button" onClick={() => setNewEvent(e => ({ ...e, event_type: t }))}
                          className="px-2 py-2 text-xs font-mono text-left transition-all truncate"
                          style={{
                            borderRadius: '8px',
                            background: newEvent.event_type === t ? 'rgba(0,229,255,0.1)' : 'var(--glass-bg)',
                            border: `1px solid ${newEvent.event_type === t ? 'var(--accent-primary)' : 'var(--glass-border)'}`,
                            color: newEvent.event_type === t ? 'var(--accent-primary)' : 'var(--text-secondary)',
                          }}>
                          {t.replace(/_/g, ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div>
                    <label className="block text-xs mb-1.5 font-body" style={{ color: 'var(--text-secondary)' }}>
                      Date & Time <span style={{ color: 'var(--text-muted)' }}>(defaults to now)</span>
                    </label>
                    <input type="datetime-local" value={newEvent.timestamp}
                      onChange={e => setNewEvent(ev => ({ ...ev, timestamp: e.target.value }))}
                      className="glass-input w-full px-4 py-3 text-sm font-mono"
                      style={{ colorScheme: 'dark' }} />
                    {isFutureNew && (
                      <p className="flex items-center gap-1 mt-1.5 text-xs" style={{ color: '#ffab00' }}>
                        <AlertTriangle size={11} /> This time is in the future
                      </p>
                    )}
                  </div>

                  <GlassInput label="Location" value={newEvent.location} icon={<MapPin size={13} />}
                    onChange={e => setNewEvent(ev => ({ ...ev, location: e.target.value }))}
                    placeholder="e.g. Lagos Hub, Nigeria" />

                  <div>
                    <label className="block text-xs mb-1.5 font-body" style={{ color: 'var(--text-secondary)' }}>
                      Description (optional)
                    </label>
                    <textarea value={newEvent.description}
                      onChange={e => setNewEvent(ev => ({ ...ev, description: e.target.value }))}
                      rows={2} placeholder="e.g. Package arrived at sorting facility"
                      className="glass-input w-full px-4 py-3 text-sm resize-none"
                      style={{ borderRadius: '12px' }} />
                  </div>

                  <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
                    onClick={() => addMut.mutate()}
                    disabled={addMut.isPending || !newEvent.location.trim()}
                    className="btn-primary w-full flex items-center justify-center gap-2 font-semibold disabled:opacity-40">
                    {addMut.isPending
                      ? <><Loader2 size={13} className="animate-spin" /> Adding…</>
                      : <><Plus size={13} /> Add Event</>}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {editEvent && (
          <EditEventModal
            event={editEvent}
            onClose={() => setEditEvent(null)}
            isPending={updateMut.isPending}
            onSave={payload => updateMut.mutate({ id: editEvent.id as unknown as string, payload })}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteEvent && (
          <DeleteConfirm
            event={deleteEvent}
            onClose={() => setDeleteEvent(null)}
            isPending={deleteMut.isPending}
            onConfirm={() => deleteMut.mutate(deleteEvent.id as unknown as string)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
