import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const LocationContext = createContext(null)

export function LocationProvider({ children }) {
  const { user } = useAuth()

  const [locations, setLocations] = useState([])   // saved cities array
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)

  // ── Fetch all saved locations for the logged-in user ──────
  const fetchLocations = useCallback(async () => {
    if (!user) { setLocations([]); return }
    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from('saved_locations')
      .select('*')
      .eq('user_id', user.id)
      .order('display_order', { ascending: true })
      .order('created_at',    { ascending: true })

    setLoading(false)
    if (error) { setError(error.message); return }
    setLocations(data ?? [])
  }, [user])

  // Load on mount / user change
  useEffect(() => { fetchLocations() }, [fetchLocations])

  // ── Add a city ────────────────────────────────────────────
  const addLocation = useCallback(async (city) => {
    if (!user) return { success: false, error: 'Not authenticated' }

    // Prevent duplicates (same lat/lon rounded to 2dp)
    const isDupe = locations.some(l =>
      Math.abs(l.lat - city.lat) < 0.01 &&
      Math.abs(l.lon - city.lon) < 0.01
    )
    if (isDupe) return { success: false, error: 'City already saved.' }

    const newLocation = {
      user_id:       user.id,
      city_name:     city.name,
      country_code:  city.countryCode,
      lat:           city.lat,
      lon:           city.lon,
      owm_city_id:   city.owmCityId ?? null,
      display_order: locations.length,  // append to end
      is_primary:    locations.length === 0, // first city = primary
    }

    const { data, error } = await supabase
      .from('saved_locations')
      .insert(newLocation)
      .select()
      .single()

    if (error) return { success: false, error: error.message }

    setLocations(prev => [...prev, data])
    return { success: true, data }
  }, [user, locations])

  // ── Remove a city ─────────────────────────────────────────
  const removeLocation = useCallback(async (locationId) => {
    if (!user) return { success: false, error: 'Not authenticated' }

    const { error } = await supabase
      .from('saved_locations')
      .delete()
      .eq('id', locationId)
      .eq('user_id', user.id) // extra safety

    if (error) return { success: false, error: error.message }

    setLocations(prev => {
      const filtered = prev.filter(l => l.id !== locationId)
      // If we removed the primary, promote the next one
      if (filtered.length > 0 && !filtered.some(l => l.is_primary)) {
        filtered[0] = { ...filtered[0], is_primary: true }
        supabase.from('saved_locations').update({ is_primary: true }).eq('id', filtered[0].id)
      }
      return filtered
    })

    return { success: true }
  }, [user])

  // ── Reorder (drag or arrow) ───────────────────────────────
  const reorderLocations = useCallback(async (reordered) => {
    // Optimistic update
    setLocations(reordered)

    // Persist new display_order values
    const updates = reordered.map((loc, i) =>
      supabase.from('saved_locations')
        .update({ display_order: i })
        .eq('id', loc.id)
        .eq('user_id', user.id)
    )
    await Promise.all(updates)
  }, [user])

  // ── Set primary city ──────────────────────────────────────
  const setPrimary = useCallback(async (locationId) => {
    if (!user) return

    // Clear all primaries then set new one
    await supabase.from('saved_locations')
      .update({ is_primary: false })
      .eq('user_id', user.id)

    await supabase.from('saved_locations')
      .update({ is_primary: true })
      .eq('id', locationId)

    setLocations(prev => prev.map(l => ({
      ...l,
      is_primary: l.id === locationId,
    })))
  }, [user])

  const value = {
    locations,
    loading,
    error,
    addLocation,
    removeLocation,
    reorderLocations,
    setPrimary,
    refresh: fetchLocations,
  }

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  )
}

export function useLocations() {
  const ctx = useContext(LocationContext)
  if (!ctx) throw new Error('useLocations must be used inside <LocationProvider>')
  return ctx
}
