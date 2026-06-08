import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Layout } from '../components/layout/Layout'
import { MatchCard } from '../components/ui/MatchCard'
import { Onboarding } from '../components/Onboarding'
import { buildFixture, buildPredictionMap } from '../utils/fixtureAdapter'
import { loadPicks, hasOnboarded } from '../utils/picksStore'
import { resolveBracket } from '../utils/bracket'
import { GROUP_MATCHES, KNOCKOUT_MATCHES, TEAMS_BY_ID } from '../data/worldcup2026'
import { isMatchOpen } from '../utils/dates'
import { parseISO, isToday, isTomorrow } from 'date-fns'
import { ListChecks, ChevronRight } from 'lucide-react'

export function Home() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const userId = profile?.id ?? 'anon'
  const [showOnboarding, setShowOnboarding] = useState(() => !hasOnboarded(userId))

  const picks = useMemo(() => loadPicks(userId), [userId])
  const allMatches = useMemo(() => buildFixture(picks), [picks])
  const predMap = useMemo(() => buildPredictionMap(picks), [picks])

  const upcoming = useMemo(
    () => allMatches
      .filter(m => isMatchOpen(m.match_date))
      .sort((a, b) => parseISO(a.match_date).getTime() - parseISO(b.match_date).getTime()),
    [allMatches]
  )

  // Partidos de hoy y mañana; si no hay, los próximos 4
  const todayTomorrow = upcoming.filter(m => {
    const d = parseISO(m.match_date)
    return isToday(d) || isTomorrow(d)
  })
  const featuredMatches = todayTomorrow.length > 0 ? todayTomorrow : upcoming.slice(0, 4)
  const featuredLabel = todayTomorrow.length > 0 ? 'HOY Y MAÑANA' : 'PRÓXIMOS PARTIDOS'

  // Progreso del prode para la tarjeta de acceso
  const prode = useMemo(() => {
    const bracket = resolveBracket(picks)
    const groupDone = GROUP_MATCHES.filter(m => {
      const p = picks[m.match_number]
      return p && p.homeScore !== null && p.awayScore !== null
    }).length
    const koDone = KNOCKOUT_MATCHES.filter(m => bracket.matches[m.match_number]?.winnerId != null).length
    const total = GROUP_MATCHES.length + KNOCKOUT_MATCHES.length
    return {
      pct: Math.round(((groupDone + koDone) / total) * 100),
      champion: bracket.championId ? TEAMS_BY_ID[bracket.championId] : null,
    }
  }, [picks])

  const nextMatches = featuredMatches
  const totalPoints = 0
  const myRank = null as { rank: number } | null
  const streak = predMap.size

  const firstName = profile?.full_name?.split(' ')[0] ?? profile?.username ?? 'Jugador'

  return (
    <>
      {showOnboarding && <Onboarding onClose={() => setShowOnboarding(false)} />}
    <Layout>
      {/* ── TOP HEADER ── */}
      <div
        className="sticky top-0 z-40 px-4 pt-safe"
        style={{
          background: 'rgba(6,12,24,0.95)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid #1A3050',
        }}
      >
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <div
              className="text-[10px] font-black px-1.5 py-0.5 rounded"
              style={{ background: '#74ACDF', color: '#060C18' }}
            >
              AR
            </div>
            <div>
              <div
                className="text-[13px] font-black uppercase tracking-wider leading-none"
                style={{ color: '#FFFFFF' }}
              >
                PRODE MUNDIAL <span style={{ color: '#74ACDF' }}>2026</span>
              </div>
              <div
                className="text-[9px] font-semibold uppercase tracking-widest"
                style={{ color: '#3D5A7A' }}
              >
                GRUPO REGIÓN · LA SCALONETA
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/perfil')}
            className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #1A3F6F, #74ACDF)',
              color: '#FFFFFF',
            }}
          >
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt={firstName} className="w-full h-full object-cover" />
              : firstName[0]?.toUpperCase()}
          </button>
        </div>
      </div>

      {/* ── STATS BAR ── */}
      <div
        className="px-4 py-4"
        style={{ borderBottom: '1px solid #1A3050' }}
      >
        <div className="grid grid-cols-3 gap-2">
          <StatCard label="PUNTOS" value={totalPoints} accent="#F5B700" />
          <StatCard label="PUESTO" value={myRank ? `#${myRank.rank}` : '-'} accent="#74ACDF" />
          <StatCard label="CARGADOS" value={streak} accent="#00D084" />
        </div>
      </div>

      <div className="px-4 pt-5 space-y-6 pb-4">
        {/* Argentina alert */}
        {upcoming.some(m => m.is_argentina && m.status === 'upcoming') && (
          <button
            onClick={() => navigate('/fixture')}
            className="w-full text-left rounded-2xl p-4 flex items-center gap-3 relative overflow-hidden active:scale-[0.98] transition-transform"
            style={{
              background: 'linear-gradient(135deg, #0D1F38, #0A1929)',
              border: '1px solid rgba(116,172,223,0.35)',
              boxShadow: '0 0 20px rgba(116,172,223,0.08)',
            }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-0.5"
              style={{ background: 'linear-gradient(90deg, transparent, #74ACDF, transparent)' }}
            />
            <span className="text-3xl">🇦🇷</span>
            <div className="flex-1">
              <p className="text-sm font-black" style={{ color: '#FFFFFF' }}>
                ¡ARGENTINA JUEGA PRONTO!
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#5A7FA0' }}>
                Pronóstico exacto vale +7 pts · Goleadores +2 c/u
              </p>
            </div>
            <div
              className="text-xs font-black px-2 py-1 rounded"
              style={{ background: 'rgba(116,172,223,0.15)', color: '#74ACDF' }}
            >
              +7
            </div>
          </button>
        )}

        {/* Partidos hoy y mañana */}
        <section>
          <SectionTitle label={featuredLabel} />
          <div className="space-y-3">
            {nextMatches.length === 0 ? (
              <EmptyState label="No hay partidos próximos" />
            ) : (
              nextMatches.map(m => (
                <MatchCard key={m.id} match={m} prediction={predMap.get(m.id)} />
              ))
            )}
          </div>
          <button
            onClick={() => navigate('/fixture')}
            className="w-full mt-3 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-[0.98]"
            style={{
              background: 'rgba(116,172,223,0.06)',
              border: '1px solid #1A3050',
              color: '#5A7FA0',
            }}
          >
            VER FIXTURE COMPLETO →
          </button>
        </section>

        {/* Acceso a Mi Prode */}
        <section>
          <SectionTitle label="MIS PREDICCIONES" />
          <button
            onClick={() => navigate('/mi-prode')}
            className="w-full text-left rounded-2xl p-4 flex items-center gap-3.5 active:scale-[0.98] transition-transform"
            style={{ background: 'linear-gradient(135deg, #0D1F38, #0A1929)', border: '1px solid rgba(116,172,223,0.35)' }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #1A3F6F, #74ACDF)' }}
            >
              <ListChecks size={24} color="#fff" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-white">
                {prode.champion ? 'Editá tu prode' : 'Armá tu prode'}
              </p>
              {prode.champion ? (
                <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: '#5A7FA0' }}>
                  Campeón: <span>{prode.champion.flag_emoji}</span>
                  <span className="font-bold" style={{ color: '#74ACDF' }}>{prode.champion.name}</span>
                </p>
              ) : (
                <p className="text-xs mt-0.5" style={{ color: '#5A7FA0' }}>
                  {prode.pct > 0 ? `Completado ${prode.pct}% · seguí cargando` : 'Cargá grupos y la llave hasta el campeón'}
                </p>
              )}
              {/* barra de progreso */}
              <div className="h-1.5 rounded-full overflow-hidden mt-2" style={{ background: '#0A1422' }}>
                <div className="h-full rounded-full" style={{ width: `${prode.pct}%`, background: 'linear-gradient(90deg,#1A3F6F,#74ACDF)' }} />
              </div>
            </div>
            <ChevronRight size={20} style={{ color: '#3D5A7A' }} className="flex-shrink-0" />
          </button>
        </section>

        {/* Quick actions */}
        <section>
          <SectionTitle label="ACCESOS RÁPIDOS" />
          <div className="grid grid-cols-2 gap-2">
            <QuickBtn emoji="📊" label="RANKING GENERAL" onClick={() => navigate('/ranking')} />
            <QuickBtn emoji="🇦🇷" label="RANKING ARG" onClick={() => navigate('/ranking?tab=argentina')} gold />
            <QuickBtn emoji="🏆" label="INSIGNIAS" onClick={() => navigate('/insignias')} />
            <QuickBtn emoji="🌍" label="GRUPOS" onClick={() => navigate('/grupos')} />
          </div>
        </section>

        {/* Points guide */}
        <section>
          <SectionTitle label="SISTEMA DE PUNTOS" />
          <div
            className="rounded-2xl p-4 space-y-2.5"
            style={{ background: '#0D1929', border: '1px solid #1A3050' }}
          >
            {[
              { label: 'Participó', pts: '+1', color: '#3D5A7A' },
              { label: 'Ganador correcto', pts: '+3', color: '#5A7FA0' },
              { label: 'Empate correcto', pts: '+2', color: '#5A7FA0' },
              { label: 'Resultado exacto', pts: '+5', color: '#74ACDF' },
              { label: '🇦🇷 Exacto Argentina', pts: '+7', color: '#F5B700' },
              { label: 'Goleador Argentina', pts: '+2', color: '#00D084' },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between">
                <span className="text-xs font-medium" style={{ color: '#5A7FA0' }}>{row.label}</span>
                <span
                  className="text-xs font-black px-2 py-0.5 rounded"
                  style={{
                    color: row.color,
                    background: `${row.color}18`,
                    border: `1px solid ${row.color}30`,
                  }}
                >
                  {row.pts}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
    </>
  )
}

