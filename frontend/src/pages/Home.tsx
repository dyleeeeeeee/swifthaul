import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import {
  Zap, Search, Globe, ArrowRight,
  Truck, Plane, Ship, Thermometer, AlertTriangle, Star,
  BookOpen, MapPin, CheckCircle,
  Volume2, VolumeX
} from 'lucide-react'
import { useCountUp } from '../hooks/useCountUp'
import Footer from '../components/layout/Footer'

const FADE_UP = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.23, 1, 0.32, 1] },
  }),
}

function StatCard({ value, suffix, label, delay }: { value: number; suffix: string; label: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  const count = useCountUp(value, 1500, inView)
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -4 }}
      className="glass glass-shimmer p-6 text-center cursor-default"
      style={{ willChange: 'transform' }}
    >
      <div className="font-display text-4xl" style={{ color: 'var(--accent-primary)' }}>
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm mt-1 font-body" style={{ color: 'var(--text-secondary)' }}>{label}</div>
    </motion.div>
  )
}

const HOW_STEPS = [
  { num: '01', icon: BookOpen,     title: 'Book Online',   desc: 'Create your shipment in minutes. Fill in package details, choose your service, and get an instant quote.' },
  { num: '02', icon: Truck,        title: 'We Pick Up',    desc: 'Our team arrives at your doorstep at the scheduled time. No waiting, no hassle.' },
  { num: '03', icon: MapPin,       title: 'Track Live',    desc: 'Follow your parcel in real-time across the globe. Every scan, every hub, every mile — visible.' },
  { num: '04', icon: CheckCircle,  title: 'Delivered',     desc: 'Proof of delivery with a timestamp and signature. Job done, every time.' },
]

const SERVICES = [
  { icon: Zap,          tag: 'FASTEST',    title: 'Express Overnight',   desc: 'Next-day delivery within country borders. Guaranteed by 10:30 AM.' },
  { icon: Truck,        tag: 'POPULAR',    title: 'Standard Freight',    desc: 'Cost-effective ground shipping for non-urgent parcels. 3–5 business days.' },
  { icon: Plane,        tag: 'GLOBAL',     title: 'International Air',   desc: 'Rapid air freight to 180+ countries. Door-to-door in 2–4 business days.' },
  { icon: Ship,         tag: 'BULK',       title: 'Ocean Cargo',         desc: 'Full and less-than-container load options for high-volume international shipments.' },
  { icon: Thermometer,  tag: 'SENSITIVE',  title: 'Cold Chain',          desc: 'Temperature-controlled logistics for pharmaceuticals, food, and perishables.' },
  { icon: AlertTriangle,tag: 'CERTIFIED',  title: 'Hazmat Certified',    desc: 'Safe, compliant transport of hazardous materials with full regulatory adherence.' },
]

const TESTIMONIALS = [
  { name: 'Sarah Chen', role: 'VP Operations, NovaTech', quote: 'SwiftHaul cut our international shipping delays by 60%. The tracking dashboard is a game-changer.', stars: 5 },
  { name: 'Marcus Webb', role: 'Founder, WebMerchandise', quote: 'Every parcel, every time. The reliability is unmatched and the interface is just beautiful.', stars: 5 },
  { name: 'Priya Kapoor', role: 'Logistics Manager, MedSupply', quote: 'Cold chain handling is flawless. Our pharmaceutical shipments arrive perfectly conditioned.', stars: 5 },
  { name: 'Tom Okafor', role: 'CEO, AfroExport Ltd', quote: 'We moved our entire B2B logistics to SwiftHaul. The analytics alone justify the switch.', stars: 5 },
  { name: 'Lena Schmidt', role: 'E-commerce Director, ModaDE', quote: 'Our customers love the real-time tracking. Returns have dropped 40% since we switched.', stars: 5 },
  { name: 'James Liu', role: 'Supply Chain Lead, TechForward', quote: 'The hazmat certification and compliance features saved us significant regulatory headaches.', stars: 5 },
]

function HeroBgVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)

  function toggleMute() {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
  }

  return (
    <>
      <video
        ref={videoRef}
        src="/cinematic.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: 0 }}
      />

      {/* Cinematic gradient overlay — darkens top/bottom for text legibility */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background:
            'linear-gradient(to bottom, rgba(5,8,16,0.82) 0%, rgba(5,8,16,0.25) 35%, rgba(5,8,16,0.25) 65%, rgba(5,8,16,0.92) 100%)',
        }}
      />

      {/* Unmute pill — bottom-right */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        onClick={toggleMute}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="absolute bottom-8 right-6 flex items-center gap-2 glass-sm px-4 py-2 text-xs font-mono"
        style={{ zIndex: 20, borderRadius: '999px', color: 'var(--text-secondary)', cursor: 'pointer' }}
      >
        {muted ? <><VolumeX size={13} /> Unmute</> : <><Volume2 size={13} /> Mute</>}
      </motion.button>
    </>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const [trackId, setTrackId] = useState('')
  const [shake, setShake] = useState(false)

  function handleTrack(e: React.FormEvent) {
    e.preventDefault()
    if (!trackId.trim()) {
      setShake(true)
      setTimeout(() => setShake(false), 500)
      return
    }
    navigate(`/track?id=${encodeURIComponent(trackId.trim())}`)
  }

  const heroRef = useRef<HTMLDivElement>(null)
  const servicesRef = useRef<HTMLDivElement>(null)
  const servicesInView = useInView(servicesRef, { once: true, margin: '-80px' })

  return (
    <div className="relative z-content">
      {/* ===== HERO ===== */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-20 overflow-hidden">
        <HeroBgVideo />

        <div className="relative max-w-4xl w-full mx-auto text-center space-y-8" style={{ zIndex: 10 }}>
          {/* Badge */}
          <motion.div custom={0} variants={FADE_UP} initial="hidden" animate="visible">
            <span className="inline-flex items-center gap-2 glass-sm px-4 py-2 text-xs font-mono"
              style={{ color: 'var(--accent-primary)', borderRadius: '999px' }}>
              <Zap size={12} fill="currentColor" /> Real-time global logistics
            </span>
          </motion.div>

          {/* Headline */}
          <motion.div custom={1} variants={FADE_UP} initial="hidden" animate="visible">
            <h1 className="font-display leading-none" style={{ fontSize: 'clamp(52px, 10vw, 96px)' }}>
              <span style={{ color: 'var(--text-primary)' }}>MOVE ANYTHING.</span>
              <br />
              <span className="text-cyan-gradient">TRACK EVERYTHING.</span>
            </h1>
          </motion.div>

          {/* Subheadline */}
          <motion.p
            custom={2} variants={FADE_UP} initial="hidden" animate="visible"
            className="font-body max-w-xl mx-auto leading-relaxed"
            style={{ fontSize: '18px', fontWeight: 300, color: 'var(--text-secondary)' }}>
            SwiftHaul delivers precision logistics across 180+ countries. Real-time tracking, zero surprises.
          </motion.p>

          {/* CTA Row */}
          <motion.div
            custom={3} variants={FADE_UP} initial="hidden" animate="visible"
            className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/track')}
              className="btn-primary flex items-center gap-2 font-body font-semibold text-sm">
              Track a Shipment <ArrowRight size={16} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
              className="btn-secondary font-body text-sm">
              Get a Quote
            </motion.button>
          </motion.div>

          {/* Quick Track Bar */}
          <motion.form
            variants={FADE_UP} initial="hidden" animate={shake ? { x: [-8, 8, -6, 6, -4, 4, 0], opacity: 1, y: 0 } : 'visible'}
            transition={shake ? { duration: 0.4, ease: 'easeInOut' } : {}}
            onSubmit={handleTrack}
            className="relative max-w-2xl mx-auto"
          >
            <div className="glass flex items-center gap-3 p-2" style={{ borderRadius: '16px' }}>
              <input
                value={trackId}
                onChange={e => setTrackId(e.target.value)}
                placeholder="Enter tracking number (e.g. SH-2024-XXXXXXX)"
                className="flex-1 bg-transparent px-3 py-3 text-sm font-mono outline-none"
                style={{ color: 'var(--text-primary)' }}
              />
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                type="submit"
                className="flex items-center gap-2 font-semibold text-sm px-5 py-3"
                style={{
                  background: 'var(--accent-primary)', color: '#050810',
                  borderRadius: '12px', border: 'none', cursor: 'pointer',
                }}>
                <Search size={16} /> Track
              </motion.button>
            </div>
          </motion.form>

          {/* Stats Row */}
          <motion.div
            custom={5} variants={FADE_UP} initial="hidden" animate="visible"
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <StatCard value={2400000} suffix="+" label="Parcels Delivered" delay={0.1} />
            <StatCard value={180}     suffix="+"  label="Countries"         delay={0.2} />
            <StatCard value={99}      suffix=".7%" label="On-Time Rate"     delay={0.3} />
          </motion.div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="relative z-content px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16">
            <p className="text-xs font-mono mb-3" style={{ color: 'var(--accent-primary)', letterSpacing: '0.2em' }}>HOW IT WORKS</p>
            <h2 className="font-display text-5xl" style={{ color: 'var(--text-primary)' }}>SIMPLE AS 1-2-3-4</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {HOW_STEPS.map(({ num, icon: Icon, title, desc }, i) => (
              <motion.div
                key={num}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6, delay: i * 0.15, ease: [0.23, 1, 0.32, 1] }}
                whileHover={{ y: -4 }}
                className="glass glass-shimmer p-8 flex flex-col gap-4"
                style={{ willChange: 'transform' }}>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-3xl font-bold" style={{ color: 'var(--accent-primary)', opacity: 0.5 }}>{num}</span>
                  <div className="w-10 h-10 glass-sm flex items-center justify-center" style={{ borderRadius: '10px' }}>
                    <Icon size={20} style={{ color: 'var(--accent-primary)' }} />
                  </div>
                </div>
                <h3 className="font-display text-xl" style={{ color: 'var(--text-primary)' }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SERVICES GRID ===== */}
      <section id="services" ref={servicesRef} className="relative z-content px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16">
            <p className="text-xs font-mono mb-3" style={{ color: 'var(--accent-primary)', letterSpacing: '0.2em' }}>OUR SERVICES</p>
            <h2 className="font-display text-5xl" style={{ color: 'var(--text-primary)' }}>BUILT FOR EVERY NEED</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map(({ icon: Icon, tag, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 50 }}
                animate={servicesInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.23, 1, 0.32, 1] }}
                whileHover={{ y: -4 }}
                className="glass glass-shimmer p-6 group cursor-pointer"
                style={{ willChange: 'transform' }}>
                <div className="mb-5">
                  <div className="w-12 h-12 glass flex items-center justify-center mb-4"
                    style={{ borderRadius: '12px' }}>
                    <Icon size={24} style={{ color: 'var(--accent-primary)' }} />
                  </div>
                  <p className="text-xs font-mono mb-1" style={{ color: 'var(--accent-primary)', letterSpacing: '0.15em' }}>{tag}</p>
                  <h3 className="font-display text-xl" style={{ color: 'var(--text-primary)' }}>{title}</h3>
                </div>
                <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
                <span
                  className="text-sm font-body font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all"
                  style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>
                  Learn More <ArrowRight size={14} />
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="relative z-content py-24 overflow-hidden">
        <div className="mb-12 text-center px-4">
          <p className="text-xs font-mono mb-3" style={{ color: 'var(--accent-primary)', letterSpacing: '0.2em' }}>TESTIMONIALS</p>
          <h2 className="font-display text-5xl" style={{ color: 'var(--text-primary)' }}>TRUSTED WORLDWIDE</h2>
        </div>
        <div className="relative overflow-hidden">
          <div className="marquee-track">
            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
              <div
                key={i}
                className="glass-shimmer flex-shrink-0 w-80 p-6"
                style={{
                  borderRadius: '20px',
                  background: 'rgba(255,200,100,0.025)',
                  backdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                }}>
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.stars }).map((_, s) => (
                    <Star key={s} size={12} fill="#ffd700" style={{ color: '#ffd700' }} />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-4 font-body" style={{ color: 'var(--text-secondary)' }}>
                  "{t.quote}"
                </p>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section className="relative z-content px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto glass text-center p-16"
          style={{ borderRadius: '28px' }}>
          <Globe size={48} className="mx-auto mb-6" style={{ color: 'var(--accent-primary)' }} />
          <h2 className="font-display text-5xl mb-4" style={{ color: 'var(--text-primary)' }}>
            READY TO SHIP?
          </h2>
          <p className="font-body mb-8 max-w-lg mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Join 50,000+ businesses that trust SwiftHaul with their logistics. Start tracking today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/admin')}
              className="btn-primary font-body font-semibold flex items-center gap-2 mx-auto sm:mx-0">
              Get Started Free <ArrowRight size={16} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/track')}
              className="btn-secondary font-body text-sm mx-auto sm:mx-0">
              Track a Shipment
            </motion.button>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  )
}
