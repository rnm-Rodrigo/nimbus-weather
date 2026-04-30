import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider }     from './context/AuthContext'
import { WeatherProvider }  from './context/WeatherContext'
import { LocationProvider } from './context/LocationContext'
import AuthGuard    from './components/auth/AuthGuard'
import AuthPage     from './pages/AuthPage'
import Dashboard    from './pages/Dashboard'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LocationProvider>
          <WeatherProvider>
            <Routes>
              <Route path="/auth"      element={<AuthPage />} />
              <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
              <Route path="/settings"  element={<AuthGuard><SettingsPage /></AuthGuard>} />
              <Route path="*"          element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </WeatherProvider>
        </LocationProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
