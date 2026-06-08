import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Layout } from '../components/layout/Layout'
import { Header } from '../components/layout/Header'
import { PageLoader } from '../components/ui/LoadingSpinner'
import type { RankingRow } from '../types'

type TabType = 'general' | 'sector' | 'argentina'

const DEMO_RANKINGS: RankingRow[] = [
  { id: 'u1', username: 'mariela_c', full_name: 'Mariela Castro', sector: 'Comercial', avatar_url: null, total_points: 63, predictions_count: 15, exact_scores: 5, correct_outcomes: 9, rank: 1 },
  { id: 'demo-user-id', username: 'demo', full_name: 'Juan Demo', sector: 'Redacción', avatar_url: null, total_points: 47, predictions_count: 12, exact_scores: 3, correct_outcomes: 8, rank: 2 },
  { id: 'u3', username: 'pablo_r', full_name: 'Pablo Rodríguez', sector: 'Tecnología', avatar_url: null, total_points: 44, predictions_count: 14, exact_scores: 2, correct_outcomes: 7, rank: 3 },
  { id: 'u4', username: 'sofia_m', full_name: 'Sofía Martínez', sector: 'Marketing', avatar_url: null, total_points: 38, predictions_count: 11, exact_scores: 1, correct_outcomes: 6, rank: 4 },
  { id: 'u5', username: 'lucas_g', full_name: 'Lucas González', sector: 'Comercial', avatar_url: null, total_points: 35, predictions_count: 13, exact_scores: 2, correct_outcomes: 5, rank: 5 },
  { id: 'u6', username: 'ana_f', full_name: 'Ana Fernández', sector: 'Administración', avatar_url: null, total_points: 29, predictions_count: 10, exact_scores: 0, correct_outcomes: 5, rank: 6 },
  { id: 'u7', username: 'diego_v', full_name: 'Diego Vargas', sector: 'Redacción', avatar_url: null, total_points: 24, predictions_count: 9, exact_scores: 1, correct_outcomes: 4, rank: 7 },
  { id: 'u8', username: 'claudia_p', full_name: 'Claudia Pérez', sector: 'Marketing', avatar_url: null, total_points: 18, predictions_count: 8, exact_scores: 0, correct_outcomes: 3, rank: 8 },
]

export function Rankings() {
  const { profile, isDemo } = useAuth()
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState<TabType>((searchParams.get('tab') as TabType) ?? 'general')
  const [rankings, setRankings] = useState<RankingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [myRank, setMyRank] = useState<RankingRow | null>(null)

  useEffect(() => { loadRankings() }, [tab, isDemo])

  async function loadRankings() {
    setLoading(true)
    if (isDemo) {
      const rows = tab === 'sector' ? DEMO_RANKINGS.filter(r => r.sector === 'Redacción') : DEMO_RANKINGS
      setRankings(rows.map((r, i) => ({ ...r, rank: i + 1 })))
      setMyRank(DEMO_RANKINGS.find(r => r.id === 'demo-user-id') ?? null)
      setLoading(false)
      return
    }
    let query = supabase.from('rankings').select('*').order('rank', { ascending: true }).limit(50)
    if (tab === 'sector' && profile?.sector) query = query.eq('sector', profile.sector)
    else if (tab === 'argentina') query = supabase.from('argentina_rankings').select('*').order('rank', { ascending: true }).limit(50)
    const { data } = await query
    const rows = (data ?? []) as RankingRow[]
    setRankings(rows)
    if (profile) setMyRank(rows.find(r => r.id === profile.id) ?? null)
    setLoading(false)
  }

  const tabs = [
    { key: 'general', label: 'GENERAL' },
    { key: 'sector', label: 'MI SECTOR' },
    { key: 'argentina', label: '🇦🇷 ARG' },
  ] as { key: TabType; label: string }[]

  return (
    <Layout>
      <Header title="RANKING" />

      {/* Tabs */}
      <div
        className="flex gap-1 px-4 py-3"
        style={{ borderBottom: '1px solid #1A3050' }}
      >
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
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

      {/* My position */}
      {myRank && (
        <div
          className="mx-4 mt-4 rounded-2xl p-4 flex items-center gap-3 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0D1F38, #0A1929)',
            border: '1px solid rgba(116,172,223,0.35)',
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-0.5"
            style={{ background: 'linear-gradient(90deg, transparent, #74ACDF, transparent)' }}
          />
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
            style={{ background: 'rgba(116,172,223,0.15)', color: '#74ACDF' }}
          >
            #{myRank.rank}
          </div>
          <Avatar url={myRank.avatar_url} name={myRank.full_name ?? myRank.username} me />
          <div className="flex-1 min-w-0">
            <p className="font-black text-sm text-white truncate">{myRank.full_name ?? myRank.username}</p>
            <p className="text-xs mt-0.5" style={{ color: '#5A7FA0' }}>
              {myRank.predictions_count} pronósticos · {myRank.exact_scores} exactos
            </p>
          </div>
          <div>
            <div className="text-2xl font-black" style={{ color: '#F5B700' }}>{myRank.total_points}</div>
            <div className="text-[9px] font-black uppercase tracking-widest text-right" style={{ color: '#5A7FA0' }}>PTS</div>
          </div>
        </div>
      )}

      <div className="px-4 pt-3 space-y-2 pb-4">
        {loading ? <PageLoader /> : rankings.length === 0 ? (
          <div className="text-center py-12" style={{ color: '#3D5A7A' }}>
            <div className="text-4xl mb-3 opacity-30">🏆</div>
            <p className="text-xs uppercase tracking-widest font-semibold">Sin datos aún</p>
          </div>
        ) : rankings.map(row => (
          <RankCard key={row.id} row={row} isMe={row.id === profile?.id} />
        ))}
      </div>
    </Layout>
  )
}

