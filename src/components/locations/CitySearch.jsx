import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, MapPin, Plus, Loader2, AlertCircle } from 'lucide-react'
import { searchCities } from '../../api/weather'
import { useLocations } from '../../context/LocationContext'

// ── Debounce ──────────────────────────────────────────────────
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export default function CitySearch({ theme, onClose, onSelect }) {
  const { addLocation, locations } = useLocations()

  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [added,   setAdded]   = useState(null) // id of just-added city

  const inputRef = useRef(null)
  const debouncedQuery = useDebounce(query, 380)

  // Auto-focus input
  useEffect(() => { inputRef.current?.focus() }, [])

  // Fetch results when debounced query changes
  useEffect(() => {
    if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
      setResults([]); setError(''); return
    }
    let cancelled = false
    const fetch = async () => {
      setLoading(true); setError('')
      try {
        const cities = await searchCities(debouncedQuery, 6)
        if (!cancelled) setResults(cities)
      } catch {
        if (!cancelled) setError('Search failed. Check your connection.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetch()
    return () => { cancelled = true }
  }, [debouncedQuery])

  const handleAdd = useCallback(async (city) => {
    setError('')
    const result = await addLocation(city)
    if (!result.success) {
      setError(result.error)
      return
    }
    setAdded(city.displayName)
    setTimeout(() => {
      onSelect?.(result.data)
      onClose()
    }, 800)
  }, [addLocation, onClose, onSelect])

  const isAlreadySaved = (city) =>
    locations.some(l =>
      Math.abs(l.lat - city.lat) < 0.01 &&
      Math.abs(l.lon - city.lon) < 0.01
    )

  const tc = theme?.textColor   ?? '#fff'
  const tm = theme?.textMuted   ?? 'rgba(255,255,255,0.55)'
  const cb = theme?.cardBg      ?? 'rgba(255,255,255,0.08)'
  const cd = theme?.cardBorder  ?? 'rgba(255,255,255,0.14)'
  const ac = theme?.accentColor ?? '#fff'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: '5vh', padding: '5vh 1rem 0',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: -24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0,   scale: 1 }}
        exit={{    opacity: 0, y: -12,  scale: 0.97 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        style={{
          width: '100%', maxWidth: 460,
          background: cb,
          border: `1px solid ${cd}`,
          borderRadius: 20,
          backdropFilter: 'blur(20px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
          overflow: 'hidden',
        }}
      >
        {/* Search input */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '14px 16px',
          borderBottom: `1px solid ${cd}`,
        }}>
          {loading
            ? <Loader2 size={18} style={{ color: tm, flexShrink: 0, animation: 'spin .7s linear infinite' }} />
            : <Search size={18} style={{ color: tm, flexShrink: 0 }} />
          }
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search city…"
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: tc, fontSize: '1rem', fontFamily: "'DM Sans', sans-serif",
            }}
            onKeyDown={e => e.key === 'Escape' && onClose()}
          />
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: tm, display: 'flex', padding: 2 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            display: 'flex', gap: 8, alignItems: 'center',
            padding: '10px 16px', background: 'rgba(224,82,82,0.12)',
            color: '#f29090', fontSize: '0.82rem',
          }}>
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        {/* Success flash */}
        <AnimatePresence>
          {added && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{   opacity: 0, height: 0 }}
              style={{
                padding: '10px 16px', background: 'rgba(90,181,110,0.15)',
                color: '#5ab56e', fontSize: '0.82rem', display: 'flex', gap: 8,
              }}
            >
              ✓ {added} added to your cities
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <div style={{ maxHeight: 320, overflowY: 'auto' }}>
          {results.length === 0 && !loading && query.length >= 2 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: tm, fontSize: '0.85rem' }}>
              No cities found for "{query}"
            </div>
          )}

          {results.length === 0 && !query && (
            <div style={{ padding: '1.5rem 1rem', color: tm, fontSize: '0.82rem' }}>
              {locations.length > 0 && (
                <>
                  <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem', color: tm }}>
                    Saved cities
                  </div>
                  {locations.map(l => (
                    <div key={l.id} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '8px 0', borderBottom: `1px solid ${cd}`,
                      color: tc, fontSize: '0.9rem',
                    }}>
                      <MapPin size={13} style={{ color: tm }} />
                      {l.city_name}, {l.country_code}
                      {l.is_primary && (
                        <span style={{ marginLeft: 'auto', fontSize: '0.68rem', color: ac, opacity: 0.7 }}>Primary</span>
                      )}
                    </div>
                  ))}
                </>
              )}
              {locations.length === 0 && (
                <p style={{ textAlign: 'center', marginTop: '1rem' }}>Type a city name to search</p>
              )}
            </div>
          )}

          {results.map((city, i) => {
            const saved = isAlreadySaved(city)
            return (
              <motion.div
                key={`${city.lat}-${city.lon}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px',
                  borderBottom: `1px solid ${cd}`,
                  cursor: saved ? 'default' : 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => !saved && (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                onClick={() => !saved && handleAdd(city)}
              >
                <MapPin size={15} style={{ color: tm, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: tc, fontSize: '0.9rem', fontWeight: 500 }}>
                    {city.name}
                  </div>
                  <div style={{ color: tm, fontSize: '0.75rem' }}>
                    {[city.state, city.countryCode].filter(Boolean).join(', ')}
                  </div>
                </div>
                {saved ? (
                  <span style={{ fontSize: '0.72rem', color: tm }}>Saved</span>
                ) : (
                  <Plus size={16} style={{ color: ac }} />
                )}
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </motion.div>
  )
}
