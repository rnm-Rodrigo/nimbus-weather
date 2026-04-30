import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/**
 * AuthGuard
 * Wraps protected routes. While session is resolving it shows a minimal
 * fullscreen loader. Once resolved:
 *   - authenticated  → renders children
 *   - unauthenticated → redirects to /auth, preserving the intended destination
 */
export default function AuthGuard({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      }}>
        <div className="auth-guard-spinner" />
      </div>
    )
  }

  if (!isAuthenticated) {
    // Save attempted URL so we can redirect back after login
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  return children
}
