import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, Copy, Plus, Eye, Share2, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { api, CreateParcelInput } from '../../lib/api'
import GlassInput from '../../components/ui/GlassInput'
import { copyToClipboard } from '../../lib/utils'
import toast from 'react-hot-toast'

const COUNTRIES = [
  'United States', 'United Kingdom', 'Germany', 'France', 'Japan',
  'Australia', 'Canada', 'Brazil', 'UAE', 'Singapore', 'Nigeria',
  'India', 'China', 'South Korea', 'Mexico',
]
const SERVICE_TYPES = [
  { value: 'EXPRESS', label: 'Express Overnight', desc: 'Next-day delivery, guaranteed by 10:30 AM' },
  { value: 'STANDARD', label: 'Standard Freight', desc: 'Cost-effective, 3–5 business days' },
  { value: 'FREIGHT', label: 'Air Freight', desc: 'International air, 2–4 business days' },
]
const STEP_LABELS = ['Sender Info', 'Receiver Info', 'Package Details', 'Review & Submit']

type FormData = CreateParcelInput & {
  sender_company?: string
  sender_phone?: string
  receiver_company?: string
  receiver_phone?: string
  contents?: string
}

const EMPTY: FormData = {
  sender_name: '', sender_address: '', sender_country: 'United States',
  sender_company: '', sender_phone: '',
  receiver_name: '', receiver_address: '', receiver_country: 'United Kingdom',
  receiver_company: '', receiver_phone: '',
  weight_kg: 0, dimensions: '', service_type: 'STANDARD', declared_value: 0,
  contents: '',
}

