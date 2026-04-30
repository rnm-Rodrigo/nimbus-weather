import { useState } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '../ui/GlassCard'

function ForecastIcon({ id, size = 24, color = '#fff' }) {
  const isRain    = id >= 300 && id < 600
  const isSnow    = id >= 600 && id < 700
  const isStorm   = id >= 200 && id < 300
  const isClear   = id === 800
  const isCloudy  = id > 800
  const s = { stroke: color, strokeWidth: 1.8, strokeLinecap:'round', fill:'none' }

  if (isClear)  return <svg width={size} height={size} viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" {...s} fill={`${color}18`}/>{[0,60,120,180,240,300].map(a=><line key={a} x1={12+8*Math.cos(a*Math.PI/180)} y1={12+8*Math.sin(a*Math.PI/180)} x2={12+10*Math.cos(a*Math.PI/180)} y2={12+10*Math.sin(a*Math.PI/180)} {...s}/>)}</svg>
  if (isCloudy) return <svg width={size} height={size} viewBox="0 0 24 24"><path d="M6 16a4 4 0 0 1 0-8 4 4 0 0 1 7.75-1.25A3 3 0 0 1 18 13a3 3 0 0 1-3 3H6z" {...s}/></svg>
  if (isRain)   return <svg width={size} height={size} viewBox="0 0 24 24"><path d="M5 14a4 4 0 0 1 0-7 4 4 0 0 1 7.75-1A3 3 0 0 1 18 10a3 3 0 0 1-3 4H5z" {...s}/><line x1="8" y1="18" x2="8" y2="21" {...s}/><line x1="12" y1="17" x2="12" y2="20" {...s}/><line x1="16" y1="18" x2="16" y2="21" {...s}/></svg>
  if (isSnow)   return <svg width={size} height={size} viewBox="0 0 24 24"><path d="M5 13a4 4 0 0 1 0-7 4 4 0 0 1 7.75-1A3 3 0 0 1 18 9a3 3 0 0 1-3 4H5z" {...s}/><line x1="9" y1="17" x2="9" y2="23" {...s}/><line x1="7" y1="19" x2="11" y2="19" {...s}/><line x1="13" y1="17" x2="13" y2="23" {...s}/><line x1="11" y1="19" x2="15" y2="19" {...s}/></svg>
  if (isStorm)  return <svg width={size} height={size} viewBox="0 0 24 24"><path d="M5 14a4 4 0 0 1 0-7 4 4 0 0 1 7.75-1A3 3 0 0 1 18 10a3 3 0 0 1-3 4H5z" {...s}/><polyline points="11,15 9,19 12,19 10,23" {...s} strokeWidth={2}/></svg>
  return <svg width={size} height={size} viewBox="0 0 24 24"><line x1="4" y1="10" x2="20" y2="10" {...s}/><line x1="4" y1="14" x2="20" y2="14" {...s}/><line x1="4" y1="18" x2="16" y2="18" {...s}/></svg>
}

function hourLabel(ts) {
  const d = new Date(ts)
  const h = d.getHours()
  return h === 0 ? '12am' : h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`
}

function dayLabel(ts) {
  return new Date(ts).toLocaleDateString('en-US', { weekday: 'short' })
}

export default function ForecastStrip({ forecast, theme }) {
  const [view, setView] = useState('hourly') // 'hourly' | 'daily'
  if (!forecast) return null

  const tc = theme?.textColor ?? '#fff'
  const tm = theme?.textMuted ?? 'rgba(255,255,255,0.55)'
  const ac = theme?.accentColor ?? '#fff'

  const items = view === 'hourly'
    ? forecast.hourly.slice(0, 12)
    : forecast.daily.slice(0, 7)

  return (
    <GlassCard theme={theme} style={{ padding: '1.25rem' }} delay={0.25}>

      {/* Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.75rem', color: tm, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 500 }}>
          Forecast
        </span>
        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.18)', borderRadius: 8, padding: 3, gap: 3 }}>
          {['hourly', 'daily'].map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                padding: '4px 12px',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.72rem',
                fontWeight: 500,
                fontFamily: "'DM Sans', sans-serif",
                background: view === v ? 'rgba(255,255,255,0.15)' : 'transparent',
                color: view === v ? tc : tm,
                transition: 'all 0.2s',
              }}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Scroll row */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: 4 }}
        className="hide-scrollbar">
        {items.map((item, i) => (
          <motion.div
            key={item.dt}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              minWidth: view === 'daily' ? 64 : 52,
              padding: '0.6rem 0.5rem',
              borderRadius: 12,
              background: 'rgba(255,255,255,0.05)',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: '0.72rem', color: tm }}>
              {view === 'hourly' ? hourLabel(item.dt) : dayLabel(item.dt)}
            </span>
            <ForecastIcon id={item.weatherId} size={22} color={tc} />
            {view === 'hourly' ? (
              <>
                <span style={{ fontSize: '0.85rem', fontWeight: 500, color: tc }}>{item.temp}{item.tempUnit}</span>
                {item.pop > 10 && (
                  <span style={{ fontSize: '0.65rem', color: '#7ec8e3' }}>{item.pop}%</span>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 500, color: tc }}>{item.tempMax}{item.tempUnit}</div>
                <div style={{ fontSize: '0.72rem', color: tm }}>{item.tempMin}{item.tempUnit}</div>
                {item.pop > 10 && (
                  <div style={{ fontSize: '0.65rem', color: '#7ec8e3', marginTop: 2 }}>{item.pop}%</div>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </GlassCard>
  )
}
