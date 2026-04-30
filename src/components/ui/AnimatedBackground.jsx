import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─────────────────────────────────────────────────────────────
// Particle overlays (canvas-based for performance)
// ─────────────────────────────────────────────────────────────

function RainCanvas({ color }) {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf
    let drops = []

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      drops = Array.from({ length: 120 }, () => ({
        x:     Math.random() * canvas.width,
        y:     Math.random() * canvas.height,
        len:   12 + Math.random() * 20,
        speed: 6 + Math.random() * 8,
        op:    0.3 + Math.random() * 0.5,
      }))
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      drops.forEach(d => {
        ctx.beginPath()
        ctx.moveTo(d.x, d.y)
        ctx.lineTo(d.x - 1, d.y + d.len)
        ctx.strokeStyle = color || 'rgba(180,220,255,0.5)'
        ctx.globalAlpha = d.op
        ctx.lineWidth = 1
        ctx.stroke()
        d.y += d.speed
        if (d.y > canvas.height) { d.y = -d.len; d.x = Math.random() * canvas.width }
      })
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [color])

  return <canvas ref={canvasRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none' }} />
}

function SnowCanvas({ color }) {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf
    let flakes = []

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      flakes = Array.from({ length: 80 }, () => ({
        x:     Math.random() * canvas.width,
        y:     Math.random() * canvas.height,
        r:     1 + Math.random() * 3,
        speed: 0.5 + Math.random() * 1.5,
        drift: (Math.random() - 0.5) * 0.4,
        op:    0.4 + Math.random() * 0.6,
      }))
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      flakes.forEach(f => {
        ctx.beginPath()
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2)
        ctx.fillStyle = color || 'rgba(255,255,255,0.8)'
        ctx.globalAlpha = f.op
        ctx.fill()
        f.y += f.speed; f.x += f.drift
        if (f.y > canvas.height) { f.y = -5; f.x = Math.random() * canvas.width }
        if (f.x > canvas.width)  f.x = 0
        if (f.x < 0)             f.x = canvas.width
      })
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [color])

  return <canvas ref={canvasRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none' }} />
}

function StarsCanvas({ color }) {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf
    let stars = []
    let t = 0

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      stars = Array.from({ length: 160 }, () => ({
        x:     Math.random() * canvas.width,
        y:     Math.random() * canvas.height,
        r:     0.5 + Math.random() * 1.2,
        phase: Math.random() * Math.PI * 2,
        speed: 0.005 + Math.random() * 0.01,
      }))
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      t += 0.016
      stars.forEach(s => {
        const op = 0.3 + 0.5 * Math.abs(Math.sin(t * s.speed + s.phase))
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = color || 'rgba(255,255,255,0.7)'
        ctx.globalAlpha = op
        ctx.fill()
      })
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [color])

  return <canvas ref={canvasRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none' }} />
}

function LightningOverlay() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let timeout
    const flash = () => {
      el.style.opacity = '0.12'
      setTimeout(() => {
        el.style.opacity = '0'
        setTimeout(() => { el.style.opacity = '0.08'; setTimeout(() => { el.style.opacity = '0' }, 60) }, 80)
      }, 60)
      timeout = setTimeout(flash, 3000 + Math.random() * 8000)
    }
    timeout = setTimeout(flash, 1500)
    return () => clearTimeout(timeout)
  }, [])
  return (
    <div ref={ref} style={{
      position: 'absolute', inset: 0, background: 'rgba(255,240,120,1)',
      pointerEvents: 'none', opacity: 0, transition: 'opacity 0.05s',
    }} />
  )
}

function FogOverlay() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          position: 'absolute', left: '-20%', right: '-20%',
          height: '30%', top: `${20 + i * 25}%`,
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '50%',
          filter: 'blur(30px)',
          animation: `fogDrift ${8 + i * 3}s ease-in-out infinite alternate`,
          animationDelay: `${-i * 2}s`,
        }} />
      ))}
      <style>{`
        @keyframes fogDrift {
          from { transform: translateX(-8%) scaleY(0.9); }
          to   { transform: translateX(8%)  scaleY(1.1); }
        }
      `}</style>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Overlay router
// ─────────────────────────────────────────────────────────────
function Overlay({ type, color }) {
  switch (type) {
    case 'rain':      return <RainCanvas color={color} />
    case 'snow':      return <SnowCanvas color={color} />
    case 'stars':     return <StarsCanvas color={color} />
    case 'lightning': return <><RainCanvas color="rgba(100,80,40,0.3)" /><LightningOverlay /></>
    case 'fog':       return <FogOverlay />
    default:          return null
  }
}

// ─────────────────────────────────────────────────────────────
// AnimatedBackground — cross-fades on theme change
// ─────────────────────────────────────────────────────────────
const bgVariants = {
  enter:  { opacity: 0 },
  center: { opacity: 1, transition: { duration: 1.4, ease: 'easeInOut' } },
  exit:   { opacity: 0, transition: { duration: 1.0, ease: 'easeInOut' } },
}

export default function AnimatedBackground({ theme, children }) {
  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>

      {/* Crossfading gradient layer */}
      <AnimatePresence mode="sync">
        <motion.div
          key={theme.id}
          variants={bgVariants}
          initial="enter"
          animate="center"
          exit="exit"
          style={{
            position:   'fixed',
            inset:      0,
            background: theme.gradient,
            zIndex:     0,
          }}
        />
      </AnimatePresence>

      {/* Particle / weather overlay */}
      <AnimatePresence mode="sync">
        {theme.overlay && (
          <motion.div
            key={`overlay-${theme.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 2 } }}
            exit={{    opacity: 0, transition: { duration: 1 } }}
            style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none' }}
          >
            <Overlay type={theme.overlay} color={theme.particleColor} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {children}
      </div>
    </div>
  )
}
