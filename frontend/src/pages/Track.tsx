import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  Search, MapPin, Package, Clock, Weight,
  ChevronDown, ChevronUp, Copy, Check,
  CheckCircle, AlertCircle, Loader2, Navigation
} from 'lucide-react'
import { api, TrackingResult } from '../lib/api'
import StatusBadge from '../components/ui/StatusBadge'
import { formatDate, getDotColor, getStatusLabel, copyToClipboard, timeUntil } from '../lib/utils'
import Footer from '../components/layout/Footer'

function SkeletonRow() {
  return (
    <div className="glass p-6 space-y-3">
      <div className="shimmer h-4 rounded w-1/3" />
      <div className="shimmer h-4 rounded w-2/3" />
      <div className="shimmer h-4 rounded w-1/2" />
    </div>
  )
}

function WorldMapSVG({ origin, dest }: { origin: string; dest: string }) {
  return (
    <div className="relative h-48 glass p-4" style={{ borderRadius: '16px', overflow: 'hidden' }}>
      <svg viewBox="0 0 800 400" className="w-full h-full opacity-30" style={{ color: 'var(--accent-primary)' }}>
        <path fill="rgba(0,229,255,0.15)" stroke="rgba(0,229,255,0.3)" strokeWidth="1"
          d="M0,200 Q200,100 400,200 T800,200 L800,400 L0,400 Z" />
        <ellipse cx="200" cy="180" rx="120" ry="80" fill="rgba(0,229,255,0.08)" stroke="rgba(0,229,255,0.2)" strokeWidth="0.5"/>
        <ellipse cx="500" cy="160" rx="150" ry="90" fill="rgba(0,229,255,0.08)" stroke="rgba(0,229,255,0.2)" strokeWidth="0.5"/>
        <ellipse cx="650" cy="220" rx="80" ry="60" fill="rgba(0,229,255,0.06)" stroke="rgba(0,229,255,0.15)" strokeWidth="0.5"/>
        {/* Route arc */}
        <path
          d="M 200 170 Q 400 80 580 160"
          fill="none"
          stroke="var(--accent-primary)"
          strokeWidth="2"
          strokeDasharray="8 4"
          style={{ animation: 'mapDraw 2s ease-out forwards' }}
        />
        {/* Origin pin */}
        <circle cx="200" cy="170" r="6" fill="var(--accent-primary)" opacity="0.9">
          <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.9;0.4;0.9" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="200" cy="170" r="4" fill="var(--accent-primary)" />
        {/* Current location pin */}
        <circle cx="390" cy="115" r="8" fill="var(--accent-primary)" opacity="0.8">
          <animate attributeName="r" values="8;14;8" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="390" cy="115" r="5" fill="white" />
        {/* Destination pin */}
        <circle cx="580" cy="160" r="6" fill="#00e676" opacity="0.9">
          <animate attributeName="r" values="6;10;6" dur="2.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.9;0.4;0.9" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="580" cy="160" r="4" fill="#00e676" />
      </svg>
      <div className="absolute bottom-3 left-3 right-3 flex justify-between text-xs font-mono"
        style={{ color: 'var(--text-secondary)' }}>
        <span>📍 {origin}</span>
        <span>🏁 {dest}</span>
      </div>
    </div>
  )
}

