import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="relative z-content min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-lg"
      >
        <motion.div
          animate={{ y: [-8, 8, -8] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="font-display mb-4"
          style={{ fontSize: 'clamp(100px, 20vw, 180px)', color: 'var(--accent-primary)', lineHeight: 1, opacity: 0.15 }}
        >
          404
        </motion.div>
        <h1 className="font-display text-4xl mb-4" style={{ color: 'var(--text-primary)', marginTop: '-60px' }}>
          PARCEL NOT FOUND
        </h1>
        <p className="font-body mb-8" style={{ color: 'var(--text-secondary)' }}>
          This page seems to have been lost in transit. Let us route you back.
        </p>
        <div className="flex gap-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => navigate(-1)}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <ArrowLeft size={16} /> Go Back
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/')}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Home size={16} /> Home
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
