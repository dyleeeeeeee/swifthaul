import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Menu, X } from 'lucide-react'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      className="fixed top-0 left-0 right-0 z-nav"
    >
      <div
        className="mx-4 mt-4 glass rounded-2xl px-6 py-4"
        style={{ backdropFilter: 'blur(30px) saturate(200%)' }}
      >
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--accent-primary)' }}>
              <Zap size={16} fill="currentColor" style={{ color: '#050810' }} />
            </div>
            <span className="font-display text-xl tracking-wider"
              style={{ color: 'var(--text-primary)' }}>
              SWIFT<span style={{ color: 'var(--accent-primary)' }}>HAUL</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {[['Track', '/track'], ['Services', '#services'], ['About', '#about']].map(([label, href]) => (
              <Link
                key={label}
                to={href}
                className="text-sm font-body transition-colors duration-200 hover:text-cyan-400"
                style={{ color: 'var(--text-secondary)' }}
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate('/track')}
              className="btn-secondary text-sm px-4 py-2"
              style={{ borderRadius: '10px', padding: '8px 16px' }}
            >
              Track Shipment
            </button>
            <button
              onClick={() => navigate('/admin')}
              className="btn-primary text-sm"
              style={{ padding: '8px 16px', borderRadius: '10px' }}
            >
              Admin Portal
            </button>
          </div>

          <button
            className="md:hidden p-2 glass-sm"
            onClick={() => setOpen(!open)}
            style={{ borderRadius: '10px' }}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="overflow-hidden md:hidden"
            >
              <div className="pt-4 pb-2 flex flex-col gap-3 border-t mt-4"
                style={{ borderColor: 'var(--glass-border)' }}>
                {[['Track Shipment', '/track'], ['Admin Portal', '/admin']].map(([label, href]) => (
                  <Link
                    key={label}
                    to={href}
                    onClick={() => setOpen(false)}
                    className="px-4 py-3 glass-sm text-sm font-body text-center"
                    style={{ borderRadius: '10px', color: 'var(--text-primary)' }}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}
