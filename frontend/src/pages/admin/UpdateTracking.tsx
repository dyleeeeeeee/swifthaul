import { useState } from 'react'
import { motion } from 'framer-motion'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Plus, MapPin, Loader2, CheckCircle } from 'lucide-react'
import { api } from '../../lib/api'
import GlassInput from '../../components/ui/GlassInput'
import StatusBadge from '../../components/ui/StatusBadge'
import toast from 'react-hot-toast'

const EVENT_TYPES = [
  'CREATED', 'PICKED_UP', 'ARRIVED_HUB', 'DEPARTED_HUB',
  'IN_TRANSIT', 'CUSTOMS_CLEARED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'EXCEPTION',
]

export default function UpdateTracking() {
  const qc = useQueryClient()
  const [parcelId, setParcelId] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [event, setEvent] = useState({
    event_type: 'IN_TRANSIT',
    location: '',
    description: '',
  })
  const [success, setSuccess] = useState(false)

  const mut = useMutation({
    mutationFn: () => api.addTrackingEvent(parcelId, event),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['track', parcelId] })
      setSuccess(true)
      setTimeout(() => { setSuccess(false); setEvent({ event_type: 'IN_TRANSIT', location: '', description: '' }) }, 3000)
      toast.success('Tracking event added')
    },
    onError: () => toast.error('Failed to add event'),
  })

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl" style={{ color: 'var(--text-primary)' }}>UPDATE TRACKING</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Add a new tracking event to any shipment.</p>
      </div>

      {/* Step 1: Find Parcel */}
      <div className="glass p-6" style={{ borderRadius: '20px' }}>
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>1. Find Shipment</h3>
        <div className="flex gap-3">
          <div className="flex-1">
            <GlassInput
              label="Tracking ID"
              value={parcelId}
              onChange={e => { setParcelId(e.target.value.toUpperCase()); setConfirmed(false) }}
              icon={<Search size={14} />}
              placeholder="SH-2024-XXXXXX"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
            onClick={() => setConfirmed(true)}
            disabled={!parcelId.trim()}
            className="btn-primary text-sm flex items-center gap-2 mt-0.5 self-end px-5 py-3 disabled:opacity-40">
            <Search size={14} /> Find
          </motion.button>
        </div>

        {confirmed && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="mt-3 glass-sm px-4 py-3 flex items-center gap-2"
            style={{ borderRadius: '12px', borderColor: 'rgba(0,229,255,0.3)' }}>
            <CheckCircle size={14} style={{ color: '#00e676' }} />
            <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
              Shipment <span style={{ color: 'var(--accent-primary)' }}>{parcelId}</span> found
            </span>
          </motion.div>
        )}
      </div>

      {/* Step 2: Add Event */}
      {confirmed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass p-6 space-y-5"
          style={{ borderRadius: '20px' }}
        >
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>2. Add Tracking Event</h3>

          {/* Event Type Selector */}
          <div>
            <label className="block text-sm mb-3 font-body" style={{ color: 'var(--text-secondary)' }}>Event Type</label>
            <div className="grid grid-cols-3 gap-2">
              {EVENT_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => setEvent(e => ({ ...e, event_type: type }))}
                  className="px-3 py-2.5 text-xs font-mono text-left transition-all"
                  style={{
                    borderRadius: '10px',
                    background: event.event_type === type ? 'rgba(0,229,255,0.1)' : 'var(--glass-bg)',
                    border: `1px solid ${event.event_type === type ? 'var(--accent-primary)' : 'var(--glass-border)'}`,
                    color: event.event_type === type ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  }}>
                  {type.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <StatusBadge status={event.event_type} size="sm" />
          </div>

          {/* Location */}
          <GlassInput
            label="Location"
            value={event.location}
            onChange={e => setEvent(prev => ({ ...prev, location: e.target.value }))}
            icon={<MapPin size={14} />}
            placeholder="e.g. Frankfurt Hub, Germany"
          />

          {/* Description */}
          <div>
            <label className="block text-sm mb-1.5 font-body" style={{ color: 'var(--text-secondary)' }}>
              Description (optional)
            </label>
            <textarea
              value={event.description}
              onChange={e => setEvent(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              placeholder="e.g. Parcel arrived at sorting facility, processing for next dispatch"
              className="glass-input w-full px-4 py-3 text-sm resize-none"
              style={{ borderRadius: '12px' }}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
            onClick={() => mut.mutate()}
            disabled={mut.isPending || !event.location.trim() || success}
            className="btn-primary w-full flex items-center justify-center gap-2 font-semibold disabled:opacity-40"
          >
            {mut.isPending ? (
              <><Loader2 size={14} className="animate-spin" /> Adding Event…</>
            ) : success ? (
              <><CheckCircle size={14} /> Event Added!</>
            ) : (
              <><Plus size={14} /> Add Tracking Event</>
            )}
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}