function TimelineItem({ event, index, isLast }: {
  event: { event_type: string; location: string; description: string; timestamp: string }
  index: number
  isLast: boolean
}) {
  const isActive = index === 0
  const color = getDotColor(event.event_type)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="relative flex gap-4"
    >
      <div className="relative flex flex-col items-center">
        <div
          className="w-10 h-10 glass-sm flex items-center justify-center shrink-0 z-10"
          style={{
            borderRadius: '50%',
            border: isActive ? `2px solid ${color}` : '1px solid var(--glass-border)',
            background: isActive ? `${color}18` : 'var(--glass-bg)',
          }}
        >
          {isActive
            ? <Loader2 size={16} style={{ color, animation: 'spin 2s linear infinite' }} />
            : <CheckCircle size={16} style={{ color }} />
          }
        </div>
        {!isLast && (
          <div className="w-px flex-1 mt-1" style={{ background: 'var(--glass-border)', minHeight: '32px' }} />
        )}
      </div>

      <div
        className="pb-6 flex-1 glass p-4"
        style={{
          borderLeft: isActive ? `2px solid ${color}` : '2px solid transparent',
          borderRadius: '12px',
          background: isActive ? `${color}06` : 'var(--glass-bg)',
          marginBottom: isLast ? 0 : '8px',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <h4 className="text-sm font-semibold" style={{ color: isActive ? color : 'var(--text-primary)' }}>
            {getStatusLabel(event.event_type)}
          </h4>
          <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
            {formatDate(event.timestamp)}
          </span>
        </div>
        <p className="text-xs flex items-center gap-1 mb-1" style={{ color: 'var(--text-secondary)' }}>
          <MapPin size={10} /> {event.location}
        </p>
        {event.description && (
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{event.description}</p>
        )}
      </div>
    </motion.div>
  )
}

function AccordionRow({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="glass" style={{ borderRadius: '12px', overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-white/5"
      >
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown size={16} style={{ color: 'var(--text-secondary)' }} />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            style={{ overflow: 'hidden', borderTop: '1px solid var(--glass-border)' }}
          >
            <div className="px-5 py-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1.5 text-sm border-b" style={{ borderColor: 'var(--glass-border)' }}>
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span className="font-mono" style={{ color: 'var(--text-primary)' }}>{value}</span>
    </div>
  )
}

export default function Track() {
  const [params, setParams] = useSearchParams()
  const [input, setInput] = useState(params.get('id') ?? '')
  const [searchId, setSearchId] = useState(params.get('id') ?? '')
  const [copied, setCopied] = useState(false)
  const [shake, setShake] = useState(false)
  const [eta, setEta] = useState('')

  const { data, isLoading, isError, error } = useQuery<TrackingResult>({
    queryKey: ['track', searchId],
    queryFn: () => api.track(searchId),
    enabled: !!searchId,
    retry: 1,
  })

  useEffect(() => {
    if (!data?.parcel?.eta) return
    const iv = setInterval(() => setEta(timeUntil(data.parcel.eta)), 1000)
    setEta(timeUntil(data.parcel.eta))
    return () => clearInterval(iv)
  }, [data?.parcel?.eta])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) { setShake(true); setTimeout(() => setShake(false), 500); return }
    setSearchId(input.trim())
    setParams({ id: input.trim() })
  }

  async function handleCopy() {
    if (!data?.parcel.id) return
    await copyToClipboard(data.parcel.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const parcel = data?.parcel
  const events = data?.events ?? []

  return (
    <div className="relative z-content pt-28 pb-20 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="font-display text-4xl mb-2" style={{ color: 'var(--text-primary)' }}>TRACK SHIPMENT</h1>
          <p className="text-sm font-body" style={{ color: 'var(--text-secondary)' }}>
            Enter your tracking ID to get real-time updates on your parcel.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.form
          onSubmit={handleSearch}
          animate={shake ? { x: [-8, 8, -6, 6, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          <div className="glass flex items-center gap-3 p-2" style={{ borderRadius: '16px' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Enter tracking number (e.g. SH-2024-XXXXXXX)"
              className="flex-1 bg-transparent px-3 py-3 text-sm font-mono outline-none"
              style={{ color: 'var(--text-primary)' }}
            />
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              type="submit"
              className="flex items-center gap-2 font-semibold text-sm px-5 py-3"
              style={{ background: 'var(--accent-primary)', color: '#050810', borderRadius: '12px', border: 'none', cursor: 'pointer' }}>
              <Search size={16} /> Track
            </motion.button>
          </div>
        </motion.form>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="space-y-4">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        )}

        {/* Error */}
        {isError && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="glass p-8 text-center" style={{ borderColor: 'rgba(255,23,68,0.3)' }}>
            <AlertCircle size={40} className="mx-auto mb-4" style={{ color: '#ff1744' }} />
            <h3 className="font-display text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>SHIPMENT NOT FOUND</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {(error as Error)?.message ?? 'Unable to find tracking information for this ID.'}
            </p>
          </motion.div>
        )}

        {/* Result */}
        {parcel && (
          <AnimatePresence>
            <motion.div
              key={parcel.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Main Card */}
              <div className="glass p-6 md:p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Left Zone */}
                  <div className="space-y-5">
                    <div>
                      <p className="text-xs font-mono mb-1" style={{ color: 'var(--text-muted)' }}>TRACKING ID</p>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xl" style={{ color: 'var(--accent-primary)' }}>
                          {parcel.id}
                        </span>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={handleCopy}
                          className="p-1.5 glass-sm transition-colors"
                          style={{ borderRadius: '8px', color: copied ? '#00e676' : 'var(--text-secondary)' }}
                        >
                          {copied ? <Check size={14} /> : <Copy size={14} />}
                        </motion.button>
                        {copied && (
                          <motion.span
                            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="text-xs font-mono" style={{ color: '#00e676' }}>
                            ✓ Copied!
                          </motion.span>
                        )}
                      </div>
                    </div>

                    <StatusBadge status={parcel.current_status} pulse size="md" />

                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <p className="text-xs font-mono mb-1" style={{ color: 'var(--text-muted)' }}>FROM</p>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{parcel.sender_country}</p>
                      </div>
                      <motion.div
                        initial={{ x: -10 }} animate={{ x: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex-1 flex items-center justify-center gap-1"
                        style={{ color: 'var(--accent-primary)' }}>
                        <div className="flex-1 h-px" style={{ background: 'var(--accent-primary)', opacity: 0.3 }} />
                        <Navigation size={16} />
                        <div className="flex-1 h-px" style={{ background: 'var(--accent-primary)', opacity: 0.3 }} />
                      </motion.div>
                      <div className="text-center">
                        <p className="text-xs font-mono mb-1" style={{ color: 'var(--text-muted)' }}>TO</p>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{parcel.receiver_country}</p>
                      </div>
                    </div>

                    {parcel.eta && parcel.current_status !== 'DELIVERED' && (
                      <div className="glass-sm p-3" style={{ borderRadius: '12px' }}>
                        <p className="text-xs font-mono mb-1" style={{ color: 'var(--text-muted)' }}>ESTIMATED ARRIVAL</p>
                        <p className="font-mono text-lg" style={{ color: 'var(--accent-warm)' }}>{eta}</p>
                      </div>
                    )}

                    <div className="glass-sm p-4 space-y-2" style={{ borderRadius: '12px' }}>
                      {[
                        ['Service', parcel.service_type],
                        ['Weight', `${parcel.weight_kg} kg`],
                        ['Dimensions', parcel.dimensions || 'N/A'],
                        ['Value', `$${parcel.declared_value?.toLocaleString() ?? '—'}`],
                      ].map(([l, v]) => <DataRow key={l} label={l} value={v} />)}
                    </div>
                  </div>

                  {/* Right Zone — Map */}
                  <div className="space-y-4">
                    <WorldMapSVG origin={parcel.sender_country} dest={parcel.receiver_country} />
                    <div className="glass-sm p-4 space-y-2" style={{ borderRadius: '12px' }}>
                      {[
                        ['Sender', parcel.sender_name],
                        ['Origin', `${parcel.sender_address.slice(0, 20)}…`],
                        ['Receiver', parcel.receiver_name],
                        ['Destination', `${parcel.receiver_address.slice(0, 20)}…`],
                      ].map(([l, v]) => <DataRow key={l} label={l} value={v} />)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              {events.length > 0 && (
                <div className="space-y-4">
                  <h2 className="font-display text-2xl" style={{ color: 'var(--text-primary)' }}>TRACKING HISTORY</h2>
                  <div className="space-y-2">
                    {events.map((ev, i) => (
                      <TimelineItem key={ev.id} event={ev} index={i} isLast={i === events.length - 1} />
                    ))}
                  </div>
                </div>
              )}

              {/* Accordion Details */}
              <div className="space-y-3">
                <h2 className="font-display text-2xl" style={{ color: 'var(--text-primary)' }}>SHIPMENT DETAILS</h2>
                <AccordionRow title="Package Contents">
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>General merchandise — declared value ${parcel.declared_value?.toLocaleString() ?? '—'}</p>
                </AccordionRow>
                <AccordionRow title="Handling Instructions">
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Handle with care. Keep upright. Fragile contents.</p>
                </AccordionRow>
                <AccordionRow title="Sender Info">
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {parcel.sender_name} · {parcel.sender_country} · ••••••••••
                  </p>
                </AccordionRow>
                <AccordionRow title="Receiver Info">
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {parcel.receiver_name} · {parcel.receiver_country} · ••••••••••
                  </p>
                </AccordionRow>
                <AccordionRow title="Insurance Details">
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Standard coverage up to declared value of ${parcel.declared_value?.toLocaleString() ?? '—'}.</p>
                </AccordionRow>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
      <Footer />
    </div>
  )
}
