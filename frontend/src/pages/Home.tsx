import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import {
  Zap, Search, Package, Globe, Clock, ArrowRight,
  Truck, Plane, Ship, Thermometer, AlertTriangle, Star,
  BookOpen, MapPin, CheckCircle,
  Play, Pause, Volume2, VolumeX, Maximize2
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

function CinematicVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(0.7)
  const [started, setStarted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showControls, setShowControls] = useState(false)
  const hideTimer = useRef<ReturnType<typeof setTimeout>>()

  function handlePlayClick() {
    const v = videoRef.current
    if (!v) return
    if (!started) {
      v.volume = volume
      v.muted = false
      setStarted(true)
    }
    if (v.paused) { v.play(); setPlaying(true) }
    else { v.pause(); setPlaying(false) }
  }

  function handleVolumeChange(val: number) {
    setVolume(val)
    if (videoRef.current) videoRef.current.volume = val
    if (val === 0) setMuted(true)
    else setMuted(false)
  }

  function toggleMute() {
    const v = videoRef.current
    if (!v) return
    const next = !muted
    setMuted(next)
    v.muted = next
  }

  function handleTimeUpdate() {
    const v = videoRef.current
    if (!v || !v.duration) return
    setProgress((v.currentTime / v.duration) * 100)
  }

  function seekTo(e: React.MouseEvent<HTMLDivElement>) {
    const v = videoRef.current
    if (!v) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    v.currentTime = ratio * v.duration
  }

  function showControlsTemporarily() {
    setShowControls(true)
    clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setShowControls(false), 3000)
  }

  function handleFullscreen() {
    videoRef.current?.requestFullscreen?.().catch(() => {})
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
      className="relative w-full overflow-hidden cursor-pointer group"
      style={{ borderRadius: '24px', aspectRatio: '21/9', background: '#000' }}
      onMouseMove={started ? showControlsTemporarily : undefined}
      onMouseLeave={() => { clearTimeout(hideTimer.current); setShowControls(false) }}
    >
      {/* Letterbox bars */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20" style={{ height: '6%', background: '#000' }} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20" style={{ height: '6%', background: '#000' }} />

      {/* Video element */}
      <video
        ref={videoRef}
        src="/cinematic.mp4"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: 1 }}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setPlaying(false)}
        preload="metadata"
        playsInline
      />

      {/* Dark vignette overlay */}
      <div
        className="absolute inset-0"
        style={{
          zIndex: 2,
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)',
        }}
      />

      {/* Pre-play overlay */}
      <AnimatePresence>
        {!started && (
          <motion.div
            initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ zIndex: 10 }}
            onClick={handlePlayClick}
          >
            {/* Cinematic gradient overlay */}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(5,8,16,0.6) 100%)' }} />
            <div className="relative z-10 flex flex-col items-center gap-6">
              <p className="text-xs font-mono tracking-widest" style={{ color: 'var(--accent-primary)', letterSpacing: '0.3em' }}>SWIFTHAUL LOGISTICS</p>
              <motion.button
                whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.94 }}
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(0,229,255,0.12)',
                  border: '2px solid rgba(0,229,255,0.5)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <Play size={28} fill="var(--accent-primary)" style={{ color: 'var(--accent-primary)', marginLeft: '3px' }} />
              </motion.button>
              <p className="font-display text-lg md:text-2xl tracking-widest" style={{ color: 'rgba(240,244,255,0.8)' }}>WATCH THE STORY</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* In-play controls (shown on hover after started) */}
      <AnimatePresence>
        {started && (showControls || !playing) && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex flex-col justify-between p-4 md:p-6"
            style={{ zIndex: 10 }}
          >
            {/* Center play/pause tap zone */}
            <div className="flex-1 flex items-center justify-center" onClick={handlePlayClick}>
              <motion.div
                key={playing ? 'pause' : 'play'}
                initial={{ scale: 1.4, opacity: 0.8 }} animate={{ scale: 1, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', pointerEvents: 'none' }}
              >
                {playing
                  ? <Pause size={24} style={{ color: '#fff' }} />
                  : <Play size={24} fill="#fff" style={{ color: '#fff', marginLeft: '3px' }} />}
              </motion.div>
            </div>

            {/* Bottom bar */}
            <div
              className="flex flex-col gap-2"
              style={{ background: 'rgba(5,8,16,0.7)', backdropFilter: 'blur(16px)', borderRadius: '14px', padding: '10px 16px' }}
            >
              {/* Progress bar */}
              <div
                className="relative h-1 rounded-full cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.15)' }}
                onClick={seekTo}
              >
                <div
                  className="absolute left-0 top-0 h-full rounded-full"
                  style={{ width: `${progress}%`, background: 'var(--accent-primary)', transition: 'width 0.1s linear' }}
                />
              </div>

              {/* Controls row */}
              <div className="flex items-center gap-3">
                <button onClick={handlePlayClick} className="shrink-0 hover:opacity-80 transition-opacity">
                  {playing
                    ? <Pause size={16} style={{ color: '#fff' }} />
                    : <Play size={16} fill="#fff" style={{ color: '#fff' }} />}
                </button>

                {/* Volume */}
                <div className="flex items-center gap-2">
                  <button onClick={toggleMute} className="hover:opacity-80 transition-opacity">
                    {muted || volume === 0
                      ? <VolumeX size={15} style={{ color: '#fff' }} />
                      : <Volume2 size={15} style={{ color: '#fff' }} />}
                  </button>
                  <input
                    type="range" min="0" max="1" step="0.01"
                    value={muted ? 0 : volume}
                    onChange={e => handleVolumeChange(+e.target.value)}
                    className="w-20 accent-cyan-400 cursor-pointer"
                    style={{ height: '3px' }}
                  />
                </div>

                <div className="flex-1" />
                <button onClick={handleFullscreen} className="hover:opacity-80 transition-opacity">
                  <Maximize2 size={14} style={{ color: '#fff' }} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
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
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-20">
        <div className="grid-perspective" aria-hidden="true" />

        <div className="max-w-4xl w-full mx-auto text-center space-y-8">
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

      {/* ===== CINEMATIC VIDEO ===== */}
      <section className="relative z-content px-4 pb-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8">
            <p className="text-xs font-mono tracking-widest" style={{ color: 'var(--accent-primary)', letterSpacing: '0.25em' }}>THE SWIFTHAUL WAY</p>
          </motion.div>
          <CinematicVideo />
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
