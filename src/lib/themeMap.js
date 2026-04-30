// ─────────────────────────────────────────────────────────────
// NIMBUS — DYNAMIC THEME MAP
//
// Maps OWM weather code groups (hundreds digit) + time-of-day slot
// to a complete theme configuration object consumed by useTheme.
//
// OWM code groups:
//   2xx = Thunderstorm   5xx = Rain       7xx = Atmosphere (fog/mist)
//   3xx = Drizzle        6xx = Snow       800 = Clear
//   4xx = (unused)                        80x = Clouds
//
// Time slots:
//   dawn  = 05:00–07:59
//   day   = 08:00–16:59
//   dusk  = 17:00–19:59
//   night = 20:00–04:59
// ─────────────────────────────────────────────────────────────

// Each theme config:
// {
//   id:            string   — unique identifier (used as Framer Motion key)
//   name:          string   — human label
//   gradient:      string   — CSS gradient for AnimatedBackground
//   cardBg:        string   — glass card background
//   cardBorder:    string   — glass card border
//   accentColor:   string   — primary accent (buttons, highlights)
//   textColor:     string   — primary text
//   textMuted:     string   — secondary text
//   overlay:       string   — optional animated overlay type ('rain'|'snow'|'stars'|'lightning'|'fog'|null)
//   particleColor: string   — overlay particle color
// }

const T = {
  // ── Clear ──────────────────────────────────────────────────
  clearDay: {
    id:          'clear-day',
    name:        'Clear Day',
    gradient:    'linear-gradient(160deg, #3ab5f5 0%, #1a85d6 40%, #0d5ca3 100%)',
    cardBg:      'rgba(255,255,255,0.12)',
    cardBorder:  'rgba(255,255,255,0.22)',
    accentColor: '#ffffff',
    textColor:   '#ffffff',
    textMuted:   'rgba(255,255,255,0.65)',
    overlay:     null,
    particleColor: null,
  },

  clearDawn: {
    id:          'clear-dawn',
    name:        'Dawn',
    gradient:    'linear-gradient(160deg, #fbb6a0 0%, #f47b5e 30%, #c74b6e 70%, #6b3fa0 100%)',
    cardBg:      'rgba(255,200,180,0.12)',
    cardBorder:  'rgba(255,200,180,0.22)',
    accentColor: '#ffd4a0',
    textColor:   '#fff5f0',
    textMuted:   'rgba(255,245,240,0.60)',
    overlay:     null,
    particleColor: null,
  },

  clearDusk: {
    id:          'golden-hour',
    name:        'Golden Hour',
    gradient:    'linear-gradient(160deg, #ffd07a 0%, #f47c2f 35%, #c0392b 70%, #6d2177 100%)',
    cardBg:      'rgba(255,200,100,0.10)',
    cardBorder:  'rgba(255,200,100,0.20)',
    accentColor: '#ffd07a',
    textColor:   '#fff8e8',
    textMuted:   'rgba(255,248,232,0.60)',
    overlay:     null,
    particleColor: null,
  },

  clearNight: {
    id:          'deep-space',
    name:        'Deep Space',
    gradient:    'linear-gradient(160deg, #0a0818 0%, #0e1535 40%, #1a1060 100%)',
    cardBg:      'rgba(255,255,255,0.05)',
    cardBorder:  'rgba(255,255,255,0.09)',
    accentColor: '#ffd84a',
    textColor:   '#e8e4ff',
    textMuted:   'rgba(232,228,255,0.45)',
    overlay:     'stars',
    particleColor: 'rgba(255,255,255,0.7)',
  },

  // ── Clouds ─────────────────────────────────────────────────
  cloudsDay: {
    id:          'overcast-day',
    name:        'Overcast',
    gradient:    'linear-gradient(160deg, #8fa8c8 0%, #6888aa 45%, #4a6888 100%)',
    cardBg:      'rgba(255,255,255,0.10)',
    cardBorder:  'rgba(255,255,255,0.16)',
    accentColor: '#d0e4f8',
    textColor:   '#f0f4f8',
    textMuted:   'rgba(240,244,248,0.55)',
    overlay:     null,
    particleColor: null,
  },

  cloudsNight: {
    id:          'overcast-night',
    name:        'Overcast Night',
    gradient:    'linear-gradient(160deg, #1a1f2e 0%, #252c3d 50%, #1a2035 100%)',
    cardBg:      'rgba(255,255,255,0.06)',
    cardBorder:  'rgba(255,255,255,0.10)',
    accentColor: '#a0b4cc',
    textColor:   '#d8e4f0',
    textMuted:   'rgba(216,228,240,0.45)',
    overlay:     null,
    particleColor: null,
  },

  // ── Rain / Drizzle ─────────────────────────────────────────
  rainDay: {
    id:          'rain-day',
    name:        'Rainy Day',
    gradient:    'linear-gradient(160deg, #3d5a73 0%, #2d4560 50%, #1e3050 100%)',
    cardBg:      'rgba(200,220,240,0.09)',
    cardBorder:  'rgba(180,210,240,0.15)',
    accentColor: '#7ec8e3',
    textColor:   '#e0f0ff',
    textMuted:   'rgba(224,240,255,0.50)',
    overlay:     'rain',
    particleColor: 'rgba(180,220,255,0.55)',
  },

  rainNight: {
    id:          'glassmorphism-rain',
    name:        'Glassmorphism Rain',
    gradient:    'linear-gradient(160deg, #0d1d2e 0%, #152535 50%, #0a1520 100%)',
    cardBg:      'rgba(140,190,230,0.07)',
    cardBorder:  'rgba(140,190,230,0.13)',
    accentColor: '#5aaed4',
    textColor:   '#c8e4f8',
    textMuted:   'rgba(200,228,248,0.45)',
    overlay:     'rain',
    particleColor: 'rgba(100,180,240,0.45)',
  },

  // ── Thunderstorm ───────────────────────────────────────────
  storm: {
    id:          'storm',
    name:        'Thunderstorm',
    gradient:    'linear-gradient(160deg, #1a1410 0%, #2d2218 40%, #1a1005 100%)',
    cardBg:      'rgba(255,180,60,0.06)',
    cardBorder:  'rgba(255,180,60,0.12)',
    accentColor: '#f5c842',
    textColor:   '#f8ead0',
    textMuted:   'rgba(248,234,208,0.45)',
    overlay:     'lightning',
    particleColor: 'rgba(255,220,80,0.8)',
  },

  // ── Snow ───────────────────────────────────────────────────
  snowDay: {
    id:          'snow-day',
    name:        'Snowfall',
    gradient:    'linear-gradient(160deg, #c8d8e8 0%, #a8c0d8 45%, #88a8c8 100%)',
    cardBg:      'rgba(255,255,255,0.20)',
    cardBorder:  'rgba(255,255,255,0.35)',
    accentColor: '#2d6aa0',
    textColor:   '#1a3a5c',
    textMuted:   'rgba(26,58,92,0.55)',
    overlay:     'snow',
    particleColor: 'rgba(255,255,255,0.85)',
  },

  snowNight: {
    id:          'snow-night',
    name:        'Winter Night',
    gradient:    'linear-gradient(160deg, #101824 0%, #182234 50%, #0e1620 100%)',
    cardBg:      'rgba(200,220,255,0.07)',
    cardBorder:  'rgba(200,220,255,0.13)',
    accentColor: '#a0c8f0',
    textColor:   '#d8eaff',
    textMuted:   'rgba(216,234,255,0.45)',
    overlay:     'snow',
    particleColor: 'rgba(220,235,255,0.70)',
  },

  // ── Atmosphere (fog, mist, haze, sand) ────────────────────
  fog: {
    id:          'fog-mist',
    name:        'Fog & Mist',
    gradient:    'linear-gradient(160deg, #b0bec8 0%, #8fa0ae 50%, #6e8090 100%)',
    cardBg:      'rgba(255,255,255,0.14)',
    cardBorder:  'rgba(255,255,255,0.20)',
    accentColor: '#2c4a60',
    textColor:   '#1c3040',
    textMuted:   'rgba(28,48,64,0.55)',
    overlay:     'fog',
    particleColor: 'rgba(255,255,255,0.30)',
  },

  // ── Fallback ───────────────────────────────────────────────
  default: {
    id:          'default',
    name:        'Default',
    gradient:    'linear-gradient(160deg, #1a2a4a 0%, #2a3a6a 100%)',
    cardBg:      'rgba(255,255,255,0.08)',
    cardBorder:  'rgba(255,255,255,0.13)',
    accentColor: '#7eb8f0',
    textColor:   '#e0eeff',
    textMuted:   'rgba(224,238,255,0.50)',
    overlay:     null,
    particleColor: null,
  },
}

