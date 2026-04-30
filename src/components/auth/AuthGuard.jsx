import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function AuthGuard({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  console.log('AuthGuard state:', { isAuthenticated, loading })

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
        color: 'white',
        fontFamily: 'sans-serif',
        gap: '1rem',
      }}>
        <div className="auth-guard-spinner" />
        <p style={{ opacity: 0.5, fontSize: '0.8rem' }}>loading: {String(loading)} | auth: {String(isAuthenticated)}</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  return children
}