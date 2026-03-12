import { Link } from 'react-router-dom'
import { Zap, Twitter, Linkedin, Github, Mail, Phone, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Footer() {
  const socials = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Github, href: '#', label: 'GitHub' },
  ]

  return (
    <footer className="relative z-content mt-32">
      <div className="glass mx-4 mb-4 rounded-2xl p-6 sm:p-10"
        style={{ borderRadius: '24px' }}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--accent-primary)' }}>
                <Zap size={16} fill="currentColor" style={{ color: '#050810' }} />
              </div>
              <span className="font-display text-xl tracking-wider">
                SWIFT<span style={{ color: 'var(--accent-primary)' }}>HAUL</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Precision logistics across 180+ countries. Real-time tracking, zero surprises.
            </p>
          </div>

          <div>
            <h4 className="font-body font-500 mb-4 text-sm tracking-widest uppercase"
              style={{ color: 'var(--accent-primary)' }}>Navigation</h4>
            <ul className="space-y-2">
              {[['Home', '/'], ['Track Shipment', '/track'], ['Admin Portal', '/admin']].map(([l, h]) => (
                <li key={l}>
                  <Link to={h}
                    className="text-sm transition-colors hover:text-white"
                    style={{ color: 'var(--text-secondary)' }}>{l}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-body font-500 mb-4 text-sm tracking-widest uppercase"
              style={{ color: 'var(--accent-primary)' }}>Services</h4>
            <ul className="space-y-2">
              {['Express Overnight', 'Standard Freight', 'International Air', 'Ocean Cargo', 'Cold Chain', 'Hazmat Certified'].map(s => (
                <li key={s}>
                  <a href="#services" className="text-sm transition-colors hover:text-white"
                    style={{ color: 'var(--text-secondary)' }}>{s}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-body font-500 mb-4 text-sm tracking-widest uppercase"
              style={{ color: 'var(--accent-primary)' }}>Contact</h4>
            <ul className="space-y-3">
              {[
                [Mail, 'support@swifthaul.dev'],
                [Phone, '+1 (800) SWIFT-01'],
                [MapPin, '1 Logistics Way, Global HQ'],
              ].map(([Icon, text]) => (
                <li key={text as string} className="flex items-center gap-2">
                  {/* @ts-ignore */}
                  <Icon size={14} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{text as string}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1px solid var(--glass-border)' }}>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} SwiftHaul. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {socials.map(({ icon: Icon, href, label }) => (
              <motion.a
                key={label}
                href={href}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                aria-label={label}
                className="w-8 h-8 glass-sm flex items-center justify-center transition-colors"
                style={{ borderRadius: '8px', color: 'var(--text-secondary)' }}
              >
                <Icon size={14} />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
