import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [shake, setShake] = useState(false)
  const { login, isLoading } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await login(email, password)
      navigate('/admin')
    } catch (err) {
      setShake(true)
      setTimeout(() => setShake(false), 500)
      toast.error((err as Error).message || 'Invalid credentials')
    }
  }

  return (
    <div className="relative z-content min-h-screen flex items-center justify-center px-4">
      <motion.div
        animate={shake ? { x: [-8, 8, -6, 6, 0], borderColor: ['rgba(255,23,68,0.5)', 'rgba(255,255,255,0.10)'] } : {}}
        transition={{ duration: 0.4 }}
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        className="glass w-full max-w-md p-10"
        style={{ borderRadius: '28px' }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'var(--accent-primary)' }}>
            <Zap size={24} fill="currentColor" style={{ color: '#050810' }} />
          </div>
          <h1 className="font-display text-3xl" style={{ color: 'var(--text-primary)' }}>SWIFTHAUL</h1>
          <p className="text-sm mt-1 font-mono" style={{ color: 'var(--accent-primary)' }}>Admin Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="float-label-wrapper">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder=" "
              required
              className="glass-input w-full px-4 pt-6 pb-2 text-sm"
            />
            <label>Email address</label>
          </div>

          {/* Password */}
          <div className="float-label-wrapper relative">
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder=" "
              required
              className="glass-input w-full px-4 pt-6 pb-2 text-sm pr-12"
            />
            <label>Password</label>
            <button
              type="button"
              onClick={() => setShowPass(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }}
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full flex items-center justify-center gap-2 font-body font-semibold"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
            {isLoading ? 'Authenticating…' : 'Sign In'}
          </motion.button>
        </form>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--text-muted)' }}>
          Demo: admin@swifthaul.dev / admin123
        </p>
      </motion.div>
    </div>
  )
}