function StatCard({ label, value, accent }: { label: string; value: string | number; accent: string }) {
  return (
    <div
      className="rounded-xl px-3 py-3 text-center"
      style={{ background: '#0D1929', border: `1px solid ${accent}25` }}
    >
      <div className="text-2xl font-black leading-none" style={{ color: accent }}>{value}</div>
      <div className="text-[9px] font-black uppercase tracking-widest mt-1" style={{ color: '#3D5A7A' }}>
        {label}
      </div>
    </div>
  )
}

function SectionTitle({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="h-px flex-1" style={{ background: '#1A3050' }} />
      <span className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: '#3D5A7A' }}>
        {label}
      </span>
      <div className="h-px flex-1" style={{ background: '#1A3050' }} />
    </div>
  )
}

function QuickBtn({ emoji, label, onClick, gold }: {
  emoji: string; label: string; onClick: () => void; gold?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl p-3.5 flex items-center gap-2.5 active:scale-[0.97] transition-transform text-left"
      style={{
        background: gold ? 'rgba(245,183,0,0.05)' : '#0D1929',
        border: gold ? '1px solid rgba(245,183,0,0.2)' : '1px solid #1A3050',
      }}
    >
      <span className="text-xl">{emoji}</span>
      <span
        className="text-[10px] font-black uppercase tracking-wide"
        style={{ color: gold ? '#F5B700' : '#5A7FA0' }}
      >
        {label}
      </span>
    </button>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="text-center py-10" style={{ color: '#3D5A7A' }}>
      <div className="text-3xl mb-2 opacity-40">🏟️</div>
      <p className="text-xs uppercase tracking-widest font-semibold">{label}</p>
    </div>
  )
}
