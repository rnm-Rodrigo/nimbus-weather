import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LoginForm  from '../components/auth/LoginForm'
import SignupForm from '../components/auth/SignupForm'

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const navigate = useNavigate()

  const handleSuccess = () => navigate('/dashboard', { replace: true })
  const toggle = () => setMode(m => m === 'login' ? 'signup' : 'login')

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-orb auth-orb-3" />
        <div className="auth-stars" />
      </div>

      <div className="auth-brand">
        <div className="auth-brand-icon">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="8" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
            <path d="M8 14 Q11 9 14 14 Q17 19 20 14" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            <circle cx="14" cy="6" r="1.5" fill="rgba(255,220,80,0.9)"/>
            <path d="M14 3V1M17.5 7l1.5-1.5M20 10.5h2M17.5 14.2l1.5 1.5M10.5 7L9 5.5M8 10.5H6" stroke="rgba(255,220,80,0.7)" strokeWidth="1" strokeLinecap="round"/>
          </svg>
        </div>
        <span className="auth-brand-name">Nimbus</span>
      </div>

      <div className="auth-card" key={mode}>
        {mode === 'login'
          ? <LoginForm  onSuccess={handleSuccess} onSwitch={toggle} />
          : <SignupForm onSuccess={handleSuccess} onSwitch={toggle} />
        }
      </div>

      <p className="auth-footer">
        Your weather. Your data. Always private.
      </p>
    </div>
  )
}
