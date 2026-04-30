import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, User, Thermometer, MapPin, LogOut,
  Trash2, Check, AlertTriangle, Star, Loader2,
} from 'lucide-react'

import { useAuth }      from '../context/AuthContext'
import { useLocations } from '../context/LocationContext'
import { useWeather }   from '../context/WeatherContext'
import useTheme         from '../hooks/useTheme'
import AnimatedBackground from '../components/ui/AnimatedBackground'
import GlassCard from '../components/ui/GlassCard'

// ── Reusable section card ─────────────────────────────────────
function Section({ title, children, theme, delay = 0 }) {
  const tm = theme?.textMuted ?? 'rgba(255,255,255,0.45)'
  return (
    <GlassCard theme={theme} style={{ padding: '1.25rem' }} delay={delay}>
      <div style={{
        fontSize: '0.68rem', fontWeight: 500, textTransform: 'uppercase',
        letterSpacing: '0.08em', color: tm, marginBottom: '1rem',
      }}>
        {title}
      </div>
      {children}
    </GlassCard>
  )
}

// ── Toggle switch ─────────────────────────────────────────────
function Toggle({ on, onChange, accentColor }) {
  return (
    <button
      onClick={() => onChange(!on)}
      style={{
        width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
        background: on ? accentColor : 'rgba(255,255,255,0.15)',
        position: 'relative', transition: 'background 0.25s', flexShrink: 0,
        padding: 0,
      }}
      role="switch"
      aria-checked={on}
    >
      <motion.div
        animate={{ x: on ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{
          width: 20, height: 20, borderRadius: '50%',
          background: '#fff', position: 'absolute', top: 2,
          boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
        }}
      />
    </button>
  )
}

// ── Row layout helper ─────────────────────────────────────────
function Row({ label, sub, right, theme }) {
  const tc = theme?.textColor ?? '#fff'
  const tm = theme?.textMuted ?? 'rgba(255,255,255,0.5)'
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0.6rem 0',
    }}>
      <div>
        <div style={{ color: tc, fontSize: '0.9rem' }}>{label}</div>
        {sub && <div style={{ color: tm, fontSize: '0.75rem', marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Settings Page
// ─────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const navigate  = useNavigate()
  const { user, profile, updateProfile, signOut } = useAuth()
  const { locations, removeLocation, setPrimary }  = useLocations()
  const { weather, unit } = useWeather()
  const theme = useTheme(weather)

  const tc = theme.textColor
  const tm = theme.textMuted
  const ac = theme.accentColor
  const cb = theme.cardBg
  const cd = theme.cardBorder

  // ── Local state ───────────────────────────────────────────
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '')
  const [nameLoading, setNameLoading] = useState(false)
  const [nameSaved,   setNameSaved]   = useState(false)
  const [nameError,   setNameError]   = useState('')

  const [unitLoading, setUnitLoading] = useState(false)
  const [isFahrenheit, setIsFahrenheit] = useState((profile?.temp_unit ?? 'C') === 'F')

  const [deletingId,  setDeletingId]  = useState(null)
  const [logoutConfirm, setLogoutConfirm] = useState(false)
  const [loggingOut, setLoggingOut]   = useState(false)

  // ── Save display name ─────────────────────────────────────
  const saveName = async () => {
    if (!displayName.trim()) { setNameError('Name cannot be empty.'); return }
    setNameLoading(true); setNameError('')
    const result = await updateProfile({ display_name: displayName.trim() })
    setNameLoading(false)
    if (!result.success) { setNameError(result.error); return }
    setNameSaved(true)
    setTimeout(() => setNameSaved(false), 2000)
  }

  // ── Toggle temperature unit ───────────────────────────────
  const toggleUnit = async (val) => {
    setIsFahrenheit(val)
    setUnitLoading(true)
    await updateProfile({ temp_unit: val ? 'F' : 'C' })
    setUnitLoading(false)
  }

  // ── Delete saved city ─────────────────────────────────────
  const handleDeleteCity = async (id) => {
    setDeletingId(id)
    await removeLocation(id)
    setDeletingId(null)
  }

  // ── Logout ────────────────────────────────────────────────
  const handleLogout = async () => {
    setLoggingOut(true)
    await signOut()
    navigate('/auth', { replace: true })
  }

  return (
    <AnimatedBackground theme={theme}>
      <div style={{
        minHeight: '100vh', maxWidth: 480,
        margin: '0 auto', padding: '1.5rem 1rem 4rem',
        fontFamily: "'DM Sans', sans-serif",
      }}>

        {/* ── Header ─────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.75rem' }}>
          <motion.button
            onClick={() => navigate('/dashboard')}
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
            style={{
              background: 'rgba(255,255,255,0.1)', border: 'none',
              borderRadius: 10, padding: '7px 8px',
              cursor: 'pointer', color: tc, display: 'flex',
            }}
          >
            <ArrowLeft size={16} />
          </motion.button>
          <span style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: '1.4rem', fontWeight: 400, color: tc,
          }}>
            Settings
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>

          {/* ── Account ──────────────────────────────────── */}
          <Section title="Account" theme={theme} delay={0.05}>
            {/* Email (read-only) */}
            <Row
              theme={theme}
              label="Email"
              sub={user?.email}
              right={
                <div style={{
                  fontSize: '0.72rem', background: 'rgba(255,255,255,0.08)',
                  border: `1px solid ${cd}`, borderRadius: 8,
                  padding: '3px 10px', color: tm,
                }}>
                  Verified
                </div>
              }
            />

            <div style={{ height: 1, background: cd, margin: '0.25rem 0' }} />

            {/* Display name */}
            <div style={{ paddingTop: '0.6rem' }}>
              <div style={{ color: tc, fontSize: '0.9rem', marginBottom: 8 }}>
                Display name
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={displayName}
                  onChange={e => { setDisplayName(e.target.value); setNameError(''); setNameSaved(false) }}
                  onKeyDown={e => e.key === 'Enter' && saveName()}
                  placeholder="Your name"
                  style={{
                    flex: 1, background: 'rgba(255,255,255,0.07)',
                    border: `1px solid ${nameError ? 'rgba(242,144,144,0.5)' : cd}`,
                    borderRadius: 10, padding: '9px 12px',
                    color: tc, fontSize: '0.9rem',
                    fontFamily: "'DM Sans', sans-serif", outline: 'none',
                  }}
                />
                <motion.button
                  onClick={saveName}
                  disabled={nameLoading || nameSaved}
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  style={{
                    background: nameSaved ? 'rgba(90,181,110,0.25)' : `${ac}22`,
                    border: `1px solid ${nameSaved ? 'rgba(90,181,110,0.4)' : `${ac}44`}`,
                    borderRadius: 10, padding: '9px 16px',
                    cursor: 'pointer', color: nameSaved ? '#5ab56e' : ac,
                    fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem',
                    display: 'flex', alignItems: 'center', gap: 6,
                    transition: 'all 0.2s', whiteSpace: 'nowrap',
                  }}
                >
                  {nameLoading ? <Loader2 size={14} style={{ animation: 'spin .7s linear infinite' }} /> :
                   nameSaved   ? <><Check size={14} /> Saved</> : 'Save'}
                </motion.button>
              </div>
              <AnimatePresence>
                {nameError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    style={{ color: '#f29090', fontSize: '0.78rem', marginTop: 6, display: 'flex', gap: 5, alignItems: 'center' }}
                  >
                    <AlertTriangle size={12} />{nameError}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Section>

          {/* ── Preferences ──────────────────────────────── */}
          <Section title="Preferences" theme={theme} delay={0.1}>
            <Row
              theme={theme}
              label="Temperature unit"
              sub={isFahrenheit ? 'Showing °F — Fahrenheit' : 'Showing °C — Celsius'}
              right={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.8rem', color: !isFahrenheit ? tc : tm, transition: 'color .2s' }}>°C</span>
                  <Toggle on={isFahrenheit} onChange={toggleUnit} accentColor={ac} />
                  <span style={{ fontSize: '0.8rem', color: isFahrenheit ? tc : tm, transition: 'color .2s' }}>°F</span>
                  {unitLoading && <Loader2 size={13} style={{ color: tm, animation: 'spin .7s linear infinite' }} />}
                </div>
              }
            />
          </Section>

          {/* ── Saved Cities ─────────────────────────────── */}
          <Section title={`Saved Cities (${locations.length})`} theme={theme} delay={0.15}>
            {locations.length === 0 && (
              <div style={{ color: tm, fontSize: '0.85rem', textAlign: 'center', padding: '0.75rem 0' }}>
                No cities saved yet. Add one from the dashboard.
              </div>
            )}
            {locations.map((loc, i) => (
              <div key={loc.id}>
                {i > 0 && <div style={{ height: 1, background: cd }} />}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '0.65rem 0',
                }}>
                  <MapPin size={14} style={{ color: tm, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      color: tc, fontSize: '0.88rem', fontWeight: 500,
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                      {loc.city_name}
                      {loc.is_primary && (
                        <Star size={11} style={{ color: ac, fill: ac }} />
                      )}
                    </div>
                    <div style={{ color: tm, fontSize: '0.72rem' }}>
                      {loc.country_code} · {loc.lat.toFixed(2)}°, {loc.lon.toFixed(2)}°
                    </div>
                  </div>

                  {/* Set primary */}
                  {!loc.is_primary && (
                    <motion.button
                      onClick={() => setPrimary(loc.id)}
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      title="Set as primary"
                      style={{
                        background: 'none', border: `1px solid ${cd}`,
                        borderRadius: 7, padding: '4px 9px',
                        cursor: 'pointer', color: tm,
                        fontSize: '0.68rem', fontFamily: "'DM Sans', sans-serif",
                        transition: 'all 0.2s', whiteSpace: 'nowrap',
                      }}
                    >
                      Set primary
                    </motion.button>
                  )}

                  {/* Delete */}
                  <motion.button
                    onClick={() => handleDeleteCity(loc.id)}
                    disabled={deletingId === loc.id}
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    style={{
                      background: 'none', border: 'none',
                      cursor: 'pointer', color: tm,
                      display: 'flex', padding: 5, borderRadius: 7,
                      opacity: deletingId === loc.id ? 0.4 : 1,
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#f29090'}
                    onMouseLeave={e => e.currentTarget.style.color = tm}
                  >
                    {deletingId === loc.id
                      ? <Loader2 size={14} style={{ animation: 'spin .7s linear infinite' }} />
                      : <Trash2 size={14} />
                    }
                  </motion.button>
                </div>
              </div>
            ))}
          </Section>

          {/* ── About ────────────────────────────────────── */}
          <Section title="About" theme={theme} delay={0.2}>
            <Row theme={theme} label="App" sub="Nimbus Weather" right={
              <span style={{ color: tm, fontSize: '0.8rem' }}>v1.0.0</span>
            } />
            <div style={{ height: 1, background: cd, margin: '0.25rem 0' }} />
            <Row theme={theme} label="Data source" sub="OpenWeatherMap API" right={null} />
            <div style={{ height: 1, background: cd, margin: '0.25rem 0' }} />
            <Row theme={theme} label="Backend" sub="Supabase (PostgreSQL)" right={null} />
          </Section>

          {/* ── Sign out ─────────────────────────────────── */}
          <GlassCard theme={theme} style={{ padding: '1.25rem' }} delay={0.25}>
            {!logoutConfirm ? (
              <motion.button
                onClick={() => setLogoutConfirm(true)}
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 8,
                  background: 'none',
                  border: `1px solid rgba(242,144,144,0.3)`,
                  borderRadius: 12, padding: '11px',
                  cursor: 'pointer', color: '#f29090',
                  fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(242,144,144,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <LogOut size={16} />
                Sign out
              </motion.button>
            ) : (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
                >
                  <div style={{ color: tc, fontSize: '0.88rem', textAlign: 'center' }}>
                    Sign out of Nimbus?
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => setLogoutConfirm(false)}
                      style={{
                        flex: 1, background: 'rgba(255,255,255,0.08)',
                        border: `1px solid ${cd}`, borderRadius: 10,
                        padding: '9px', cursor: 'pointer', color: tm,
                        fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem',
                      }}
                    >
                      Cancel
                    </button>
                    <motion.button
                      onClick={handleLogout}
                      disabled={loggingOut}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      style={{
                        flex: 1, background: 'rgba(242,144,144,0.15)',
                        border: '1px solid rgba(242,144,144,0.35)',
                        borderRadius: 10, padding: '9px',
                        cursor: 'pointer', color: '#f29090',
                        fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      }}
                    >
                      {loggingOut
                        ? <Loader2 size={14} style={{ animation: 'spin .7s linear infinite' }} />
                        : <><LogOut size={14} /> Sign out</>
                      }
                    </motion.button>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </GlassCard>

        </div>{/* end column */}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </AnimatedBackground>
  )
}
