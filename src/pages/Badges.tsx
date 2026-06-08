import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Layout } from '../components/layout/Layout'
import { Header } from '../components/layout/Header'
import { PageLoader } from '../components/ui/LoadingSpinner'
import type { Badge, UserBadge } from '../types'
import { Trophy, Lock } from 'lucide-react'

export function Badges() {
  const { profile } = useAuth()
  const [badges, setBadges] = useState<Badge[]>([])
  const [earned, setEarned] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    loadBadges()
  }, [profile])

  async function loadBadges() {
    const [badgesRes, earnedRes] = await Promise.all([
      supabase.from('badges').select('*').order('id'),
      supabase.from('user_badges').select('*').eq('user_id', profile!.id),
    ])

    setBadges((badgesRes.data ?? []) as Badge[])
    setEarned(new Set(((earnedRes.data ?? []) as UserBadge[]).map(ub => ub.badge_id)))
    setLoading(false)
  }

  const earnedBadges = badges.filter(b => earned.has(b.id))
  const lockedBadges = badges.filter(b => !earned.has(b.id))

  return (
    <Layout>
      <Header title="Insignias" />

      <div className="px-4 pt-4">
        {/* Progress */}
        <div className="bg-gradient-to-r from-[#003F7F] to-[#74ACDF] rounded-2xl p-4 text-white mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold">Tu progreso</p>
            <p className="text-sm font-bold">{earnedBadges.length} / {badges.length}</p>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2.5">
            <div
              className="bg-amber-400 h-2.5 rounded-full transition-all"
              style={{ width: `${badges.length > 0 ? (earnedBadges.length / badges.length) * 100 : 0}%` }}
            />
          </div>
          <p className="text-xs text-white/70 mt-2">
            {badges.length - earnedBadges.length} insignias por desbloquear
          </p>
        </div>

        {loading ? (
          <PageLoader />
        ) : (
          <>
            {earnedBadges.length > 0 && (
              <section className="mb-6">
                <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Trophy size={16} className="text-amber-400" />
                  Desbloqueadas ({earnedBadges.length})
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {earnedBadges.map(badge => (
                    <BadgeCard key={badge.id} badge={badge} earned />
                  ))}
                </div>
              </section>
            )}

            {lockedBadges.length > 0 && (
              <section>
                <h2 className="font-bold text-gray-500 mb-3 flex items-center gap-2">
                  <Lock size={16} />
                  Por desbloquear ({lockedBadges.length})
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {lockedBadges.map(badge => (
                    <BadgeCard key={badge.id} badge={badge} earned={false} />
                  ))}
                </div>
              </section>
            )}

            {badges.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Trophy size={40} className="mx-auto mb-3 opacity-40" />
                <p className="font-medium">Próximamente</p>
                <p className="text-sm">Las insignias se agregarán durante el torneo</p>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}

function BadgeCard({ badge, earned }: { badge: Badge; earned: boolean }) {
  return (
    <div
      className={`rounded-2xl border p-4 text-center transition-all ${
        earned
          ? 'bg-white border-amber-200 shadow-sm'
          : 'bg-gray-50 border-gray-100 opacity-60'
      }`}
    >
      <div
        className={`text-4xl mb-2 ${!earned ? 'grayscale opacity-40' : ''}`}
        style={!earned ? { filter: 'grayscale(1)' } : undefined}
      >
        {badge.icon}
      </div>
      <p className={`text-sm font-bold mb-1 ${earned ? 'text-gray-900' : 'text-gray-400'}`}>
        {badge.name}
      </p>
      <p className={`text-xs leading-relaxed ${earned ? 'text-gray-500' : 'text-gray-400'}`}>
        {badge.description}
      </p>
      {earned && (
        <div className="mt-2 inline-flex items-center gap-1 bg-amber-50 text-amber-600 text-xs px-2 py-0.5 rounded-full font-semibold">
          ✓ Obtenida
        </div>
      )}
    </div>
  )
}
