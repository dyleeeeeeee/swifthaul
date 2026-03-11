import { useState } from 'react'
import { motion } from 'framer-motion'
import { Save, Eye, EyeOff, Shield, Bell, Globe, Palette, Loader2, CheckCircle } from 'lucide-react'
import GlassInput from '../../components/ui/GlassInput'
import toast from 'react-hot-toast'

type Tab = 'profile' | 'security' | 'notifications' | 'api'

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'profile',       label: 'Profile',       icon: Globe },
  { id: 'security',      label: 'Security',      icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'api',           label: 'API & Config',  icon: Palette },
]

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      className="glass p-6 space-y-5"
      style={{ borderRadius: '20px' }}
    >
      <h3 className="text-sm font-semibold pb-3 border-b" style={{ color: 'var(--text-primary)', borderColor: 'var(--glass-border)' }}>
        {title}
      </h3>
      {children}
    </motion.div>
  )
}

function Toggle({ label, description, value, onChange }: {
  label: string; description?: string; value: boolean; onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{label}</p>
        {description && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{description}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className="relative w-10 h-5.5 rounded-full shrink-0 transition-colors duration-200"
        style={{
          background: value ? 'var(--accent-primary)' : 'var(--glass-border)',
          width: '40px', height: '22px',
        }}
      >
        <motion.div
          animate={{ x: value ? 18 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-0.5 w-4 h-4 rounded-full"
          style={{ background: value ? '#050810' : 'rgba(240,244,255,0.4)' }}
        />
      </button>
    </div>
  )
}

export default function Settings() {
  const [tab, setTab] = useState<Tab>('profile')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [profile, setProfile] = useState({ name: 'SwiftHaul Admin', email: 'admin@swifthaul.dev', company: 'SwiftHaul Logistics', timezone: 'UTC+00:00' })
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [pwForm, setPwForm] = useState({ old: '', new: '', confirm: '' })
  const [notifs, setNotifs] = useState({ email: true, browser: true, delivery: true, exceptions: true, weekly: false })
  const [apiConfig, setApiConfig] = useState({ baseUrl: 'https://api.swifthaul.workers.dev', cacheMinutes: '5' })

  async function handleSave() {
    setSaving(true)
    await new Promise(r => setTimeout(r, 900))
    setSaving(false)
    setSaved(true)
    toast.success('Settings saved')
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl" style={{ color: 'var(--text-primary)' }}>SETTINGS</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Configure your admin preferences and system settings.</p>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-2 glass p-1.5" style={{ borderRadius: '14px', width: 'fit-content' }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-body transition-all"
            style={{
              borderRadius: '10px',
              background: tab === id ? 'rgba(0,229,255,0.1)' : 'transparent',
              color: tab === id ? 'var(--accent-primary)' : 'var(--text-secondary)',
              border: tab === id ? '1px solid rgba(0,229,255,0.25)' : '1px solid transparent',
            }}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'profile' && (
        <SectionCard title="Profile Information">
          <div className="grid grid-cols-2 gap-4">
            <GlassInput label="Full Name" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
            <GlassInput label="Email Address" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} type="email" />
            <GlassInput label="Company" value={profile.company} onChange={e => setProfile(p => ({ ...p, company: e.target.value }))} />
            <div>
              <label className="block text-sm mb-1.5 font-body" style={{ color: 'var(--text-secondary)' }}>Timezone</label>
              <select
                value={profile.timezone}
                onChange={e => setProfile(p => ({ ...p, timezone: e.target.value }))}
                className="glass-input w-full px-4 py-3 text-sm"
                style={{ borderRadius: '12px', color: 'var(--text-primary)', background: 'var(--glass-bg)' }}
              >
                {['UTC-12:00','UTC-08:00','UTC-05:00','UTC+00:00','UTC+01:00','UTC+05:30','UTC+08:00','UTC+09:00'].map(t => (
                  <option key={t} value={t} style={{ background: '#0a0f1e' }}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        </SectionCard>
      )}

      {tab === 'security' && (
        <SectionCard title="Change Password">
          <div className="space-y-4 max-w-sm">
            <div className="relative">
              <GlassInput
                label="Current Password"
                type={showOld ? 'text' : 'password'}
                value={pwForm.old}
                onChange={e => setPwForm(p => ({ ...p, old: e.target.value }))}
              />
              <button type="button" onClick={() => setShowOld(v => !v)}
                className="absolute right-3 bottom-3" style={{ color: 'var(--text-muted)' }}>
                {showOld ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <div className="relative">
              <GlassInput
                label="New Password"
                type={showNew ? 'text' : 'password'}
                value={pwForm.new}
                onChange={e => setPwForm(p => ({ ...p, new: e.target.value }))}
              />
              <button type="button" onClick={() => setShowNew(v => !v)}
                className="absolute right-3 bottom-3" style={{ color: 'var(--text-muted)' }}>
                {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <GlassInput
              label="Confirm New Password"
              type="password"
              value={pwForm.confirm}
              onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}
              error={pwForm.confirm && pwForm.confirm !== pwForm.new ? 'Passwords do not match' : undefined}
            />
          </div>
          <div className="pt-2">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Password must be at least 8 characters and include a number and a special character.
            </p>
          </div>
        </SectionCard>
      )}

      {tab === 'notifications' && (
        <SectionCard title="Notification Preferences">
          <div className="space-y-5">
            <Toggle label="Email Notifications" description="Receive activity summaries via email" value={notifs.email} onChange={v => setNotifs(n => ({ ...n, email: v }))} />
            <Toggle label="Browser Notifications" description="Push alerts in your browser" value={notifs.browser} onChange={v => setNotifs(n => ({ ...n, browser: v }))} />
            <div className="border-t pt-4" style={{ borderColor: 'var(--glass-border)' }}>
              <p className="text-xs mb-4 font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Alert Types</p>
              <div className="space-y-4">
                <Toggle label="Delivery Confirmations" value={notifs.delivery} onChange={v => setNotifs(n => ({ ...n, delivery: v }))} />
                <Toggle label="Exception Alerts" description="Customs holds, delivery failures" value={notifs.exceptions} onChange={v => setNotifs(n => ({ ...n, exceptions: v }))} />
                <Toggle label="Weekly Reports" description="Summary every Monday morning" value={notifs.weekly} onChange={v => setNotifs(n => ({ ...n, weekly: v }))} />
              </div>
            </div>
          </div>
        </SectionCard>
      )}

      {tab === 'api' && (
        <SectionCard title="API Configuration">
          <div className="space-y-4">
            <GlassInput label="API Base URL" value={apiConfig.baseUrl} onChange={e => setApiConfig(a => ({ ...a, baseUrl: e.target.value }))} />
            <GlassInput label="Cache TTL (minutes)" value={apiConfig.cacheMinutes} type="number" onChange={e => setApiConfig(a => ({ ...a, cacheMinutes: e.target.value }))} />
          </div>
          <div className="glass-sm px-4 py-3 mt-2" style={{ borderRadius: '12px', borderColor: 'rgba(0,229,255,0.2)' }}>
            <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
              Worker endpoint: <span style={{ color: 'var(--accent-primary)' }}>{apiConfig.baseUrl}/api</span>
            </p>
          </div>
        </SectionCard>
      )}

      {/* Save Button */}
      <motion.button
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
        onClick={handleSave}
        disabled={saving}
        className="btn-primary flex items-center gap-2 text-sm disabled:opacity-60"
      >
        {saving ? (
          <><Loader2 size={14} className="animate-spin" /> Saving…</>
        ) : saved ? (
          <><CheckCircle size={14} /> Saved!</>
        ) : (
          <><Save size={14} /> Save Changes</>
        )}
      </motion.button>
    </div>
  )
}
