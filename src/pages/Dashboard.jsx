import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, Settings, Plus, MapPin, AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { useAuth }      from '../context/AuthContext'
import { useWeather }   from '../context/WeatherContext'
import { useLocations } from '../context/LocationContext'
import useTheme         from '../hooks/useTheme'

import AnimatedBackground  from '../components/ui/AnimatedBackground'
import WeatherCard         from '../components/dashboard/WeatherCard'
import ForecastStrip       from '../components/dashboard/ForecastStrip'
import LocationCarousel    from '../components/locations/LocationCarousel'
import CitySearch          from '../components/locations/CitySearch'

export default function Dashboard() {
  const navigate = useNavigate()
  const { profile, signOut }  = useAuth()
  const { locations, loading: locLoading } = useLocations()
  const {
    weather, forecast, loading, error,
    activeLocation, setActiveLocation, refresh,
  } = useWeather()
  const theme = useTheme(weather)

  const [showSearch, setShowSearch] = useState(false)

  useEffect(() => {
    if (locLoading) return
    if (locations.length === 0) {
      setActiveLocation(null)
      return
    }
    if (!activeLocation) {
      const primary = locations.find(l => l.is_primary) ?? locations[0]
      setActiveLocation({
        name:        primary.city_name,
        countryCode: primary.country_code,
        lat:         primary.lat,
        lon:         primary.lon,
      })
    }
  }, [locations, locLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCarouselSelect = (loc) => {
    setActiveLocation({
      name:        loc.city_name,
      countryCode: loc.country_code,
      lat:         loc.lat,
      lon:         loc.lon,
    })
  }

  const handleCityAdded = (loc) => {
    setActiveLocation({
      name:        loc.city_name,
      countryCode: loc.country_code,
      lat:         loc.lat,
      lon:         loc.lon,
    })
  }

  const tc = theme.textColor
  const tm = theme.textMuted
  const ac = theme.accentColor

  return (
    <AnimatedBackground theme={theme}>
      <div style={{
        minHeight: '100vh', maxWidth: 480,
        margin: '0 auto', padding: '1.5rem 1rem 3rem',
        fontFamily: "'DM Sans', sans-serif",
      }}>

        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
          <span style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '1.3rem', color: tc }}>
            Nimbus
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <motion.button onClick={() => setShowSearch(true)} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
              style={{ background: `${ac}22`, border: `1px solid ${ac}44`, borderRadius: 10, padding: '6px 12px', cursor: 'pointer', color: ac, display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', fontFamily: "'DM Sans', sans-serif" }}>
              <Plus size={14} /> Add city
            </motion.button>
            <motion.button onClick={refresh} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} disabled={loading}
              style={{ background: 'rgba(255,255,255,0.10)', border: 'none', borderRadius: 10, padding: '6px 8px', cursor: 'pointer', color: tc, display: 'flex' }}>
              <motion.div animate={loading ? { rotate: 360 } : {}} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                <RefreshCw size={15} />
              </motion.div>
            </motion.button>
            <motion.button onClick={() => navigate('/settings')} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
              style={{ background: 'rgba(255,255,255,0.10)', border: 'none', borderRadius: 10, padding: '6px 8px', cursor: 'pointer', color: tc, display: 'flex' }}>
              <Settings size={15} />
            </motion.button>
          </div>
        </div>

        {/* Location carousel */}
        {locations.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <LocationCarousel theme={theme} activeLocation={activeLocation} onSelect={handleCarouselSelect} />
          </div>
        )}

        {/* Empty state */}
        {!locLoading && locations.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', padding: '2.5rem 1rem', background: 'rgba(255,255,255,0.05)', border: `1px solid ${theme.cardBorder}`, borderRadius: 20, marginBottom: '1rem' }}>
            <MapPin size={32} style={{ color: tm, margin: '0 auto 0.75rem' }} />
            <div style={{ color: tc, fontWeight: 500, marginBottom: 6 }}>No cities saved yet</div>
            <div style={{ color: tm, fontSize: '0.82rem', marginBottom: '1.2rem' }}>Add a city to see live weather data</div>
            <motion.button onClick={() => setShowSearch(true)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              style={{ background: ac, color: '#0a0810', border: 'none', borderRadius: 10, padding: '9px 20px', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: '0.88rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Plus size={15} /> Add your first city
            </motion.button>
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(224,82,82,0.15)', border: '1px solid rgba(224,82,82,0.3)', borderRadius: 12, padding: '10px 14px', marginBottom: '1rem', color: '#f29090', fontSize: '0.85rem' }}>
            <AlertTriangle size={15} />{error}
          </motion.div>
        )}

        {/* Skeleton */}
        {loading && !weather && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[220, 130].map((h, i) => (
              <div key={i} style={{ height: h, borderRadius: 20, background: 'rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        )}

        {/* Weather */}
        {weather && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <WeatherCard   weather={weather}   theme={theme} />
            <ForecastStrip forecast={forecast} theme={theme} />
          </div>
        )}

        {/* Footer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: tm }}>Hey, {profile?.display_name ?? 'there'} 👋</span>
          <button onClick={() => signOut()}
            style={{ background: 'none', border: `1px solid ${tm}`, borderRadius: 8, padding: '5px 12px', cursor: 'pointer', color: tm, fontSize: '0.75rem', fontFamily: "'DM Sans', sans-serif" }}>
            Sign out
          </button>
        </motion.div>
      </div>

      <AnimatePresence>
        {showSearch && (
          <CitySearch theme={theme} onClose={() => setShowSearch(false)} onSelect={handleCityAdded} />
        )}
      </AnimatePresence>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:1} }
        @keyframes spin   { to { transform: rotate(360deg) } }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { scrollbar-width: none; }
      `}</style>
    </AnimatedBackground>
  )
}
