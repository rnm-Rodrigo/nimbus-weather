import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// ─────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────
const AuthContext = createContext(null)

// ─────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true) // true until session is resolved
  const [error, setError]     = useState(null)

  // ── Fetch extended profile from public.profiles ───────────
  const fetchProfile = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Profile fetch error:', error.message)
      return null
    }
    return data
  }, [])

  // ── Initialise session on mount ───────────────────────────
  useEffect(() => {
    let mounted = true

    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!mounted) return

      if (session?.user) {
        setUser(session.user)
        const prof = await fetchProfile(session.user.id)
        if (mounted) setProfile(prof)
      }

      setLoading(false)
    }

    initSession()

    // ── Listen for auth state changes (login / logout / token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return

        if (session?.user) {
          setUser(session.user)
          const prof = await fetchProfile(session.user.id)
          if (mounted) setProfile(prof)
        } else {
          setUser(null)
          setProfile(null)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  // ── Sign Up ───────────────────────────────────────────────
  const signUp = useCallback(async ({ email, password, displayName }) => {
    setError(null)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName }, // picked up by the DB trigger
      },
    })

    if (error) {
      setError(error.message)
      return { success: false, error: error.message }
    }

    // Supabase may require email confirmation depending on project settings.
    // If session is null, the user needs to confirm their email.
    const needsConfirmation = !data.session
    return { success: true, needsConfirmation }
  }, [])

  // ── Sign In ───────────────────────────────────────────────
  const signIn = useCallback(async ({ email, password }) => {
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      return { success: false, error: error.message }
    }

    return { success: true }
  }, [])

  // ── Sign Out ──────────────────────────────────────────────
  const signOut = useCallback(async () => {
    setError(null)
    const { error } = await supabase.auth.signOut()
    if (error) {
      setError(error.message)
      return { success: false, error: error.message }
    }
    return { success: true }
  }, [])

  // ── Update Profile ────────────────────────────────────────
  const updateProfile = useCallback(async (updates) => {
    if (!user) return { success: false, error: 'Not authenticated' }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    setProfile(data)
    return { success: true, data }
  }, [user])

  // ── Clear auth errors ─────────────────────────────────────
  const clearError = useCallback(() => setError(null), [])

  const value = {
    user,
    profile,
    loading,
    error,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signOut,
    updateProfile,
    clearError,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// ─────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