function RankCard({ row, isMe }: { row: RankingRow; isMe: boolean }) {
  const medal = row.rank === 1 ? '🥇' : row.rank === 2 ? '🥈' : row.rank === 3 ? '🥉' : null
  const accentColor = row.rank === 1 ? '#F5B700' : row.rank === 2 ? '#9EB0C4' : row.rank === 3 ? '#CD7F32' : '#3D5A7A'

  return (
    <div
      className="rounded-xl flex items-center gap-3 px-3 py-3 transition-all"
      style={{
        background: isMe ? 'rgba(116,172,223,0.06)' : '#0D1929',
        border: isMe ? '1px solid rgba(116,172,223,0.25)' : '1px solid #1A3050',
      }}
    >
      {/* Rank */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black flex-shrink-0"
        style={{
          background: medal ? `${accentColor}18` : '#0A1422',
          color: medal ? accentColor : '#3D5A7A',
          border: `1px solid ${accentColor}30`,
        }}
      >
        {medal ?? row.rank}
      </div>

      {/* Avatar */}
      <Avatar url={row.avatar_url} name={row.full_name ?? row.username} me={isMe} />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-bold truncate"
          style={{ color: isMe ? '#FFFFFF' : '#8AAAC8' }}
        >
          {row.full_name ?? row.username}
          {isMe && <span className="ml-1 text-[10px]" style={{ color: '#74ACDF' }}>(vos)</span>}
        </p>
        {row.sector && (
          <p className="text-[10px] font-medium" style={{ color: '#3D5A7A' }}>{row.sector}</p>
        )}
      </div>

      {/* Points */}
      <div className="text-right flex-shrink-0">
        <div
          className="text-lg font-black"
          style={{ color: row.rank <= 3 ? accentColor : '#5A7FA0' }}
        >
          {row.total_points}
        </div>
        <div className="text-[9px] font-black uppercase tracking-wider" style={{ color: '#3D5A7A' }}>PTS</div>
      </div>
    </div>
  )
}

function Avatar({ url, name, me }: { url: string | null; name: string | null; me?: boolean }) {
  if (url) {
    return (
      <img
        src={url}
        alt={name ?? ''}
        className="w-9 h-9 rounded-full object-cover flex-shrink-0"
        style={{ border: me ? '1.5px solid #74ACDF' : '1px solid #1A3050' }}
      />
    )
  }
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0"
      style={{
        background: me ? 'linear-gradient(135deg, #1A3F6F, #74ACDF)' : 'linear-gradient(135deg, #1A3050, #0D1929)',
        color: me ? '#fff' : '#5A7FA0',
        border: '1px solid #1A3050',
      }}
    >
      {name?.[0]?.toUpperCase()}
    </div>
  )
}
