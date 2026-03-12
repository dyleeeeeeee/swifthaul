import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Bell, User, LogOut, Settings, ChevronDown, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const PAGE_TITLES: Record<string, string> = {
  '/admin':           'Dashboard',
  '/admin/parcels':   'Parcels',
  '/admin/create':    'Create Shipment',
  '/admin/tracking':  'Update Tracking',
  '/admin/analytics': 'Analytics',
  '/admin/settings':  'Settings',
}

const MOCK_NOTIFICATIONS = [
  { id: 1, text: 'SH-2024-DEMO01 arrived at Heathrow Hub', time: '2m ago', unread: true },
  { id: 2, text: 'Exception on SH-2024-A7B3C9 — customs hold', time: '18m ago', unread: true },
  { id: 3, text: 'SH-2024-DEMO02 delivered successfully', time: '1h ago', unread: false },
]

export default function AdminTopBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const title = PAGE_TITLES[location.pathname] ?? 'Admin'

  const [search, setSearch] = useState('')
  const [showNotifs, setShowNotifs] = useState(false)
  const [showUser, setShowUser] = useState(false)
  const [bellRing, setBellRing] = useState(false)
  const notifsRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)
  const unreadCount = MOCK_NOTIFICATIONS.filter(n => n.unread).length

  useEffect(() => {
    setBellRing(true)
    const t = setTimeout(() => setBellRing(false), 800)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (notifsRef.current && !notifsRef.current.contains(e.target as Node)) setShowNotifs(false)
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUser(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (search.trim()) navigate(`/admin/parcels?search=${encodeURIComponent(search.trim())}`)
  }

  return (
    <header
      className="sticky top-0 z-nav flex flex-wrap items-center gap-3 px-4 py-3 sm:px-5 md:flex-nowrap md:gap-4 md:px-6 md:py-4"
      style={{
        background: 'rgba(5,8,16,0.8)',
        backdropFilter: 'blur(24px) saturate(180%)',
        borderBottom: '1px solid var(--glass-border)',
        willChange: 'transform',
      }}
    >
      {/* Page Title */}
      <AnimatePresence mode="wait">
        <motion.h2
          key={title}
          initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.2 }}
          className="mr-auto max-w-full font-display text-xl tracking-wider sm:text-2xl"
          style={{ color: 'var(--text-primary)' }}
        >
          {title.toUpperCase()}
        </motion.h2>
      </AnimatePresence>

      {/* Global Search */}
      <form onSubmit={handleSearch} className="relative order-3 w-full md:order-none md:block md:w-auto">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search parcels…"
          className="glass-input w-full pl-9 pr-8 py-2 text-sm md:w-60"
          style={{ borderRadius: '10px' }}
        />
        {search && (
          <button type="button" onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
            <X size={12} />
          </button>
        )}
      </form>

      {/* Notification Bell */}
      <div ref={notifsRef} className="relative">
        <motion.button
          animate={bellRing ? { rotate: [-15, 15, -10, 10, -5, 5, 0] } : {}}
          transition={{ duration: 0.6 }}
          onClick={() => setShowNotifs(v => !v)}
          className="relative w-9 h-9 flex items-center justify-center glass-sm transition-colors hover:bg-white/5"
          style={{ borderRadius: '10px', color: 'var(--text-secondary)' }}
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center text-xs font-bold rounded-full"
              style={{ background: '#ff1744', color: '#fff', fontSize: '9px' }}
            >
              {unreadCount}
            </span>
          )}
        </motion.button>

        <AnimatePresence>
          {showNotifs && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -8 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="absolute right-0 top-full mt-2 glass shadow-2xl overflow-hidden max-w-[calc(100vw-2rem)]"
              style={{ width: '300px', borderRadius: '16px', transformOrigin: 'top right' }}
            >
              <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--glass-border)' }}>
                <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>NOTIFICATIONS</p>
              </div>
              {MOCK_NOTIFICATIONS.map(n => (
                <div
                  key={n.id}
                  className="px-4 py-3 border-b hover:bg-white/5 transition-colors cursor-pointer"
                  style={{ borderColor: 'var(--glass-border)', background: n.unread ? 'rgba(0,229,255,0.03)' : 'transparent' }}
                >
                  <div className="flex items-start gap-2">
                    {n.unread && <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: 'var(--accent-primary)' }} />}
                    <div className={n.unread ? '' : 'ml-3.5'}>
                      <p className="text-xs leading-relaxed" style={{ color: n.unread ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{n.text}</p>
                      <p className="text-xs mt-0.5 font-mono" style={{ color: 'var(--text-muted)' }}>{n.time}</p>
                    </div>
                  </div>
                </div>
              ))}
              <div className="px-4 py-2.5">
                <button className="text-xs w-full text-center" style={{ color: 'var(--accent-primary)' }}>View all notifications</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User Menu */}
      <div ref={userRef} className="relative">
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
          onClick={() => setShowUser(v => !v)}
          className="flex items-center gap-2 px-2.5 py-2 glass-sm transition-colors hover:bg-white/5 sm:px-3"
          style={{ borderRadius: '10px', color: 'var(--text-secondary)' }}
        >
          <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'var(--accent-secondary)' }}>
            <User size={11} style={{ color: '#fff' }} />
          </div>
          <span className="text-sm font-body hidden md:block" style={{ color: 'var(--text-primary)' }}>Admin</span>
          <motion.div animate={{ rotate: showUser ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={13} />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {showUser && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -8 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="absolute right-0 top-full mt-2 glass shadow-2xl overflow-hidden max-w-[calc(100vw-2rem)]"
              style={{ width: '180px', borderRadius: '14px', transformOrigin: 'top right' }}
            >
              <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--glass-border)' }}>
                <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>admin@swifthaul.dev</p>
                <p className="text-xs mt-0.5 font-mono" style={{ color: 'var(--text-muted)' }}>Administrator</p>
              </div>
              <button
                onClick={() => { navigate('/admin/settings'); setShowUser(false) }}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm hover:bg-white/5 transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                <Settings size={14} /> Settings
              </button>
              <button
                onClick={() => { logout(); navigate('/admin/login') }}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm hover:bg-red-500/10 transition-colors border-t"
                style={{ color: '#ff5252', borderColor: 'var(--glass-border)' }}
              >
                <LogOut size={14} /> Logout
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
