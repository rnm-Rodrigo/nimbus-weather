import { useState, useMemo } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react'

// ── Password strength ─────────────────────────────────────────
function getStrength(pw) {
  if (!pw) return { score: 0, label: '', color: '' }
  let score = 0
  if (pw.length >= 8)              score++
  if (pw.length >= 12)             score++
  if (/[A-Z]/.test(pw))           score++
  if (/[0-9]/.test(pw))           score++
  if (/[^A-Za-z0-9]/.test(pw))   score++

  const levels = [
    { label: '',        color: 'transparent' },
    { label: 'Weak',    color: '#e05252' },
    { label: 'Fair',    color: '#e0943a' },
    { label: 'Good',    color: '#d4c43a' },
    { label: 'Strong',  color: '#5ab56e' },
    { label: 'Great',   color: '#3aac8e' },
  ]
  return { score, ...levels[Math.min(score, 5)] }
}

export default function SignupForm({ onSuccess, onSwitch }) {
  const { signUp } = useAuth()

  const [fields, setFields] = useState({
    displayName: '',
    email:       '',
    password:    '',
    confirm:     '',
  })
  const [showPass, setShowPass]     = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)
  const [confirmed, setConfirmed]   = useState(false) // email confirmation needed

  const strength = useMemo(() => getStrength(fields.password), [fields.password])

  const set = (key) => (e) => {
    setError('')
    setFields(prev => ({ ...prev, [key]: e.target.value }))
  }

  const validate = () => {
    if (!fields.displayName.trim())  return 'Please enter your name.'
    if (!fields.email.trim())        return 'Email is required.'
    if (!/\S+@\S+\.\S+/.test(fields.email)) return 'Enter a valid email address.'
    if (!fields.password)            return 'Password is required.'
    if (fields.password.length < 8) return 'Password must be at least 8 characters.'
    if (strength.score < 2)          return 'Please choose a stronger password.'
    if (fields.password !== fields.confirm) return 'Passwords do not match.'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) { setError(validationError); return }

    setLoading(true)
    setError('')

    const result = await signUp({
      email:       fields.email.trim().toLowerCase(),
      password:    fields.password,
      displayName: fields.displayName.trim(),
    })

    setLoading(false)

    if (!result.success) {
      const msg = result.error?.toLowerCase() ?? ''
      if (msg.includes('already registered') || msg.includes('already exists')) {
        setError('An account with this email already exists. Try signing in.')
      } else {
        setError(result.error || 'Something went wrong. Please try again.')
      }
      return
    }

    if (result.needsConfirmation) {
      setConfirmed(true) // show confirmation message
    } else {
      onSuccess?.()
    }
  }

  // ── Email confirmation state ──────────────────────────────
  if (confirmed) {
    return (
      <div className="auth-form auth-confirm">
        <CheckCircle2 size={40} className="auth-confirm-icon" />
        <h2 className="auth-title" style={{ fontSize: '1.4rem' }}>Check your inbox</h2>
        <p className="auth-subtitle" style={{ textAlign: 'center' }}>
          We sent a confirmation link to <strong>{fields.email}</strong>.
          Click it to activate your account, then sign in.
        </p>
        <button className="auth-submit" style={{ marginTop: '1.5rem' }} onClick={onSwitch}>
          Go to sign in
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="auth-form">
      <div className="auth-form-header">
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Your personal weather dashboard awaits</p>
      </div>

      {error && (
        <div className="auth-error" role="alert">
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}

      <div className="auth-field">
        <label htmlFor="signup-name" className="auth-label">Name</label>
        <input
          id="signup-name"
          type="text"
          className="auth-input"
          placeholder="Your name"
          value={fields.displayName}
          onChange={set('displayName')}
          autoComplete="name"
          autoFocus
          disabled={loading}
        />
      </div>

      <div className="auth-field">
        <label htmlFor="signup-email" className="auth-label">Email</label>
        <input
          id="signup-email"
          type="email"
          className="auth-input"
          placeholder="you@example.com"
          value={fields.email}
          onChange={set('email')}
          autoComplete="email"
          disabled={loading}
        />
      </div>

      <div className="auth-field">
        <label htmlFor="signup-password" className="auth-label">Password</label>
        <div className="auth-input-wrap">
          <input
            id="signup-password"
            type={showPass ? 'text' : 'password'}
            className="auth-input"
            placeholder="Min. 8 characters"
            value={fields.password}
            onChange={set('password')}
            autoComplete="new-password"
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

        {/* Strength bar */}
        {fields.password && (
          <div className="auth-strength">
            <div className="auth-strength-bar">
              {[1, 2, 3, 4, 5].map(i => (
                <div
                  key={i}
                  className="auth-strength-seg"
                  style={{
                    background: i <= strength.score ? strength.color : 'rgba(255,255,255,0.12)',
                  }}
                />
              ))}
            </div>
            <span className="auth-strength-label" style={{ color: strength.color }}>
              {strength.label}
            </span>
          </div>
        )}
      </div>

      <div className="auth-field">
        <label htmlFor="signup-confirm" className="auth-label">Confirm password</label>
        <div className="auth-input-wrap">
          <input
            id="signup-confirm"
            type={showConfirm ? 'text' : 'password'}
            className="auth-input"
            placeholder="Repeat your password"
            value={fields.confirm}
            onChange={set('confirm')}
            autoComplete="new-password"
            disabled={loading}
          />
          <button
            type="button"
            className="auth-eye"
            onClick={() => setShowConfirm(v => !v)}
            aria-label={showConfirm ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <button type="submit" className="auth-submit" disabled={loading}>
        {loading ? (
          <span className="auth-spinner" />
        ) : (
          <>
            <UserPlus size={16} />
            Create account
          </>
        )}
      </button>

      <p className="auth-switch">
        Already have an account?{' '}
        <button type="button" className="auth-link" onClick={onSwitch}>
          Sign in
        </button>
      </p>
    </form>
  )
}
