// ─────────────────────────────────────────────────────────────
// OpenWeatherMap API — current weather + 5-day forecast
// Docs: https://openweathermap.org/api/one-call-3
// ─────────────────────────────────────────────────────────────

const BASE     = 'https://api.openweathermap.org/data/2.5'
const GEO_BASE = 'https://api.openweathermap.org/geo/1.0'
const API_KEY  = import.meta.env.VITE_OWM_API_KEY

function unitParam(unit) {
  // OWM: 'metric' = Celsius, 'imperial' = Fahrenheit
  return unit === 'F' ? 'imperial' : 'metric'
}

// ── Helpers ────────────────────────────────────────────────
async function owmFetch(url) {
  const res = await fetch(url)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `OWM error ${res.status}`)
  }
  return res.json()
}

// ── 1. Current weather by lat/lon ──────────────────────────
export async function fetchCurrentWeather(lat, lon, unit = 'C') {
  const url = `${BASE}/weather?lat=${lat}&lon=${lon}&units=${unitParam(unit)}&appid=${API_KEY}`
  const data = await owmFetch(url)

  return normalizeCurrentWeather(data, unit)
}

// ── 2. 5-day / 3-hour forecast by lat/lon ─────────────────
export async function fetchForecast(lat, lon, unit = 'C') {
  const url = `${BASE}/forecast?lat=${lat}&lon=${lon}&units=${unitParam(unit)}&cnt=40&appid=${API_KEY}`
  const data = await owmFetch(url)

  return normalizeForecast(data, unit)
}

// ── 3. Geocoding — city name search ───────────────────────
export async function searchCities(query, limit = 5) {
  if (!query || query.length < 2) return []
  const url = `${GEO_BASE}/direct?q=${encodeURIComponent(query)}&limit=${limit}&appid=${API_KEY}`
  const data = await owmFetch(url)

  return data.map(city => ({
    name:        city.name,
    state:       city.state || '',
    countryCode: city.country,
    lat:         city.lat,
    lon:         city.lon,
    displayName: [city.name, city.state, city.country].filter(Boolean).join(', '),
  }))
}

// ── 4. Reverse geocoding — lat/lon → city name ────────────
export async function reverseGeocode(lat, lon) {
  const url = `${GEO_BASE}/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`
  const [city] = await owmFetch(url)
  if (!city) return null
  return {
    name:        city.name,
    countryCode: city.country,
    lat,
    lon,
    displayName: [city.name, city.country].filter(Boolean).join(', '),
  }
}

// ─────────────────────────────────────────────────────────────
// Normalizers — shape raw OWM data into clean app objects
// ─────────────────────────────────────────────────────────────

function normalizeCurrentWeather(d, unit) {
  const tempUnit = unit === 'F' ? '°F' : '°C'
  const windUnit = unit === 'F' ? 'mph' : 'm/s'

  // Heat index (feels like) is provided directly by OWM as "feels_like"
  const heatIndex = computeHeatIndex(d.main.temp, d.main.humidity, unit)

  return {
    // Identity
    cityName:    d.name,
    countryCode: d.sys.country,
    owmCityId:   d.id,
    lat:         d.coord.lat,
    lon:         d.coord.lon,

    // Core
    temp:        Math.round(d.main.temp),
    feelsLike:   Math.round(d.main.feels_like),
    heatIndex:   heatIndex !== null ? Math.round(heatIndex) : null,
    tempMin:     Math.round(d.main.temp_min),
    tempMax:     Math.round(d.main.temp_max),
    tempUnit,

    // Atmosphere
    humidity:    d.main.humidity,        // %
    pressure:    d.main.pressure,        // hPa
    visibility:  d.visibility ?? null,   // metres
    dewPoint:    computeDewPoint(d.main.temp, d.main.humidity),

    // Wind
    windSpeed:   d.wind?.speed ?? 0,
    windDeg:     d.wind?.deg  ?? 0,
    windGust:    d.wind?.gust ?? null,
    windUnit,

    // Clouds & UV
    cloudiness:  d.clouds?.all ?? 0,     // %

    // Condition
    weatherId:   d.weather[0].id,
    weatherMain: d.weather[0].main,
    description: d.weather[0].description,
    icon:        d.weather[0].icon,

    // Time
    sunrise:     d.sys.sunrise * 1000,   // ms
    sunset:      d.sys.sunset  * 1000,   // ms
    timezone:    d.timezone,             // UTC offset seconds
    localTime:   Date.now() + d.timezone * 1000,

    // Meta
    fetchedAt:   Date.now(),
    unit,
  }
}

