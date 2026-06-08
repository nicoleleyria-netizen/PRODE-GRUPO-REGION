import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { AdminLayout } from './AdminLayout'
import type { AppNotification, Match, Profile } from '../../types'
import { formatMatchDate, formatMatchTime } from '../../utils/dates'
import { Bell, Send, Check, X, Plus, Users, Clock } from 'lucide-react'

export function AdminNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)

  const [form, setForm] = useState({
    match_id: '',
    message: '',
    scheduled_at: '',
    send_to_all: true,
    user_id: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const [notifRes, matchRes, userRes] = await Promise.all([
      supabase
        .from('notifications')
        .select('*, match:matches(*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)), profile:profiles(username, full_name)')
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('matches')
        .select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)')
        .eq('status', 'upcoming')
        .order('match_date', { ascending: true }),
      supabase.from('profiles').select('id, username, full_name, phone').order('username'),
    ])

    setNotifications((notifRes.data ?? []) as AppNotification[])
    setMatches((matchRes.data ?? []) as Match[])
    setUsers((userRes.data ?? []) as Profile[])
    setLoading(false)
  }

  async function createNotification() {
    setCreating(true)
    // selectedMatch used for message template - already used in onChange above

    const baseNotif = {
      match_id: form.match_id ? Number(form.match_id) : null,
      message: form.message,
      scheduled_at: form.scheduled_at || null,
      status: 'pending' as const,
      created_at: new Date().toISOString(),
    }

    if (form.send_to_all) {
      const toInsert = users
        .filter(u => u.phone)
        .map(u => ({ ...baseNotif, user_id: u.id, phone: u.phone }))

      if (toInsert.length > 0) {
        await supabase.from('notifications').insert(toInsert)
      }
    } else if (form.user_id) {
      const user = users.find(u => u.id === form.user_id)
      await supabase.from('notifications').insert({
        ...baseNotif,
        user_id: form.user_id,
        phone: user?.phone ?? null,
      })
    }

    setForm({ match_id: '', message: '', scheduled_at: '', send_to_all: true, user_id: '' })
    setShowCreate(false)
    setCreating(false)
    loadData()
  }

  const pendingCount = notifications.filter(n => n.status === 'pending').length

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">Notificaciones</h1>
        <button
          onClick={() => setShowCreate(v => !v)}
          className="flex items-center gap-1.5 bg-[#003F7F] text-white text-sm font-semibold px-3 py-2 rounded-xl"
        >
          <Plus size={15} />
          Nueva
        </button>
      </div>

      {/* WhatsApp info box */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💬</span>
          <div>
            <p className="font-bold text-green-900 text-sm">Integración WhatsApp (próximamente)</p>
            <p className="text-xs text-green-700 mt-1 leading-relaxed">
              Las notificaciones se enviarán via <strong>n8n + API Oficial de WhatsApp</strong>.
              Por ahora, gestioná los mensajes pendientes desde aquí.
              El sistema creará automáticamente recordatorios 2 horas antes de cada partido.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-amber-50 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-amber-700">{pendingCount}</div>
          <div className="text-xs text-amber-600">Pendientes</div>
        </div>
        <div className="bg-green-50 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-green-700">
            {notifications.filter(n => n.status === 'sent').length}
          </div>
          <div className="text-xs text-green-600">Enviadas</div>
        </div>
        <div className="bg-red-50 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-red-700">
            {notifications.filter(n => n.status === 'failed').length}
          </div>
          <div className="text-xs text-red-600">Fallidas</div>
        </div>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 space-y-3">
          <h2 className="font-bold text-gray-900">Nueva notificación</h2>

          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Partido (opcional)</label>
            <select
              value={form.match_id}
              onChange={e => {
                const m = matches.find(m => String(m.id) === e.target.value)
                setForm(f => ({
                  ...f,
                  match_id: e.target.value,
                  message: m
                    ? `⚽ Recordatorio: ${m.home_team?.name} vs ${m.away_team?.name} hoy a las ${formatMatchTime(m.match_date)}. ¡Cargá tu pronóstico!`
                    : f.message,
                }))
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#74ACDF]"
            >
              <option value="">Sin partido asociado</option>
              {matches.map(m => (
                <option key={m.id} value={m.id}>
                  {m.home_team?.short_name} vs {m.away_team?.short_name} · {formatMatchDate(m.match_date)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Mensaje</label>
            <textarea
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#74ACDF]"
              placeholder="Escribí el mensaje de WhatsApp..."
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Programar para (opcional)</label>
            <input
              type="datetime-local"
              value={form.scheduled_at}
              onChange={e => setForm(f => ({ ...f, scheduled_at: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#74ACDF]"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.send_to_all}
                onChange={e => setForm(f => ({ ...f, send_to_all: e.target.checked }))}
                className="w-4 h-4 accent-[#003F7F]"
              />
              <span className="text-sm text-gray-700 flex items-center gap-1">
                <Users size={14} />
                Enviar a todos
              </span>
            </label>
          </div>

          {!form.send_to_all && (
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Usuario específico</label>
              <select
                value={form.user_id}
                onChange={e => setForm(f => ({ ...f, user_id: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none"
              >
                <option value="">Seleccioná un usuario</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.full_name ?? u.username} ({u.phone ?? 'sin teléfono'})</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => setShowCreate(false)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600"
            >
              Cancelar
            </button>
            <button
              onClick={createNotification}
              disabled={!form.message || creating}
              className="flex-1 py-2.5 rounded-xl bg-[#003F7F] text-white text-sm font-bold disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <Bell size={15} />
              {creating ? 'Creando...' : 'Crear'}
            </button>
          </div>
        </div>
      )}

      {/* Notifications list */}
      {loading ? (
        <div className="text-center py-8 text-gray-400">Cargando...</div>
      ) : (
        <div className="space-y-2">
          {notifications.map(notif => (
            <NotifCard key={notif.id} notif={notif} onUpdated={loadData} />
          ))}
          {notifications.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <Bell size={32} className="mx-auto mb-2 opacity-40" />
              <p>No hay notificaciones aún</p>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  )
}

function NotifCard({ notif, onUpdated }: { notif: AppNotification; onUpdated: () => void }) {
  const statusConfig = {
    pending: { color: 'bg-amber-100 text-amber-700', icon: <Clock size={12} />, label: 'Pendiente' },
    sent: { color: 'bg-green-100 text-green-700', icon: <Check size={12} />, label: 'Enviada' },
    failed: { color: 'bg-red-100 text-red-700', icon: <X size={12} />, label: 'Fallida' },
  }

  const cfg = statusConfig[notif.status]

  async function markSent() {
    await supabase.from('notifications').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', notif.id)
    onUpdated()
  }

  async function deleteNotif() {
    await supabase.from('notifications').delete().eq('id', notif.id)
    onUpdated()
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3.5">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>
          {cfg.icon}
          {cfg.label}
        </span>
        <div className="flex gap-1">
          {notif.status === 'pending' && (
            <button
              onClick={markSent}
              className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-lg font-semibold flex items-center gap-0.5"
            >
              <Send size={10} />
              Marcar enviada
            </button>
          )}
          <button
            onClick={deleteNotif}
            className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-lg"
          >
            <X size={12} />
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-700 mb-2 leading-relaxed">{notif.message}</p>

      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400">
        {notif.phone && <span>📱 {notif.phone}</span>}
        {notif.match && (
          <span>
            ⚽ {(notif.match as Match).home_team?.short_name} vs {(notif.match as Match).away_team?.short_name}
          </span>
        )}
        {notif.scheduled_at && (
          <span className="flex items-center gap-0.5">
            <Clock size={10} />
            {new Date(notif.scheduled_at).toLocaleString('es-AR')}
          </span>
        )}
      </div>
    </div>
  )
}