// ─────────────────────────────────────────────────────────────
// Time of day resolver
// ─────────────────────────────────────────────────────────────
export function getTimeSlot(localHour) {
  if (localHour >= 5  && localHour < 8)  return 'dawn'
  if (localHour >= 8  && localHour < 17) return 'day'
  if (localHour >= 17 && localHour < 20) return 'dusk'
  return 'night'
}

// ─────────────────────────────────────────────────────────────
// Main resolver
// ─────────────────────────────────────────────────────────────
export function getTheme(weatherCode, localHour) {
  const slot  = getTimeSlot(localHour)
  const isDay = slot === 'dawn' || slot === 'day' || slot === 'dusk'
  const group = weatherCode === 800 ? 800 : Math.floor(weatherCode / 100) * 100

  switch (group) {
    case 800: // Clear sky
      if (slot === 'dawn')  return T.clearDawn
      if (slot === 'dusk')  return T.clearDusk
      if (slot === 'night') return T.clearNight
      return T.clearDay

    case 801:
    case 802:
    case 803:
    case 804:
    case 800: // won't reach but guard
      return isDay ? T.cloudsDay : T.cloudsNight

    case 200: // Thunderstorm
      return T.storm

    case 300: // Drizzle — treat as light rain
    case 500: // Rain
      return isDay ? T.rainDay : T.rainNight

    case 600: // Snow
      return isDay ? T.snowDay : T.snowNight

    case 700: // Atmosphere
      return T.fog

    default:
      return T.default
  }
}

// Cloud group helper (codes 801–804)
export function getCloudTheme(weatherCode, localHour) {
  if (weatherCode > 800) {
    const slot = getTimeSlot(localHour)
    const isDay = slot !== 'night'
    return isDay ? T.cloudsDay : T.cloudsNight
  }
  return getTheme(weatherCode, localHour)
}

export { T as THEMES }
