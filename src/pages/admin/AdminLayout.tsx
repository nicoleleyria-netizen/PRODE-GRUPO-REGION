import type { ReactNode } from 'react'
import { NavLink, Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { LayoutDashboard, Edit3, Bell, ChevronLeft } from 'lucide-react'

const adminNav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/resultados', label: 'Resultados', icon: Edit3 },
  { to: '/admin/notificaciones', label: 'Notificaciones', icon: Bell },
]

export function AdminLayout({ children }: { children: ReactNode }) {
  const { profile } = useAuth()

  if (profile && profile.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin top bar */}
      <div className="bg-[#003F7F] text-white px-4 py-3 flex items-center gap-3">
        <NavLink to="/" className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10">
          <ChevronLeft size={18} />
        </NavLink>
        <div>
          <p className="text-xs text-white/60 leading-none">Grupo Región</p>
          <p className="font-bold text-sm">Panel Admin</p>
        </div>
      </div>

      {/* Admin sub-nav */}
      <div className="bg-white border-b border-gray-100 px-4">
        <div className="flex gap-0.5 overflow-x-auto">
          {adminNav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-[#003F7F] text-[#003F7F]'
                    : 'border-transparent text-gray-500'
                }`
              }
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 py-4">
        {children}
      </main>
    </div>
  )
}
