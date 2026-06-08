import { NavLink } from 'react-router-dom'
import { Home, CalendarDays, ListChecks, Trophy, User } from 'lucide-react'

const navItems = [
  { to: '/', label: 'INICIO', icon: Home },
  { to: '/mi-prode', label: 'MI PRODE', icon: ListChecks },
  { to: '/fixture', label: 'PARTIDOS', icon: CalendarDays },
  { to: '/ranking', label: 'RANKING', icon: Trophy },
  { to: '/perfil', label: 'PERFIL', icon: User },
]

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto left-0 right-0"
      style={{
        background: 'rgba(6,12,24,0.97)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid #1A3050',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex justify-around items-center h-[4.25rem]">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className="flex flex-col items-center gap-0.5 py-2 px-2 min-w-0 relative"
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full"
                    style={{ background: '#74ACDF', boxShadow: '0 0 8px #74ACDF' }}
                  />
                )}
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  style={{ color: isActive ? '#74ACDF' : '#3D5A7A' }}
                />
                <span
                  className="text-[9px] font-black tracking-wider"
                  style={{ color: isActive ? '#74ACDF' : '#3D5A7A' }}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
