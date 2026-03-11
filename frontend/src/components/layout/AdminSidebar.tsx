import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap, LayoutDashboard, Package, PlusCircle, BarChart3,
  Settings, ChevronLeft, ChevronRight, LogOut, User, MapPin
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const NAV_ITEMS = [
  { label: 'Dashboard',       icon: LayoutDashboard, href: '/admin' },
  { label: 'Parcels',         icon: Package,          href: '/admin/parcels' },
  { label: 'Create Shipment', icon: PlusCircle,       href: '/admin/create' },
  { label: 'Update Tracking', icon: MapPin,            href: '/admin/tracking' },
  { label: 'Analytics',       icon: BarChart3,        href: '/admin/analytics' },
  { label: 'Settings',        icon: Settings,         href: '/admin/settings' },
]

interface AdminSidebarProps {
  onCollapse?: (collapsed: boolean) => void
}

export default function AdminSidebar({ onCollapse }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()

  function handleLogout() {
    logout()
    navigate('/admin/login')
  }

  return (
    <>
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
      className="fixed left-0 top-0 bottom-0 z-nav hidden md:flex flex-col"
      style={{
        background: 'rgba(5,8,16,0.85)',
        backdropFilter: 'blur(30px) saturate(200%)',
        borderRight: '1px solid var(--glass-border)',
        overflow: 'hidden',
        willChange: 'width',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-6 shrink-0">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'var(--accent-primary)' }}>
          <Zap size={16} fill="currentColor" style={{ color: '#050810' }} />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="font-display text-lg tracking-wider whitespace-nowrap overflow-hidden"
            >
              SWIFT<span style={{ color: 'var(--accent-primary)' }}>HAUL</span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-2 space-y-1">
        {NAV_ITEMS.map(({ label, icon: Icon, href }) => {
          const active = location.pathname === href
          return (
            <Link
              key={href}
              to={href}
              title={collapsed ? label : undefined}
              className="relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group overflow-hidden"
              style={{
                background: active ? 'rgba(0,229,255,0.08)' : 'transparent',
                borderLeft: active ? '2px solid var(--accent-primary)' : '2px solid transparent',
                color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
              }}
            >
              <Icon size={18} className="shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm font-body whitespace-nowrap overflow-hidden"
                    style={{ color: active ? 'var(--text-primary)' : undefined }}
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 glass-sm text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50"
                  style={{ borderRadius: '8px', color: 'var(--text-primary)' }}>
                  {label}
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom: user + collapse */}
      <div className="p-2 space-y-2 shrink-0">
        <button
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          className="flex items-center gap-3 px-3 py-3 rounded-xl w-full transition-colors hover:bg-red-500/10"
          style={{ color: 'var(--text-secondary)' }}
        >
          <LogOut size={18} className="shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-sm font-body whitespace-nowrap">Logout</motion.span>
            )}
          </AnimatePresence>
        </button>

        <div className="flex items-center gap-3 px-3 py-3 glass-sm" style={{ borderRadius: '12px' }}>
          <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center"
            style={{ background: 'var(--accent-secondary)' }}>
            <User size={12} style={{ color: '#fff' }} />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="overflow-hidden">
                <p className="text-xs font-body whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>Admin</p>
                <p className="text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>admin@swifthaul.dev</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={() => { setCollapsed(c => { const next = !c; onCollapse?.(next); return next }) }}
          className="flex items-center justify-center w-full py-2 glass-sm rounded-xl transition-colors hover:bg-white/5"
          style={{ color: 'var(--text-secondary)' }}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </motion.aside>

    {/* Mobile bottom nav */}
    <nav
      className="fixed bottom-0 left-0 right-0 md:hidden z-nav flex items-center justify-around px-2 py-2"
      style={{
        background: 'rgba(5,8,16,0.92)',
        backdropFilter: 'blur(24px)',
        borderTop: '1px solid var(--glass-border)',
      }}
    >
      {NAV_ITEMS.slice(0, 5).map(({ label, icon: Icon, href }) => {
        const active = location.pathname === href
        return (
          <Link
            key={href}
            to={href}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors min-w-[44px]"
            style={{ color: active ? 'var(--accent-primary)' : 'var(--text-muted)' }}
          >
            <Icon size={18} />
            <span className="text-xs font-body" style={{ fontSize: '9px' }}>{label.split(' ')[0]}</span>
          </Link>
        )
      })}
    </nav>
    </>
  )
}
