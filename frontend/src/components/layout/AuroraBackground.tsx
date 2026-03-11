import { useEffect, useRef } from 'react'

export default function AuroraBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number

    const particles: Array<{
      x: number; y: number; size: number; speed: number;
      opacity: number; blinkSpeed: number; blinkPhase: number
    }> = []

    function resize() {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    function initParticles() {
      particles.length = 0
      const count = Math.min(70, Math.floor(window.innerWidth / 20))
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: Math.random() * 1.5 + 0.5,
          speed: Math.random() * 0.4 + 0.1,
          opacity: Math.random() * 0.5 + 0.1,
          blinkSpeed: Math.random() * 0.02 + 0.005,
          blinkPhase: Math.random() * Math.PI * 2,
        })
      }
    }

    let t = 0
    function draw() {
      if (!canvas || !ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      t += 0.016

      particles.forEach(p => {
        p.y -= p.speed
        p.blinkPhase += p.blinkSpeed
        if (p.y < -10) {
          p.y = canvas.height + 10
          p.x = Math.random() * canvas.width
        }
        const blink = (Math.sin(p.blinkPhase) + 1) / 2
        const alpha = p.opacity * (0.5 + blink * 0.5)
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0, 229, 255, ${alpha})`
        ctx.fill()
      })

      animId = requestAnimationFrame(draw)
    }

    resize()
    initParticles()
    draw()

    window.addEventListener('resize', () => { resize(); initParticles() })
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <>
      <div className="aurora-bg" aria-hidden="true">
        <div className="aurora-blob aurora-blob-1" />
        <div className="aurora-blob aurora-blob-2" />
        <div className="aurora-blob aurora-blob-3" />
      </div>
      <div className="noise-overlay" aria-hidden="true" />
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
        aria-hidden="true"
      />
    </>
  )
}