// Only sender_name and receiver_name are truly required — everything else is optional
function validateStep(step: number, form: FormData): string | null {
  if (step === 0 && !form.sender_name.trim()) return 'Sender name is required'
  if (step === 1 && !form.receiver_name.trim()) return 'Receiver name is required'
  return null
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {Array.from({ length: total }).map((_, i) => {
        const done = i < current, active = i === current
        return (
          <div key={i} className="flex items-center flex-1">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono shrink-0 transition-all duration-300"
              style={{
                background: done ? 'var(--accent-primary)' : active ? 'rgba(0,229,255,0.15)' : 'var(--glass-bg)',
                border: `2px solid ${done || active ? 'var(--accent-primary)' : 'var(--glass-border)'}`,
                color: done ? '#050810' : active ? 'var(--accent-primary)' : 'var(--text-muted)',
              }}>
              {done ? <Check size={12} /> : i + 1}
            </div>
            {i < total - 1 && (
              <div className="flex-1 h-px mx-2" style={{ background: i < current ? 'var(--accent-primary)' : 'var(--glass-border)' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function ReviewRow({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex justify-between text-sm py-1.5 border-b last:border-0" style={{ borderColor: 'var(--glass-border)' }}>
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span className="font-mono text-right ml-4" style={{ color: muted ? 'var(--text-muted)' : 'var(--text-primary)' }}>
        {value || '—'}
      </span>
    </div>
  )
}

export default function CreateShipment() {
  const qc = useQueryClient()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>(EMPTY)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [created, setCreated] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg')
  const [dir, setDir] = useState(1)

  const mut = useMutation({
    mutationFn: () => {
      const weightKg = weightUnit === 'lb' ? (form.weight_kg || 0) * 0.453592 : (form.weight_kg || 0)
      const payload: CreateParcelInput = {
        sender_name: form.sender_name.trim() || 'Unknown Sender',
        sender_address: form.sender_address.trim() || '',
        sender_country: form.sender_country || 'United States',
        receiver_name: form.receiver_name.trim() || 'Unknown Receiver',
        receiver_address: form.receiver_address.trim() || '',
        receiver_country: form.receiver_country || 'United Kingdom',
        weight_kg: weightKg,
        dimensions: form.dimensions?.trim() || '',
        service_type: form.service_type || 'STANDARD',
        declared_value: form.declared_value || 0,
      }
      return api.createParcel(payload)
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['parcels'] })
      setCreated(data.id)
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to create shipment'),
  })

  function set(key: keyof FormData, val: string | number) {
    setForm(f => ({ ...f, [key]: val }))
    // Clear field error on change
    if (errors[key]) setErrors(e => { const n = { ...e }; delete n[key]; return n })
  }

  function handleCopy() {
    if (!created) return
    copyToClipboard(created)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function next() {
    const err = validateStep(step, form)
    if (err) {
      const key = step === 0 ? 'sender_name' : 'receiver_name'
      setErrors({ [key]: err })
      return
    }
    setErrors({})
    setDir(1)
    setStep(s => s + 1)
  }

  function back() {
    setErrors({})
    setDir(-1)
    setStep(s => s - 1)
  }

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
  }

  const displayWeight = form.weight_kg
    ? `${form.weight_kg} ${weightUnit}${weightUnit === 'lb' ? ` (${(form.weight_kg * 0.453592).toFixed(2)} kg)` : ''}`
    : ''

  if (created) {
    return (
      <div className="max-w-lg mx-auto">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="glass p-10 text-center" style={{ borderRadius: '28px' }}>
          <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}>
            <CheckCircle size={56} className="mx-auto mb-4" style={{ color: '#00e676' }} />
          </motion.div>
          <h2 className="font-display text-3xl mb-2" style={{ color: 'var(--text-primary)' }}>SHIPMENT CREATED!</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Your parcel has been registered in the system.</p>
          <div className="glass-sm p-4 mb-6 flex items-center justify-center gap-3" style={{ borderRadius: '12px' }}>
            <span className="font-mono text-lg" style={{ color: 'var(--accent-primary)' }}>{created}</span>
            <motion.button whileTap={{ scale: 0.9 }} onClick={handleCopy}
              style={{ color: copied ? '#00e676' : 'var(--text-secondary)' }}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </motion.button>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setCreated(null); setForm(EMPTY); setStep(0); setErrors({}) }}
              className="btn-secondary flex-1 text-sm flex items-center justify-center gap-2">
              <Plus size={14} /> Create Another
            </button>
            <button onClick={() => window.open(`/track?id=${created}`, '_blank')}
              className="btn-primary flex-1 text-sm flex items-center justify-center gap-2">
              <Eye size={14} /> View Parcel
            </button>
          </div>
          <button onClick={() => copyToClipboard(`${window.location.origin}/track?id=${created}`)}
            className="mt-3 text-xs font-mono flex items-center gap-1 mx-auto transition-colors hover:text-white"
            style={{ color: 'var(--text-muted)' }}>
            <Share2 size={12} /> Share Tracking Link
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl" style={{ color: 'var(--text-primary)' }}>CREATE SHIPMENT</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Step {step + 1} of {STEP_LABELS.length} — {STEP_LABELS[step]}
        </p>
      </div>

      <div className="glass p-5 sm:p-8" style={{ borderRadius: '24px' }}>
        <StepIndicator current={step} total={STEP_LABELS.length} />

        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
          >
            {/* Step 0 — Sender */}
            {step === 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-xl" style={{ color: 'var(--text-primary)' }}>SENDER INFORMATION</h3>
                  <span className="text-xs font-mono px-2 py-1 rounded" style={{ background: 'rgba(0,229,255,0.08)', color: 'var(--text-muted)' }}>
                    * name required
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <GlassInput
                    label="Full Name *"
                    value={form.sender_name}
                    onChange={e => set('sender_name', e.target.value)}
                    error={errors.sender_name}
                  />
                  <GlassInput
                    label="Company"
                    value={form.sender_company ?? ''}
                    onChange={e => set('sender_company', e.target.value)}
                  />
                </div>
                <GlassInput
                  label="Address"
                  value={form.sender_address}
                  onChange={e => set('sender_address', e.target.value)}
                  placeholder="Street address, city, postcode"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1.5 font-body" style={{ color: 'var(--text-secondary)' }}>Country</label>
                    <select
                      value={form.sender_country}
                      onChange={e => set('sender_country', e.target.value)}
                      className="glass-input w-full px-4 py-3 text-sm"
                      style={{ appearance: 'none' }}>
                      {COUNTRIES.map(c => <option key={c} value={c} style={{ background: '#0a0f1e' }}>{c}</option>)}
                    </select>
                  </div>
                  <GlassInput
                    label="Phone"
                    placeholder="+1 (555) 000-0000"
                    value={form.sender_phone ?? ''}
                    onChange={e => set('sender_phone', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Step 1 — Receiver */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-xl" style={{ color: 'var(--text-primary)' }}>RECEIVER INFORMATION</h3>
                  <span className="text-xs font-mono px-2 py-1 rounded" style={{ background: 'rgba(0,229,255,0.08)', color: 'var(--text-muted)' }}>
                    * name required
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <GlassInput
                    label="Full Name *"
                    value={form.receiver_name}
                    onChange={e => set('receiver_name', e.target.value)}
                    error={errors.receiver_name}
                  />
                  <GlassInput
                    label="Company"
                    value={form.receiver_company ?? ''}
                    onChange={e => set('receiver_company', e.target.value)}
                  />
                </div>
                <GlassInput
                  label="Address"
                  value={form.receiver_address}
                  onChange={e => set('receiver_address', e.target.value)}
                  placeholder="Street address, city, postcode"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1.5 font-body" style={{ color: 'var(--text-secondary)' }}>Country</label>
                    <select
                      value={form.receiver_country}
                      onChange={e => set('receiver_country', e.target.value)}
                      className="glass-input w-full px-4 py-3 text-sm"
                      style={{ appearance: 'none' }}>
                      {COUNTRIES.map(c => <option key={c} value={c} style={{ background: '#0a0f1e' }}>{c}</option>)}
                    </select>
                  </div>
                  <GlassInput
                    label="Phone"
                    placeholder="+44 7000 000000"
                    value={form.receiver_phone ?? ''}
                    onChange={e => set('receiver_phone', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Step 2 — Package */}
            {step === 2 && (
              <div className="space-y-5">
                <h3 className="font-display text-xl mb-4" style={{ color: 'var(--text-primary)' }}>PACKAGE DETAILS</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1.5 font-body" style={{ color: 'var(--text-secondary)' }}>
                      Weight ({weightUnit}) — optional
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={0}
                        step={0.1}
                        placeholder="0.0"
                        value={form.weight_kg || ''}
                        onChange={e => set('weight_kg', e.target.value === '' ? 0 : +e.target.value)}
                        className="glass-input flex-1 px-4 py-3 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setWeightUnit(u => u === 'kg' ? 'lb' : 'kg')}
                        className="glass-sm px-4 py-3 text-xs font-mono transition-colors"
                        style={{ borderRadius: '10px', color: 'var(--accent-primary)', minWidth: 48 }}>
                        {weightUnit}
                      </button>
                    </div>
                  </div>
                  <GlassInput
                    label="Dimensions (LxWxH cm) — optional"
                    value={form.dimensions}
                    onChange={e => set('dimensions', e.target.value)}
                    placeholder="e.g. 30x20x15"
                  />
                </div>
                <GlassInput
                  label="Contents Description — optional"
                  value={form.contents ?? ''}
                  onChange={e => set('contents', e.target.value)}
                  placeholder="e.g. General merchandise, electronics, clothing…"
                />
                <GlassInput
                  label="Declared Value (USD) — optional"
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="0.00"
                  value={form.declared_value || ''}
                  onChange={e => set('declared_value', e.target.value === '' ? 0 : +e.target.value)}
                />
                <div>
                  <label className="block text-sm mb-3 font-body" style={{ color: 'var(--text-secondary)' }}>Service Type</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {SERVICE_TYPES.map(s => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => set('service_type', s.value)}
                        className="glass p-4 text-left transition-all"
                        style={{
                          borderRadius: '14px',
                          borderColor: form.service_type === s.value ? 'var(--accent-primary)' : undefined,
                          background: form.service_type === s.value ? 'rgba(0,229,255,0.06)' : undefined,
                          boxShadow: form.service_type === s.value ? '0 0 16px rgba(0,229,255,0.1)' : undefined,
                        }}>
                        <p className="text-xs font-mono font-bold mb-1" style={{ color: form.service_type === s.value ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                          {s.label}
                        </p>
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{s.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 — Review */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="font-display text-xl mb-4" style={{ color: 'var(--text-primary)' }}>REVIEW & SUBMIT</h3>

                {/* Sender */}
                <div className="glass-sm p-4" style={{ borderRadius: '14px' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold" style={{ color: 'var(--accent-primary)' }}>SENDER</span>
                    <button onClick={() => { setDir(-1); setStep(0) }} className="text-xs" style={{ color: 'var(--text-muted)' }}>Edit</button>
                  </div>
                  <ReviewRow label="Name" value={form.sender_name} />
                  {form.sender_company && <ReviewRow label="Company" value={form.sender_company} />}
                  <ReviewRow label="Address" value={form.sender_address} muted={!form.sender_address} />
                  <ReviewRow label="Country" value={form.sender_country} />
                  {form.sender_phone && <ReviewRow label="Phone" value={form.sender_phone} />}
                </div>

                {/* Receiver */}
                <div className="glass-sm p-4" style={{ borderRadius: '14px' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold" style={{ color: 'var(--accent-primary)' }}>RECEIVER</span>
                    <button onClick={() => { setDir(-1); setStep(1) }} className="text-xs" style={{ color: 'var(--text-muted)' }}>Edit</button>
                  </div>
                  <ReviewRow label="Name" value={form.receiver_name} />
                  {form.receiver_company && <ReviewRow label="Company" value={form.receiver_company} />}
                  <ReviewRow label="Address" value={form.receiver_address} muted={!form.receiver_address} />
                  <ReviewRow label="Country" value={form.receiver_country} />
                  {form.receiver_phone && <ReviewRow label="Phone" value={form.receiver_phone} />}
                </div>

                {/* Package */}
                <div className="glass-sm p-4" style={{ borderRadius: '14px' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold" style={{ color: 'var(--accent-primary)' }}>PACKAGE</span>
                    <button onClick={() => { setDir(-1); setStep(2) }} className="text-xs" style={{ color: 'var(--text-muted)' }}>Edit</button>
                  </div>
                  <ReviewRow label="Service" value={SERVICE_TYPES.find(s => s.value === form.service_type)?.label ?? form.service_type} />
                  <ReviewRow label="Weight" value={displayWeight} muted={!form.weight_kg} />
                  {form.dimensions && <ReviewRow label="Dimensions" value={`${form.dimensions} cm`} />}
                  {form.contents && <ReviewRow label="Contents" value={form.contents} />}
                  <ReviewRow
                    label="Declared Value"
                    value={form.declared_value ? `$${form.declared_value.toLocaleString()}` : ''}
                    muted={!form.declared_value}
                  />
                </div>

                {/* Warning if optional address fields are empty */}
                {(!form.sender_address || !form.receiver_address) && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2 px-4 py-3 rounded-xl text-xs"
                    style={{ background: 'rgba(255,171,0,0.08)', border: '1px solid rgba(255,171,0,0.2)', color: '#ffab00' }}>
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <span>
                      {!form.sender_address && !form.receiver_address
                        ? 'Sender and receiver addresses are missing — the shipment will still be created.'
                        : !form.sender_address
                        ? 'Sender address is missing — the shipment will still be created.'
                        : 'Receiver address is missing — the shipment will still be created.'}
                    </span>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button type="button" onClick={back} className="btn-secondary flex-1 text-sm">← Back</button>
          )}
          {step < 3 ? (
            <button type="button" onClick={next} className="btn-primary flex-1 text-sm font-semibold">
              Continue →
            </button>
          ) : (
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => mut.mutate()}
              disabled={mut.isPending}
              className="btn-primary flex-1 text-sm font-semibold flex items-center justify-center gap-2">
              {mut.isPending ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
              {mut.isPending ? 'Creating…' : 'Create Shipment'}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  )
}
