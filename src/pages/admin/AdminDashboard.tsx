import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { AdminLayout } from './AdminLayout'
import { Users, CalendarDays, Target, Bell } from 'lucide-react'

interface Stats {
  totalUsers: number
  totalMatches: number
  totalPredictions: number
  pendingNotifications: number
  finishedMatches: number
  upcomingMatches: number
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalMatches: 0,
    totalPredictions: 0,
    pendingNotifications: 0,
    finishedMatches: 0,
    upcomingMatches: 0,
  })
  const [_loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    const [users, matches, preds, notifs] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('matches').select('id, status', { count: 'exact' }),
      supabase.from('predictions').select('id', { count: 'exact', head: true }),
      supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    ])

    const matchData = matches.data ?? []
    setStats({
      totalUsers: users.count ?? 0,
      totalMatches: matchData.length,
      totalPredictions: preds.count ?? 0,
      pendingNotifications: notifs.count ?? 0,
      finishedMatches: matchData.filter((m: { status: string }) => m.status === 'finished').length,
      upcomingMatches: matchData.filter((m: { status: string }) => m.status === 'upcoming').length,
    })
    setLoading(false)
  }

  return (
    <AdminLayout>
      <h1 className="text-xl font-bold text-gray-900 mb-4">Dashboard</h1>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard icon={<Users size={20} className="text-blue-500" />} label="Jugadores" value={stats.totalUsers} color="bg-blue-50" />
        <StatCard icon={<Target size={20} className="text-green-500" />} label="Pronósticos" value={stats.totalPredictions} color="bg-green-50" />
        <StatCard icon={<CalendarDays size={20} className="text-purple-500" />} label="Partidos totales" value={stats.totalMatches} color="bg-purple-50" />
        <StatCard icon={<Bell size={20} className="text-amber-500" />} label="Notif. pendientes" value={stats.pendingNotifications} color="bg-amber-50" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
        <h2 className="font-bold text-gray-900 mb-3">Estado del fixture</h2>
        <div className="space-y-2.5">
          <ProgressRow label="Finalizados" value={stats.finishedMatches} total={stats.totalMatches} color="bg-green-500" />
          <ProgressRow label="Próximos" value={stats.upcomingMatches} total={stats.totalMatches} color="bg-blue-500" />
          <ProgressRow label="En vivo" value={stats.totalMatches - stats.finishedMatches - stats.upcomingMatches} total={stats.totalMatches} color="bg-red-500" />
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <h3 className="font-bold text-amber-900 mb-2 text-sm">🔔 Recordatorio</h3>
        <p className="text-xs text-amber-700 leading-relaxed">
          Cargá los resultados de los partidos en la sección <strong>Resultados</strong> lo antes posible
          para que los puntos se calculen automáticamente.
        </p>
        <p className="text-xs text-amber-600 mt-2">
          Las notificaciones WhatsApp estarán disponibles en una próxima versión via n8n.
          Administrá los mensajes pendientes en <strong>Notificaciones</strong>.
        </p>
      </div>
    </AdminLayout>
  )
}

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode
  label: string
  value: number
  color: string
}) {
  return (
    <div className={`${color} rounded-2xl p-4`}>
      <div className="mb-2">{icon}</div>
      <div className="text-2xl font-extrabold text-gray-900">{value}</div>
      <div className="text-xs text-gray-600 font-medium mt-0.5">{label}</div>
    </div>
  )
}

function ProgressRow({ label, value, total, color }: {
  label: string; value: number; total: number; color: string
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>{label}</span>
        <span className="font-semibold">{value} ({pct}%)</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5">
        <div className={`${color} h-1.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
