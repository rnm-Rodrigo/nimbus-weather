import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react'

export default function LoginForm({ onSuccess, onSwitch }) {
  const { signIn } = useAuth()

  const [fields, setFields] = useState({ email: '', password: '' })
  const [showPass, setShowPass]   = useState(false)
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)

  const set = (key) => (e) => {
    setError('')
    setFields(prev => ({ ...prev, [key]: e.target.value }))
  }

  const validate = () => {
    if (!fields.email.trim()) return 'Email is required.'
    if (!/\S+@\S+\.\S+/.test(fields.email)) return 'Enter a valid email address.'
    if (!fields.password)    return 'Password is required.'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) { setError(validationError); return }

    setLoading(true)
    setError('')

    const result = await signIn({
      email:    fields.email.trim().toLowerCase(),
      password: fields.password,
    })

    setLoading(false)

    if (!result.success) {
      // Map Supabase error messages to friendlier copy
      const msg = result.error?.toLowerCase() ?? ''
      if (msg.includes('invalid login') || msg.includes('invalid credentials')) {
        setError('Incorrect email or password. Please try again.')
      } else if (msg.includes('email not confirmed')) {
        setError('Please confirm your email address before signing in.')
      } else {
        setError(result.error || 'Something went wrong. Please try again.')
      }
      return
    }

    onSuccess?.()
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="auth-form">
      <div className="auth-form-header">
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your weather dashboard</p>
      </div>

      {error && (
        <div className="auth-error" role="alert">
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}

      <div className="auth-field">
        <label htmlFor="login-email" className="auth-label">Email</label>
        <input
          id="login-email"
          type="email"
          className="auth-input"
          placeholder="you@example.com"
          value={fields.email}
          onChange={set('email')}
          autoComplete="email"
          autoFocus
          disabled={loading}
        />
      </div>

      <div className="auth-field">
        <label htmlFor="login-password" className="auth-label">Password</label>
        <div className="auth-input-wrap">
          <input
            id="login-password"
            type={showPass ? 'text' : 'password'}
            className="auth-input"
            placeholder="••••••••"
            value={fields.password}
            onChange={set('password')}
            autoComplete="current-password"
            disabled={loading}
          />
          <button
            type="button"
            className="auth-eye"
            onClick={() => setShowPass(v => !v)}
            aria-label={showPass ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        className="auth-submit"
        disabled={loading}
      >
        {loading ? (
          <span className="auth-spinner" />
        ) : (
          <>
            <LogIn size={16} />
            Sign in
          </>
        )}
      </button>

      <p className="auth-switch">
        Don't have an account?{' '}
        <button type="button" className="auth-link" onClick={onSwitch}>
          Create one
        </button>
      </p>
    </form>
  )
}
