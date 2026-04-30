import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { fetchCurrentWeather, fetchForecast } from '../api/weather'
import { useAuth } from './AuthContext'

const WeatherContext = createContext(null)

const POLL_INTERVAL_MS = 10 * 60 * 1000 // refresh every 10 minutes

export function WeatherProvider({ children }) {
  const { profile } = useAuth()
  const unit = profile?.temp_unit ?? 'C'

  // Active location (set by LocationContext / carousel)
  const [activeLocation, setActiveLocation] = useState(null)

  // Weather data
  const [weather,  setWeather]  = useState(null)
  const [forecast, setForecast] = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)

  const pollRef = useRef(null)

  // ── Core fetch ─────────────────────────────────────────────
  const loadWeather = useCallback(async (loc, u = unit) => {
    if (!loc) return
    setLoading(true)
    setError(null)

    try {
      const [curr, fore] = await Promise.all([
        fetchCurrentWeather(loc.lat, loc.lon, u),
        fetchForecast(loc.lat, loc.lon, u),
      ])
      setWeather(curr)
      setForecast(fore)
    } catch (err) {
      console.error('Weather fetch error:', err)
      setError(err.message || 'Failed to fetch weather data.')
    } finally {
      setLoading(false)
    }
  }, [unit])

  // ── Auto-refresh on location change ───────────────────────
  useEffect(() => {
    if (!activeLocation) return

    loadWeather(activeLocation)

    // Clear old poll
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(() => loadWeather(activeLocation), POLL_INTERVAL_MS)

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [activeLocation, loadWeather])

  // ── Re-fetch when unit changes (temp unit preference) ─────
  useEffect(() => {
    if (activeLocation) loadWeather(activeLocation, unit)
  }, [unit]) // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = useCallback(() => loadWeather(activeLocation), [activeLocation, loadWeather])

  const value = {
    weather,
    forecast,
    loading,
    error,
    activeLocation,
    setActiveLocation,
    refresh,
    unit,
  }

  return (
    <WeatherContext.Provider value={value}>
      {children}
    </WeatherContext.Provider>
  )
}

export function useWeather() {
  const ctx = useContext(WeatherContext)
  if (!ctx) throw new Error('useWeather must be used inside <WeatherProvider>')
  return ctx
}