function normalizeForecast(data, unit) {
  const tempUnit = unit === 'F' ? '°F' : '°C'

  // OWM returns 3-hour slots; group into days
  const hourly = data.list.map(item => ({
    dt:          item.dt * 1000,
    temp:        Math.round(item.main.temp),
    feelsLike:   Math.round(item.main.feels_like),
    humidity:    item.main.humidity,
    weatherId:   item.weather[0].id,
    description: item.weather[0].description,
    icon:        item.weather[0].icon,
    windSpeed:   item.wind?.speed ?? 0,
    pop:         Math.round((item.pop ?? 0) * 100), // probability of precipitation %
    tempUnit,
  }))

  // Daily summary: one entry per calendar day (local timezone)
  const dailyMap = {}
  data.list.forEach(item => {
    const d   = new Date((item.dt + data.city.timezone) * 1000)
    const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`
    if (!dailyMap[key]) {
      dailyMap[key] = {
        dt:          item.dt * 1000,
        temps:       [],
        humidity:    [],
        pop:         [],
        weatherId:   item.weather[0].id,
        icon:        item.weather[0].icon,
        description: item.weather[0].description,
        tempUnit,
      }
    }
    dailyMap[key].temps.push(item.main.temp)
    dailyMap[key].humidity.push(item.main.humidity)
    dailyMap[key].pop.push(item.pop ?? 0)
  })

  const daily = Object.values(dailyMap).map(d => ({
    dt:          d.dt,
    tempMin:     Math.round(Math.min(...d.temps)),
    tempMax:     Math.round(Math.max(...d.temps)),
    humidity:    Math.round(d.humidity.reduce((a, b) => a + b, 0) / d.humidity.length),
    pop:         Math.round(Math.max(...d.pop) * 100),
    weatherId:   d.weatherId,
    icon:        d.icon,
    description: d.description,
    tempUnit,
  }))

  return { hourly, daily, city: data.city }
}

// ─────────────────────────────────────────────────────────────
// Derived calculations
// ─────────────────────────────────────────────────────────────

/**
 * Rothfusz heat index formula (NOAA).
 * Only meaningful above 27°C (80°F) and humidity ≥ 40%.
 * Returns null when conditions don't warrant it.
 */
export function computeHeatIndex(tempC, humidity, unit = 'C') {
  const T = unit === 'F' ? tempC : (tempC * 9) / 5 + 32 // work in °F
  const R = humidity

  if (T < 80 || R < 40) return null

  let HI =
    -42.379 +
    2.04901523 * T +
    10.14333127 * R -
    0.22475541 * T * R -
    0.00683783 * T * T -
    0.05481717 * R * R +
    0.00122874 * T * T * R +
    0.00085282 * T * R * R -
    0.00000199 * T * T * R * R

  // Adjustments
  if (R < 13 && T >= 80 && T <= 112) {
    HI -= ((13 - R) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17)
  } else if (R > 85 && T >= 80 && T <= 87) {
    HI += ((R - 85) / 10) * ((87 - T) / 5)
  }

  return unit === 'C' ? ((HI - 32) * 5) / 9 : HI
}

/**
 * Magnus formula for dew point. Returns °C always.
 */
export function computeDewPoint(tempC, humidity) {
  const a = 17.27
  const b = 237.7
  const alpha = (a * tempC) / (b + tempC) + Math.log(humidity / 100)
  return Math.round((b * alpha) / (a - alpha))
}

/**
 * Beaufort wind scale label
 */
export function windBeaufort(mps) {
  if (mps < 0.3)  return { scale: 0, label: 'Calm' }
  if (mps < 1.6)  return { scale: 1, label: 'Light air' }
  if (mps < 3.4)  return { scale: 2, label: 'Light breeze' }
  if (mps < 5.5)  return { scale: 3, label: 'Gentle breeze' }
  if (mps < 8.0)  return { scale: 4, label: 'Moderate breeze' }
  if (mps < 10.8) return { scale: 5, label: 'Fresh breeze' }
  if (mps < 13.9) return { scale: 6, label: 'Strong breeze' }
  if (mps < 17.2) return { scale: 7, label: 'Near gale' }
  if (mps < 20.8) return { scale: 8, label: 'Gale' }
  if (mps < 24.5) return { scale: 9, label: 'Strong gale' }
  if (mps < 28.5) return { scale: 10, label: 'Storm' }
  if (mps < 32.7) return { scale: 11, label: 'Violent storm' }
  return             { scale: 12, label: 'Hurricane' }
}

/**
 * Cardinal compass direction from degrees
 */
export function windDirection(deg) {
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW']
  return dirs[Math.round(deg / 22.5) % 16]
}
