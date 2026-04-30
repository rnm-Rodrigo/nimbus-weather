import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  || 'https://rretrfzcahqcsnxqnxpk.supabase.co'
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZXRyZnpjYWhxY3NueHFueHBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1MTQ3NjYsImV4cCI6MjA5MzA5MDc2Nn0.FfbeNqFqIbL7dSJSTMs5BqMb89nxQ_Y5hUGB_iYOXt4'

export const supabase = createClient(supabaseUrl, supabaseAnon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
