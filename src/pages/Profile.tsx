import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Layout } from '../components/layout/Layout'
import { Header } from '../components/layout/Header'
import { PageLoader } from '../components/ui/LoadingSpinner'
import type { Sector } from '../types'
import { LogOut, ChevronRight, Award, Settings, HelpCircle } from 'lucide-react'

export function Profile() {
  const { profile, isDemo, signOut, refreshProfile } = useAuth()
  const [sectors, setSectors] = useState<Sector[]>([])
  const [editing, setEditing] = useState(false)
  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [sector, setSector] = useState(profile?.sector ?? '')
  const [saving, setSaving] = useState(false)
  const [rankInfo, setRankInfo] = useState<{ total_points: number; rank: number } | null>(null)

  useEffect(() => {
    loadSectors()
    if (profile) {
      setFullName(profile.full_name ?? '')
      setPhone(profile.phone ?? '')
      setSector(profile.sector ?? '')
    }
    if (profile && !isDemo) {
      supabase.from('rankings').select('total_points, rank').eq('id', profile.id).single()
        .then(({ data }) => { if (data) setRankInfo(data as { total_points: number; rank: number }) })
    }
  }, [profile, isDemo])

  async function loadSectors() {
    const { data } = await supabase.from('sectors').select('*').order('name')
    setSectors((data ?? []) as Sector[])
  }

  async function saveProfile() {
    if (!profile) return
    setSaving(true)
    await supabase
      .from('profiles')
      .update({ full_name: fullName, phone, sector, updated_at: new Date().toISOString() })
      .eq('id', profile.id)
    await refreshProfile()
    setSaving(false)
    setEditing(false)
  }

  if (!profile) return <Layout><PageLoader /></Layout>

  const initial = (profile.full_name ?? profile.username)?.[0]?.toUpperCase() ?? '?'

  return (
    <Layout>
      <Header title="Mi Perfil" />

      <div className="px-4 pt-4 space-y-4">
        {/* Tarjeta de perfil */}
        <div
          className="relative rounded-3xl overflow-hidden p-5"
          style={{ background: 'linear-gradient(135deg, #0D2847 0%, #0A1929 70%)', border: '1px solid rgba(116,172,223,0.35)' }}
        >
          {/* Franjas tipo bandera (sutil) */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: 0.1,
              background: 'linear-gradient(115deg, transparent 52%, #74ACDF 52%, #74ACDF 60%, #FFFFFF 60%, #FFFFFF 68%, #74ACDF 68%, #74ACDF 76%)',
            }}
          />
          {/* Brillo superior */}
          <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, transparent, #74ACDF, transparent)' }} />

          <div className="relative flex items-center gap-4">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name ?? profile.username}
                className="w-20 h-20 rounded-full object-cover flex-shrink-0"
                style={{ border: '3px solid #74ACDF', boxShadow: '0 0 28px rgba(116,172,223,0.55)' }}
              />
            ) : (
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black flex-shrink-0 text-white"
                style={{ background: 'linear-gradient(135deg, #1A3F6F, #74ACDF)', boxShadow: '0 0 28px rgba(116,172,223,0.45)' }}
              >
                {initial}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-2xl font-black text-white leading-none truncate">{profile.full_name ?? profile.username}</p>
              <p className="text-xs mt-1 font-semibold" style={{ color: '#74ACDF' }}>@{profile.username}</p>

              {/* Pill puntos + puesto */}
              <div
                className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1 rounded-full"
                style={{ background: 'rgba(116,172,223,0.12)', border: '1px solid rgba(116,172,223,0.3)' }}
              >
                <span style={{ color: '#F5B700' }}>★</span>
                <span className="text-xs font-black text-white">{rankInfo?.total_points ?? 0} PTS</span>
                <span style={{ color: '#3D5A7A' }}>·</span>
                <span className="text-xs font-bold" style={{ color: '#74ACDF' }}>
                  PUESTO {rankInfo ? `#${rankInfo.rank}` : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Tagline */}
          <p className="relative mt-3.5 text-sm" style={{ color: '#8AAAC8', fontStyle: 'italic' }}>
            Vamos Argentina 🇦🇷
          </p>

          {/* Chips */}
          {(profile.sector || profile.role === 'admin') && (
            <div className="relative flex gap-1.5 mt-3">
              {profile.sector && (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full" style={{ background: 'rgba(116,172,223,0.12)', color: '#74ACDF' }}>
                  {profile.sector}
                </span>
              )}
              {profile.role === 'admin' && (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full" style={{ background: 'rgba(245,183,0,0.15)', color: '#F5B700' }}>
                  ADMIN
                </span>
              )}
            </div>
          )}
        </div>

        {/* Edit form */}
        {editing ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
            <h2 className="font-bold text-gray-900 mb-1">Editar perfil</h2>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nombre completo</label>
              <input
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#74ACDF] text-sm"
                placeholder="Tu nombre completo"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Teléfono (para notificaciones)</label>
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#74ACDF] text-sm"
                placeholder="+54 9 ..."
                type="tel"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Sector</label>
              <select
                value={sector}
                onChange={e => setSector(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#74ACDF] text-sm bg-white"
              >
                <option value="">Sin sector</option>
                {sectors.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setEditing(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={saveProfile}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-[#003F7F] text-white text-sm font-bold disabled:opacity-60"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <ProfileRow
              label="Nombre completo"
              value={profile.full_name ?? 'Sin configurar'}
              onClick={() => setEditing(true)}
            />
            <ProfileRow
              label="Teléfono"
              value={profile.phone ?? 'Sin configurar'}
              onClick={() => setEditing(true)}
            />
            <ProfileRow
              label="Sector"
              value={profile.sector ?? 'Sin configurar'}
              onClick={() => setEditing(true)}
            />
            <button
              onClick={() => setEditing(true)}
              className="w-full px-4 py-3 text-sm font-semibold text-[#003F7F] text-center active:bg-gray-50"
            >
              Editar perfil
            </button>
          </div>
        )}

        {/* Menu items */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
          {profile.role === 'admin' && (
            <MenuLink
              icon={<Settings size={18} className="text-gray-500" />}
              label="Panel de administración"
              to="/admin"
            />
          )}
          <MenuLink
            icon={<Award size={18} className="text-amber-500" />}
            label="Mis insignias"
            to="/insignias"
          />
          <MenuLink
            icon={<HelpCircle size={18} className="text-blue-500" />}
            label="Sistema de puntos"
          />
        </div>

        {/* Sign out */}
        <button
          onClick={signOut}
          className="w-full bg-white border border-red-100 text-red-500 font-bold py-3.5 rounded-2xl
                     flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>

        <p className="text-center text-xs text-gray-400 pb-2">
          Prode Mundial 2026 · Grupo Región
        </p>
      </div>
    </Layout>
  )
}

function ProfileRow({ label, value, onClick }: { label: string; value: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-4 py-3 active:bg-gray-50"
    >
      <div className="text-left">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-semibold text-gray-800 mt-0.5">{value}</p>
      </div>
      <ChevronRight size={16} className="text-gray-300" />
    </button>
  )
}

function MenuLink({ icon, label, to }: { icon: React.ReactNode; label: string; to?: string }) {
  const navigate = to ? () => window.location.assign(to) : undefined

  return (
    <button
      onClick={navigate}
      className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-gray-50 text-left"
    >
      {icon}
      <span className="flex-1 text-sm font-medium text-gray-700">{label}</span>
      <ChevronRight size={16} className="text-gray-300" />
    </button>
  )
}
