import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { Eye, EyeOff } from 'lucide-react'

export function Login() {
  const { user, signIn, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!loading && user) return <Navigate to="/" replace />

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const { error } = await signIn(email, password)
    if (error) {
      setError('Usuario o contraseña incorrectos')
      setSubmitting(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: '#060C18' }}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(116,172,223,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(116,172,223,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Top glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-72 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(116,172,223,0.12) 0%, transparent 70%)',
        }}
      />

      {/* Hero section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-6 relative">
        {/* Badge */}
        <div
          className="flex items-center gap-2 mb-8 px-4 py-2 rounded-full"
          style={{
            background: 'rgba(116,172,223,0.08)',
            border: '1px solid rgba(116,172,223,0.2)',
          }}
        >
          <span className="text-base">🏆</span>
          <span
            className="text-xs font-black uppercase tracking-[0.2em]"
            style={{ color: '#74ACDF' }}
          >
            GRUPO REGIÓN · LA SCALONETA
          </span>
        </div>

        {/* Main title */}
        <div className="text-center mb-2">
          <div
            className="text-[11px] font-black uppercase tracking-[0.3em] mb-3"
            style={{ color: '#3D5A7A' }}
          >
            MUNDIAL 2026
          </div>
          <h1
            className="text-5xl font-black uppercase tracking-tight leading-none"
            style={{
              background: 'linear-gradient(180deg, #FFFFFF 0%, #74ACDF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            PRODE
          </h1>
          <div
            className="text-xs font-semibold mt-2 tracking-widest uppercase"
            style={{ color: '#5A7FA0' }}
          >
            Pronosticá · Competí · Ganá
          </div>
        </div>

        {/* Flags strip */}
        <div className="flex gap-2 mt-8 opacity-50">
          {['🇦🇷', '🇧🇷', '🇫🇷', '🇩🇪', '🇪🇸', '🇵🇹', '🇺🇾', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🇺🇸', '🇲🇽'].map((f, i) => (
            <span key={i} className="text-xl">{f}</span>
          ))}
        </div>
      </div>

      {/* Login panel */}
      <div
        className="relative rounded-t-3xl px-6 pt-8 pb-10"
        style={{
          background: 'rgba(13,25,41,0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid #1A3050',
          borderBottom: 'none',
        }}
      >
        {/* Panel top accent */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-0.5 rounded-full"
          style={{ background: 'linear-gradient(90deg, transparent, #74ACDF, transparent)' }}
        />

        <div
          className="text-xs font-black uppercase tracking-[0.2em] mb-6"
          style={{ color: '#74ACDF' }}
        >
          — ACCESO —
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block text-[10px] font-black uppercase tracking-widest mb-2"
              style={{ color: '#3D5A7A' }}
            >
              Usuario
            </label>
            <input
              type="text"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all"
              style={{
                background: '#060C18',
                border: '1px solid #1A3050',
                color: '#FFFFFF',
              }}
              placeholder="tu usuario"
              required
              autoCapitalize="none"
              autoComplete="username"
              onFocus={e => (e.target.style.borderColor = '#74ACDF')}
              onBlur={e => (e.target.style.borderColor = '#1A3050')}
            />
          </div>

          <div>
            <label
              className="block text-[10px] font-black uppercase tracking-widest mb-2"
              style={{ color: '#3D5A7A' }}
            >
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-xl text-sm font-medium outline-none transition-all"
                style={{
                  background: '#060C18',
                  border: '1px solid #1A3050',
                  color: '#FFFFFF',
                }}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                onFocus={e => (e.target.style.borderColor = '#74ACDF')}
                onBlur={e => (e.target.style.borderColor = '#1A3050')}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                style={{ color: '#3D5A7A' }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div
              className="px-4 py-3 rounded-xl text-sm"
              style={{
                background: 'rgba(255,59,59,0.1)',
                border: '1px solid rgba(255,59,59,0.3)',
                color: '#FF6B6B',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !email || !password}
            className="w-full font-black py-4 rounded-xl uppercase tracking-widest text-sm transition-all
                       active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2 mt-2"
            style={{
              background: 'linear-gradient(135deg, #1A3F6F, #2A5FA0)',
              color: '#74ACDF',
              border: '1px solid rgba(116,172,223,0.3)',
              boxShadow: '0 0 20px rgba(116,172,223,0.1)',
            }}
          >
            {submitting ? <LoadingSpinner size="sm" /> : null}
            {submitting ? 'INGRESANDO...' : 'INGRESAR'}
          </button>
        </form>

        <div className="mt-5 pt-4" style={{ borderTop: '1px solid #1A3050' }}>
          <p
            className="text-center text-[10px] uppercase tracking-widest mb-3"
            style={{ color: '#3D5A7A' }}
          >
            ¿Querés ver el diseño?
          </p>
          <button
            type="button"
            onClick={() => { setEmail('demo@gruporegion.com'); setPassword('demo2026') }}
            className="w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98]"
            style={{
              background: 'rgba(116,172,223,0.06)',
              border: '1px solid #1A3050',
              color: '#5A7FA0',
            }}
          >
            🎮 &nbsp;Modo demo
          </button>
        </div>

        <p
          className="text-center text-[10px] mt-4 uppercase tracking-widest"
          style={{ color: '#1A3050' }}
        >
          Si no tenés usuario, contactá al administrador
        </p>
      </div>
    </div>
  )
}
