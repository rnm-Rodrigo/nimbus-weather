import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const fetchProfile = useCallback(async (userId) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      return data ?? null
    } catch {
      return null
    }
  }, [])

  useEffect(() => {
    let mounted = true

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!mounted) return

        if (session?.user) {
          setUser(session.user)
          // Set loading false IMMEDIATELY — don't wait for profile
          setLoading(false)
          // Fetch profile in background
          fetchProfile(session.user.id).then(prof => {
            if (mounted) setProfile(prof)
          })
        } else {
          setLoading(false)
        }
      } catch {
        if (mounted) setLoading(false)
      }
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return
        if (session?.user) {
          setUser(session.user)
          setLoading(false)
          fetchProfile(session.user.id).then(prof => {
            if (mounted) setProfile(prof)
          })
        } else {
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  const signUp = useCallback(async ({ email, password, displayName }) => {
    setError(null)
    try {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { display_name: displayName } },
      })
      if (error) { setError(error.message); return { success: false, error: error.message } }
      return { success: true, needsConfirmation: !data.session }
    } catch (e) {
      setError(e.message)
      return { success: false, error: e.message }
    }
  }, [])

  const signIn = useCallback(async ({ email, password }) => {
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); return { success: false, error: error.message } }
      return { success: true }
    } catch (e) {
      setError(e.message)
      return { success: false, error: e.message }
    }
  }, [])

  const signOut = useCallback(async () => {
    setError(null)
    try {
      await supabase.auth.signOut()
    } catch {}
    setUser(null)
    setProfile(null)
    return { success: true }
  }, [])

  const updateProfile = useCallback(async (updates) => {
    if (!user) return { success: false, error: 'Not authenticated' }
    try {
      const { data, error } = await supabase
        .from('profiles').update(updates).eq('id', user.id).select().single()
      if (error) return { success: false, error: error.message }
      setProfile(data)
      return { success: true, data }
    } catch (e) {
      return { success: false, error: e.message }
    }
  }, [user])

  const clearError = useCallback(() => setError(null), [])

  const value = {
    user, profile, loading, error,
    isAuthenticated: !!user,
    signUp, signIn, signOut, updateProfile, clearError,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
