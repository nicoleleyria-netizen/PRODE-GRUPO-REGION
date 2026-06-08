import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { markOnboarded } from '../utils/picksStore'
import { ListChecks, Trophy, Target, ChevronRight } from 'lucide-react'

interface Step {
  emoji?: string
  icon?: typeof ListChecks
  avatar?: boolean
  title: string
  text: string
}

export function Onboarding({ onClose }: { onClose: () => void }) {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const userId = profile?.id ?? 'anon'
  const firstName = profile?.full_name?.split(' ')[0] ?? profile?.username ?? 'crack'

  const STEPS: Step[] = [
    {
      avatar: true,
      title: `¡Hola, ${firstName}!`,
      text: 'Bienvenido al Prode Mundial 2026 de Grupo Región. Te muestro en 30 segundos cómo se juega.',
    },
    {
      icon: ListChecks,
      title: 'Armá tu prode',
      text: 'Cargá los resultados de los 72 partidos de grupos. Con eso se arma sola la tabla de posiciones y se define quién avanza a la siguiente fase.',
    },
    {
      icon: Target,
      title: 'Seguí hasta el campeón',
      text: 'A medida que avanza el Mundial se habilitan las eliminatorias: dieciseisavos, octavos, cuartos, semis… hasta la gran final.',
    },
    {
      icon: Trophy,
      title: 'Sumá puntos y ganá',
      text: 'Ganador correcto +3 · Empate +2 · Resultado exacto +5 · Exacto de Argentina +7 · Goleador argentino +2. ¡Cuanto más fino, más puntos y más alto en el ranking!',
    },
  ]

  const isLast = step === STEPS.length - 1
  const current = STEPS[step]
  const Icon = current.icon

  function finish(goToProde: boolean) {
    markOnboarded(userId)
    onClose()
    if (goToProde) navigate('/mi-prode')
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col"
      style={{ background: 'radial-gradient(120% 80% at 50% 0%, #0D1F38 0%, #060C18 60%)' }}
    >
      {/* Skip */}
      <div className="flex justify-end px-4" style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 16px)' }}>
        <button onClick={() => finish(false)} className="text-[11px] font-bold uppercase tracking-widest py-2" style={{ color: '#3D5A7A' }}>
          Saltar
        </button>
      </div>

      {/* Contenido */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        {current.avatar && profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={firstName}
            className="w-32 h-32 rounded-full object-cover mb-8"
            style={{ border: '3px solid #74ACDF', boxShadow: '0 0 50px rgba(116,172,223,0.45)' }}
          />
        ) : (
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center mb-8"
            style={{ background: 'linear-gradient(135deg, #1A3F6F, #74ACDF)', boxShadow: '0 0 40px rgba(116,172,223,0.25)' }}
          >
            {Icon ? <Icon size={44} color="#fff" strokeWidth={2} /> : <span className="text-5xl">{current.emoji}</span>}
          </div>
        )}
        <h1 className="text-2xl font-black text-white leading-tight mb-3">{current.title}</h1>
        <p className="text-sm leading-relaxed max-w-xs" style={{ color: '#8AAAC8' }}>{current.text}</p>
      </div>

      {/* Indicadores + botón */}
      <div className="px-8 pb-10 space-y-6">
        <div className="flex justify-center gap-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full transition-all"
              style={{ width: i === step ? 24 : 8, background: i === step ? '#74ACDF' : '#1A3050' }}
            />
          ))}
        </div>

        {isLast ? (
          <div className="space-y-2.5">
            <button
              onClick={() => finish(true)}
              className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              style={{ background: 'linear-gradient(135deg, #1A3F6F, #74ACDF)', color: '#fff' }}
            >
              Armar mi prode <ChevronRight size={18} />
            </button>
            <button
              onClick={() => finish(false)}
              className="w-full py-3 rounded-2xl font-bold text-xs uppercase tracking-wider"
              style={{ color: '#5A7FA0' }}
            >
              Explorar primero
            </button>
          </div>
        ) : (
          <button
            onClick={() => setStep(step + 1)}
            className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            style={{ background: '#0D1929', color: '#74ACDF', border: '1px solid #1A3050' }}
          >
            Siguiente <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  )
}
