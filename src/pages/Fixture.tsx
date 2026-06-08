import { useMemo, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Layout } from '../components/layout/Layout'
import { Header } from '../components/layout/Header'
import { MatchCard } from '../components/ui/MatchCard'
import { PageLoader } from '../components/ui/LoadingSpinner'
import { formatMatchDate, groupMatchesByDate } from '../utils/dates'
import { buildFixture, buildPredictionMap } from '../utils/fixtureAdapter'
import { loadPicks } from '../utils/picksStore'
import type { Match } from '../types'

type TabType = 'todos' | 'sinpronos' | 'argentina'

export function Fixture() {
  const { profile } = useAuth()
  const userId = profile?.id ?? 'anon'
  const [tab, setTab] = useState<TabType>('todos')
  const loading = false

  const picks = useMemo(() => loadPicks(userId), [userId])
  const matches = useMemo(() => buildFixture(picks), [picks])
  const predMap = useMemo(() => buildPredictionMap(picks), [picks])

  const filtered = matches.filter(m => {
    if (tab === 'argentina') return m.is_argentina
    if (tab === 'sinpronos') return !predMap.has(m.id)
    return true
  })

  const grouped = groupMatchesByDate(filtered)

  const tabs = [
    { key: 'todos', label: 'TODOS' },
    { key: 'sinpronos', label: 'SIN PRODE' },
    { key: 'argentina', label: '🇦🇷 ARG' },
  ] as { key: TabType; label: string }[]

  return (
    <Layout>
      <Header title="FIXTURE" />

      {/* Tabs */}
      <div
        className="flex gap-1.5 px-4 py-3"
        style={{ borderBottom: '1px solid #1A3050' }}
      >
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
            style={{
              background: tab === t.key ? 'rgba(116,172,223,0.15)' : 'transparent',
              color: tab === t.key ? '#74ACDF' : '#3D5A7A',
              border: tab === t.key ? '1px solid rgba(116,172,223,0.3)' : '1px solid #1A3050',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="px-4 pt-4 pb-4">
        {loading ? <PageLoader /> : filtered.length === 0 ? (
          <div className="text-center py-16" style={{ color: '#3D5A7A' }}>
            <div className="text-4xl mb-3 opacity-30">🏟️</div>
            <p className="text-xs uppercase tracking-widest font-semibold">
              {tab === 'sinpronos' ? '¡TODOS LOS PRONÓSTICOS CARGADOS!' : 'SIN PARTIDOS'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Array.from(grouped.entries()).map(([, dayMatches]) => (
              <section key={dayMatches[0].match_date}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-px flex-1" style={{ background: '#1A3050' }} />
                  <span
                    className="text-[9px] font-black uppercase tracking-[0.2em]"
                    style={{ color: '#3D5A7A' }}
                  >
                    {formatMatchDate(dayMatches[0].match_date)}
                  </span>
                  <div className="h-px flex-1" style={{ background: '#1A3050' }} />
                </div>
                <div className="space-y-2.5">
                  {(dayMatches as Match[]).map(m => (
                    <MatchCard key={m.id} match={m} prediction={predMap.get(m.id)} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
