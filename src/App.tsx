import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Login } from './pages/Login'
import { Home } from './pages/Home'
import { Groups } from './pages/Groups'
import { MyProde } from './pages/MyProde'
import { Fixture } from './pages/Fixture'
import { MatchDetail } from './pages/MatchDetail'
import { Rankings } from './pages/Rankings'
import { Badges } from './pages/Badges'
import { Profile } from './pages/Profile'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { AdminResults } from './pages/admin/AdminResults'
import { AdminNotifications } from './pages/admin/AdminNotifications'
import { PageLoader } from './components/ui/LoadingSpinner'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><PageLoader /></div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/grupos" element={<ProtectedRoute><Groups /></ProtectedRoute>} />
      <Route path="/mi-prode" element={<ProtectedRoute><MyProde /></ProtectedRoute>} />
      <Route path="/fixture" element={<ProtectedRoute><Fixture /></ProtectedRoute>} />
      <Route path="/partido/:id" element={<ProtectedRoute><MatchDetail /></ProtectedRoute>} />
      <Route path="/ranking" element={<ProtectedRoute><Rankings /></ProtectedRoute>} />
      <Route path="/insignias" element={<ProtectedRoute><Badges /></ProtectedRoute>} />
      <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/resultados" element={<ProtectedRoute><AdminResults /></ProtectedRoute>} />
      <Route path="/admin/notificaciones" element={<ProtectedRoute><AdminNotifications /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
