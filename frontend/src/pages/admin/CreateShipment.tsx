import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, Copy, Plus, Eye, Share2, Loader2, CheckCircle } from 'lucide-react'
import { api, CreateParcelInput } from '../../lib/api'
import GlassInput from '../../components/ui/GlassInput'
import { copyToClipboard } from '../../lib/utils'
import toast from 'react-hot-toast'

const COUNTRIES = ['United States', 'United Kingdom', 'Germany', 'France', 'Japan', 'Australia', 'Canada', 'Brazil', 'UAE', 'Singapore', 'Nigeria', 'India', 'China', 'South Korea', 'Mexico']
const SERVICE_TYPES = [
  { value: 'EXPRESS', label: 'Express Overnight', desc: 'Next-day delivery, guaranteed by 10:30 AM' },
  { value: 'STANDARD', label: 'Standard Freight', desc: 'Cost-effective, 3–5 business days' },
  { value: 'FREIGHT', label: 'Air Freight', desc: 'International air, 2–4 business days' },
]

const STEP_LABELS = ['Sender Info', 'Receiver Info', 'Package Details', 'Review & Submit']

type FormData = CreateParcelInput & { sender_company?: string; receiver_company?: string }

const EMPTY: FormData = {
  sender_name: '', sender_address: '', sender_country: 'United States',
  receiver_name: '', receiver_address: '', receiver_country: 'United Kingdom',
  weight_kg: 0, dimensions: '', service_type: 'STANDARD', declared_value: 0,
  sender_company: '', receiver_company: '',
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

export default function CreateShipment() {
  const qc = useQueryClient()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>(EMPTY)
  const [created, setCreated] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg')

  const mut = useMutation({
    mutationFn: () => api.createParcel({
      ...form,
      weight_kg: weightUnit === 'lb' ? form.weight_kg * 0.453592 : form.weight_kg,
    }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['parcels'] })
      setCreated(data.id)
    },
    onError: () => toast.error('Failed to create shipment'),
  })

  function set(key: keyof FormData, val: string | number) {
    setForm(f => ({ ...f, [key]: val }))
  }

  function handleCopy() {
    if (!created) return
    copyToClipboard(created)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  }
  const [dir, setDir] = useState(1)
  function next() { setDir(1); setStep(s => s + 1) }
  function back() { setDir(-1); setStep(s => s - 1) }

  if (created) {
    return (
      <div className="max-w-lg mx-auto">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="glass p-10 text-center" style={{ borderRadius: '28px' }}>
          <motion.div
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
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
            <button onClick={() => { setCreated(null); setForm(EMPTY); setStep(0) }}
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
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Step {step + 1} of {STEP_LABELS.length} — {STEP_LABELS[step]}</p>
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
                <h3 className="font-display text-xl mb-4" style={{ color: 'var(--text-primary)' }}>SENDER INFORMATION</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <GlassInput label="Full Name" value={form.sender_name} onChange={e => set('sender_name', e.target.value)} required />
                  <GlassInput label="Company" value={form.sender_company ?? ''} onChange={e => set('sender_company', e.target.value)} />
                </div>
                <GlassInput label="Address" value={form.sender_address} onChange={e => set('sender_address', e.target.value)} required />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1.5 font-body" style={{ color: 'var(--text-secondary)' }}>Country</label>
                    <select value={form.sender_country} onChange={e => set('sender_country', e.target.value)}
                      className="glass-input w-full px-4 py-3 text-sm" style={{ appearance: 'none' }}>
                      {COUNTRIES.map(c => <option key={c} value={c} style={{ background: '#0a0f1e' }}>{c}</option>)}
                    </select>
                  </div>
                  <GlassInput label="Phone" placeholder="+1 (555) 000-0000" onChange={e => set('sender_address', form.sender_address + e.target.value)} />
                </div>
              </div>
            )}

            {/* Step 1 — Receiver */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="font-display text-xl mb-4" style={{ color: 'var(--text-primary)' }}>RECEIVER INFORMATION</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <GlassInput label="Full Name" value={form.receiver_name} onChange={e => set('receiver_name', e.target.value)} required />
                  <GlassInput label="Company" value={form.receiver_company ?? ''} onChange={e => set('receiver_company', e.target.value)} />
                </div>
                <GlassInput label="Address" value={form.receiver_address} onChange={e => set('receiver_address', e.target.value)} required />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1.5 font-body" style={{ color: 'var(--text-secondary)' }}>Country</label>
                    <select value={form.receiver_country} onChange={e => set('receiver_country', e.target.value)}
                      className="glass-input w-full px-4 py-3 text-sm" style={{ appearance: 'none' }}>
                      {COUNTRIES.map(c => <option key={c} value={c} style={{ background: '#0a0f1e' }}>{c}</option>)}
                    </select>
                  </div>
                  <GlassInput label="Phone" placeholder="+44 7000 000000" />
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
                      Weight ({weightUnit})
                    </label>
                    <div className="flex gap-2">
                      <input type="number" min={0} step={0.1} value={form.weight_kg || ''}
                        onChange={e => set('weight_kg', +e.target.value)}
                        className="glass-input flex-1 px-4 py-3 text-sm" />
                      <button
                        onClick={() => setWeightUnit(u => u === 'kg' ? 'lb' : 'kg')}
                        className="glass-sm px-3 py-3 text-xs font-mono transition-colors"
                        style={{ borderRadius: '10px', color: 'var(--accent-primary)' }}>
                        {weightUnit === 'kg' ? 'kg' : 'lb'}
                      </button>
                    </div>
                  </div>
                  <GlassInput label="Dimensions (LxWxH cm)" value={form.dimensions}
                    onChange={e => set('dimensions', e.target.value)} placeholder="30x20x15" />
                </div>
                <GlassInput label="Contents Description" value={''} onChange={() => {}} placeholder="General merchandise, electronics…" />
                <GlassInput label="Declared Value ($)" value={form.declared_value || ''}
                  onChange={e => set('declared_value', +e.target.value)} />
                <div>
                  <label className="block text-sm mb-3 font-body" style={{ color: 'var(--text-secondary)' }}>Service Type</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {SERVICE_TYPES.map(s => (
                      <button key={s.value} onClick={() => set('service_type', s.value)}
                        className="glass p-4 text-left transition-all"
                        style={{
                          borderRadius: '14px',
                          borderColor: form.service_type === s.value ? 'var(--accent-primary)' : undefined,
                          background: form.service_type === s.value ? 'rgba(0,229,255,0.06)' : undefined,
                          boxShadow: form.service_type === s.value ? '0 0 16px rgba(0,229,255,0.1)' : undefined,
                        }}>
                        <p className="text-xs font-mono font-bold mb-1" style={{ color: form.service_type === s.value ? 'var(--accent-primary)' : 'var(--text-primary)' }}>{s.label}</p>
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
                {[
                  {
                    title: 'Sender', editStep: 0,
                    rows: [['Name', form.sender_name], ['Address', form.sender_address], ['Country', form.sender_country]],
                  },
                  {
                    title: 'Receiver', editStep: 1,
                    rows: [['Name', form.receiver_name], ['Address', form.receiver_address], ['Country', form.receiver_country]],
                  },
                  {
                    title: 'Package', editStep: 2,
                    rows: [['Weight', `${form.weight_kg} ${weightUnit}`], ['Service', form.service_type], ['Value', `$${form.declared_value}`]],
                  },
                ].map(({ title, editStep, rows }) => (
                  <div key={title} className="glass-sm p-4" style={{ borderRadius: '14px' }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono font-bold" style={{ color: 'var(--accent-primary)' }}>{title}</span>
                      <button onClick={() => { setDir(-1); setStep(editStep) }}
                        className="text-xs" style={{ color: 'var(--text-muted)' }}>Edit</button>
                    </div>
                    {rows.map(([l, v]) => (
                      <div key={l} className="flex justify-between text-sm py-1.5 border-b" style={{ borderColor: 'var(--glass-border)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{l}</span>
                        <span className="font-mono" style={{ color: 'var(--text-primary)' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button onClick={back} className="btn-secondary flex-1 text-sm">← Back</button>
          )}
          {step < 3 ? (
            <button onClick={next} className="btn-primary flex-1 text-sm font-semibold">
              Continue →
            </button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
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
