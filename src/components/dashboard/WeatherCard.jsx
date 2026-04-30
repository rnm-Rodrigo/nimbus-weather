import { motion } from 'framer-motion'
import GlassCard from '../ui/GlassCard'
import { windDirection } from '../../api/weather'

// ── OWM icon → local SVG-based icon map ──────────────────────
// We use inline SVG icons instead of OWM's PNG icons for
// crisp rendering at any size and full theme-colour control.

function WeatherIcon({ weatherId, size = 64, color = '#fff' }) {
  // Group by code ranges
  const isThunder = weatherId >= 200 && weatherId < 300
  const isDrizzle = weatherId >= 300 && weatherId < 400
  const isRain    = weatherId >= 500 && weatherId < 600
  const isSnow    = weatherId >= 600 && weatherId < 700
  const isFog     = weatherId >= 700 && weatherId < 800
  const isClear   = weatherId === 800
  const isCloudy  = weatherId > 800

  const s = size
  const stroke = { stroke: color, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' }

  if (isClear) return (
    <svg width={s} height={s} viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="9" {...stroke} fill={`${color}22`} />
      {[0,45,90,135,180,225,270,315].map(a => (
        <line key={a}
          x1={24 + 13 * Math.cos(a*Math.PI/180)} y1={24 + 13 * Math.sin(a*Math.PI/180)}
          x2={24 + 17 * Math.cos(a*Math.PI/180)} y2={24 + 17 * Math.sin(a*Math.PI/180)}
          {...stroke} />
      ))}
    </svg>
  )

  if (isCloudy) return (
    <svg width={s} height={s} viewBox="0 0 48 48">
      <path d="M12 32a8 8 0 0 1 0-16 8 8 0 0 1 15.5-2.5A6 6 0 0 1 36 26a6 6 0 0 1-6 6H12z" {...stroke} />
    </svg>
  )

  if (isRain || isDrizzle) return (
    <svg width={s} height={s} viewBox="0 0 48 48">
      <path d="M10 28a8 8 0 0 1 0-14 8 8 0 0 1 15.5-1A5 5 0 0 1 34 22a5 5 0 0 1-5 6H10z" {...stroke} />
      {[[16,36,16,42],[22,34,22,40],[28,36,28,42]].map(([x1,y1,x2,y2],i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} {...stroke} strokeOpacity=".7" />
      ))}
    </svg>
  )

  if (isSnow) return (
    <svg width={s} height={s} viewBox="0 0 48 48">
      <path d="M10 26a8 8 0 0 1 0-14 8 8 0 0 1 15.5-1A5 5 0 0 1 34 20a5 5 0 0 1-5 6H10z" {...stroke} />
      {[[16,36],[22,34],[28,36]].map(([x,y],i) => (
        <g key={i}>
          <line x1={x} y1={y} x2={x} y2={y+6} {...stroke} strokeOpacity=".7" />
          <line x1={x-2} y1={y+2} x2={x+2} y2={y+2} {...stroke} strokeOpacity=".5" />
        </g>
      ))}
    </svg>
  )

  if (isThunder) return (
    <svg width={s} height={s} viewBox="0 0 48 48">
      <path d="M10 28a8 8 0 0 1 0-14 8 8 0 0 1 15.5-1A5 5 0 0 1 34 22a5 5 0 0 1-5 6H10z" {...stroke} />
      <polyline points="22,30 18,38 24,38 20,46" {...stroke} strokeWidth={2.5} fill="none" />
    </svg>
  )

  if (isFog) return (
    <svg width={s} height={s} viewBox="0 0 48 48">
      {[20,26,32].map((y,i) => (
        <line key={i} x1={10 + i*2} y1={y} x2={38 - i*2} y2={y} {...stroke} strokeOpacity={1 - i*0.25} />
      ))}
    </svg>
  )

  return <div style={{ width: s, height: s }} />
}

// ── Helpers ────────────────────────────────────────────────────
function localTimeString(timezone) {
  const d = new Date(Date.now() + timezone * 1000)
  const h = d.getUTCHours().toString().padStart(2, '0')
  const m = d.getUTCMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''
}

// ─────────────────────────────────────────────────────────────
// WeatherCard
// ─────────────────────────────────────────────────────────────
export default function WeatherCard({ weather, theme }) {
  if (!weather) return null

  const tc = theme?.textColor   ?? '#ffffff'
  const tm = theme?.textMuted   ?? 'rgba(255,255,255,0.55)'

  return (
    <GlassCard theme={theme} style={{ padding: '2rem', minWidth: 280 }} delay={0.1}>

      {/* City + local time */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <motion.h2
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '1.6rem', fontWeight: 400, color: tc, lineHeight: 1 }}
          >
            {weather.cityName}
          </motion.h2>
          <div style={{ fontSize: '0.8rem', color: tm, marginTop: 4 }}>
            {weather.countryCode} · {localTimeString(weather.timezone)} local
          </div>
        </div>

        <WeatherIcon weatherId={weather.weatherId} size={54} color={tc} />
      </div>

      {/* Temperature */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        style={{ marginTop: '1.2rem', display: 'flex', alignItems: 'baseline', gap: 4 }}
      >
        <span style={{
          fontFamily: "'DM Serif Display', Georgia, serif",
          fontSize: '4.5rem',
          fontWeight: 400,
          color: tc,
          lineHeight: 1,
          letterSpacing: '-2px',
        }}>
          {weather.temp}
        </span>
        <span style={{ fontSize: '2rem', color: tm, lineHeight: 1 }}>
          {weather.tempUnit}
        </span>
      </motion.div>

      {/* Condition description */}
      <div style={{ fontSize: '1rem', color: tm, marginTop: 6, textTransform: 'capitalize' }}>
        {capitalize(weather.description)}
      </div>

      {/* Hi / Lo */}
      <div style={{ fontSize: '0.82rem', color: tm, marginTop: 2 }}>
        H: {weather.tempMax}{weather.tempUnit} · L: {weather.tempMin}{weather.tempUnit}
      </div>

      {/* Divider */}
      <div style={{ margin: '1.2rem 0', height: 1, background: theme?.cardBorder ?? 'rgba(255,255,255,0.12)' }} />

      {/* Stats row */}
      <StatRow theme={theme} weather={weather} />
    </GlassCard>
  )
}

function StatRow({ weather, theme }) {
  const tc = theme?.textColor ?? '#fff'
  const tm = theme?.textMuted ?? 'rgba(255,255,255,0.55)'

  const stats = [
    { label: 'Humidity',   value: `${weather.humidity}%` },
    { label: 'Feels like', value: `${weather.feelsLike}${weather.tempUnit}` },
    { label: 'Heat index', value: weather.heatIndex !== null ? `${weather.heatIndex}${weather.tempUnit}` : '—' },
    { label: 'Wind',       value: `${weather.windSpeed} ${weather.windUnit} ${windDirection(weather.windDeg)}` },
    { label: 'Pressure',   value: `${weather.pressure} hPa` },
    { label: 'Visibility', value: weather.visibility ? `${(weather.visibility / 1000).toFixed(1)} km` : '—' },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem 0.5rem' }}>
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 + i * 0.05 }}
        >
          <div style={{ fontSize: '0.68rem', color: tm, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
            {s.label}
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 500, color: tc }}>
            {s.value}
          </div>
        </motion.div>
      ))}
    </div>
  )
}
