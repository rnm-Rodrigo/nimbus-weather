import { useMemo } from 'react'
import { getTheme, getCloudTheme } from '../lib/themeMap'

/**
 * useTheme
 *
 * Given a normalised weather object (from fetchCurrentWeather),
 * returns the matching theme config that drives AnimatedBackground.
 *
 * Falls back to a sensible default while weather is loading.
 *
 * @param {object|null} weather  — normalised current weather
 * @returns {object}  theme config from themeMap
 */
export default function useTheme(weather) {
  return useMemo(() => {
    if (!weather) {
      // Loading state — use deep-space as neutral default
      return {
        id:          'loading',
        name:        'Loading',
        gradient:    'linear-gradient(160deg, #0a0818 0%, #0e1535 40%, #1a1060 100%)',
        cardBg:      'rgba(255,255,255,0.05)',
        cardBorder:  'rgba(255,255,255,0.08)',
        accentColor: '#ffd84a',
        textColor:   '#e8e4ff',
        textMuted:   'rgba(232,228,255,0.40)',
        overlay:     'stars',
        particleColor: 'rgba(255,255,255,0.6)',
      }
    }

    // Derive local hour from city's UTC offset
    const localMs   = Date.now() + (weather.timezone ?? 0) * 1000
    const localDate = new Date(localMs)
    const localHour = localDate.getUTCHours()

    const code = weather.weatherId ?? 800

    // Cloud codes (801–804) need special handling
    if (code > 800) return getCloudTheme(code, localHour)

    return getTheme(code, localHour)
  }, [weather])
}
