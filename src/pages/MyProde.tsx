import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Layout } from '../components/layout/Layout'
import { Header } from '../components/layout/Header'
import {
  TEAMS_BY_ID, GROUP_MATCHES, KNOCKOUT_MATCHES, PHASE_LABELS, matchDateTime,
  type GroupLetter, type WCTeam,
} from '../data/worldcup2026'
import { isMatchOpen } from '../utils/dates'
import {
  resolveBracket, type Picks, type MatchPick, type ResolvedMatch,
} from '../utils/bracket'
import { loadPicks } from '../utils/picksStore'
import { persistPick, hydratePredictions } from '../lib/predictionsRepo'
import { Minus, Plus, Trophy, Check, ChevronDown, Lock } from 'lucide-react'

const GROUP_LETTERS: GroupLetter[] = ['A','B','C','D','E','F','G','H','I','J','K','L']
const KO_ROUNDS = ['round_of_32','round_of_16','quarter','semi','third_place','final'] as const

type MainTab = 'grupos' | 'llave'

export function MyProde() {
  const { profile, isDemo } = useAuth()
  const userId = profile?.id ?? 'anon'
  const [picks, setPicksState] = useState<Picks>(() => loadPicks(userId))
  const [tab, setTab] = useState<MainTab>('grupos')
  const [openGroup, setOpenGroup] = useState<GroupLetter | null>('A')

  const bracket = useMemo(() => resolveBracket(picks), [picks])

  // Trae las predicciones guardadas (Supabase) al entrar
  useEffect(() => {
    if (isDemo) return
    hydratePredictions(userId).then(setPicksState).catch(() => {})
  }, [userId, isDemo])

  function update(matchNumber: number, patch: Partial<MatchPick>) {
    const current = picks[matchNumber] ?? { homeScore: null, awayScore: null }
    const merged: MatchPick = { ...current, ...patch }
    // Al cargar un lado, el otro arranca en 0 (marcador por defecto 0-0)
    if (patch.homeScore !== undefined && merged.awayScore === null) merged.awayScore = 0
    if (patch.awayScore !== undefined && merged.homeScore === null) merged.homeScore = 0
    setPicksState({ ...picks, [matchNumber]: merged })
    persistPick(userId, isDemo, matchNumber, merged)
  }

  const groupDone = GROUP_MATCHES.filter(m => {
    const p = picks[m.match_number]
    return p && p.homeScore !== null && p.awayScore !== null
  }).length

  const koDone = KNOCKOUT_MATCHES.filter(m => {
    const r = bracket.matches[m.match_number]
    return r?.winnerId != null
  }).length

  return (
    <Layout>
      <Header title="MI PRODE" />

      {/* Progreso */}
      <div className="px-4 pt-3">
        <ProgressBar
          done={groupDone + koDone}
          total={GROUP_MATCHES.length + KNOCKOUT_MATCHES.length}
          champion={bracket.championId}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 px-4 py-3">
        {([['grupos','GRUPOS'],['llave','LLAVE']] as [MainTab,string][]).map(([k,l]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className="flex-1 py-2 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all"
            style={{
              background: tab === k ? 'rgba(116,172,223,0.15)' : 'transparent',
              color: tab === k ? '#74ACDF' : '#3D5A7A',
              border: tab === k ? '1px solid rgba(116,172,223,0.3)' : '1px solid #1A3050',
            }}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="px-4 pb-4">
        {tab === 'grupos' ? (
          <div className="space-y-2.5">
            {GROUP_LETTERS.map(letter => (
              <GroupBlock
                key={letter}
                letter={letter}
                picks={picks}
                standings={bracket.standings[letter]}
                open={openGroup === letter}
                onToggle={() => setOpenGroup(openGroup === letter ? null : letter)}
                onChange={update}
              />
            ))}
          </div>
        ) : (
          <BracketView bracket={bracket} onChange={update} />
        )}
      </div>
    </Layout>
  )
}

// =====================================================
// PROGRESO
// =====================================================
function ProgressBar({ done, total, champion }: { done: number; total: number; champion: number | null }) {
  const pct = Math.round((done / total) * 100)
  const champ = champion ? TEAMS_BY_ID[champion] : null
  return (
    <div className="rounded-2xl p-4" style={{ background: '#0D1929', border: '1px solid #1A3050' }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#3D5A7A' }}>
          Tu pron&oacute;stico
        </span>
        <span className="text-[10px] font-black" style={{ color: '#74ACDF' }}>{pct}%</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: '#0A1422' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#1A3F6F,#74ACDF)' }} />
      </div>
      {champ ? (
        <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: '1px solid #1A3050' }}>
          <Trophy size={16} style={{ color: '#F5B700' }} />
          <span className="text-xs font-bold" style={{ color: '#5A7FA0' }}>Tu campe&oacute;n:</span>
          <span className="text-xl">{champ.flag_emoji}</span>
          <span className="text-sm font-black text-white">{champ.name}</span>
        </div>
      ) : (
        <p className="text-[11px] mt-2" style={{ color: '#3D5A7A' }}>
          Complet&aacute; los grupos y la llave hasta coronar a tu campe&oacute;n.
        </p>
      )}
    </div>
  )
}

// =====================================================
// BLOQUE DE GRUPO (tabla en vivo + partidos)
// =====================================================
function GroupBlock({ letter, picks, standings, open, onToggle, onChange }: {
  letter: GroupLetter
  picks: Picks
  standings: { team: WCTeam; played: number; points: number; gd: number; gf: number; position: number }[]
  open: boolean
  onToggle: () => void
  onChange: (n: number, patch: Partial<MatchPick>) => void
}) {
  const matches = GROUP_MATCHES.filter(m => m.group_letter === letter)
  const hasArg = standings.some(s => s.team.short_name === 'ARG')
  const filled = matches.filter(m => {
    const p = picks[m.match_number]
    return p && p.homeScore !== null && p.awayScore !== null
  }).length

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#0D1929', border: hasArg ? '1px solid rgba(116,172,223,0.35)' : '1px solid #1A3050' }}>
      <button onClick={onToggle} className="w-full px-4 py-3 flex items-center gap-2.5">
        <span className="font-black text-sm uppercase tracking-widest" style={{ color: hasArg ? '#74ACDF' : '#8AAAC8' }}>
          Grupo {letter}
        </span>
        {hasArg && <span className="text-sm">🇦🇷</span>}
        <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: filled === 6 ? 'rgba(0,208,132,0.15)' : 'rgba(116,172,223,0.08)', color: filled === 6 ? '#00D084' : '#5A7FA0' }}>
          {filled}/6
        </span>
        <ChevronDown size={16} style={{ color: '#3D5A7A', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
      </button>

      {/* Mini tabla siempre visible */}
      <div style={{ borderTop: '1px solid #1A3050' }}>
        {standings.map(s => {
          const qualifies = s.position <= 2
          const isArg = s.team.short_name === 'ARG'
          return (
            <div key={s.team.id} className="flex items-center px-4 py-1.5 gap-2"
              style={{ borderBottom: '1px solid #0A1422' }}>
              <span className="w-4 text-center text-[11px] font-black" style={{ color: qualifies ? '#74ACDF' : s.position === 3 ? '#F5B700' : '#3D5A7A' }}>
                {s.position}
              </span>
              <span className="text-base leading-none">{s.team.flag_emoji}</span>
              <span className="flex-1 text-xs font-bold truncate" style={{ color: isArg ? '#fff' : '#8AAAC8' }}>{s.team.name}</span>
              <span className="text-[10px] w-8 text-center" style={{ color: '#3D5A7A' }}>{s.gd > 0 ? `+${s.gd}` : s.gd}</span>
              <span className="text-xs font-black w-6 text-center" style={{ color: qualifies ? '#74ACDF' : '#5A7FA0' }}>{s.points}</span>
            </div>
          )
        })}
      </div>

      {/* Partidos editables */}
      {open && (
        <div className="px-3 py-3 space-y-2" style={{ background: '#0A1422' }}>
          {matches.map(m => (
            <GroupMatchRow key={m.match_number} matchNumber={m.match_number}
              home={TEAMS_BY_ID[m.home_id]} away={TEAMS_BY_ID[m.away_id]}
              pick={picks[m.match_number]} onChange={onChange}
              locked={!isMatchOpen(matchDateTime(m))} />
          ))}
        </div>
      )}
    </div>
  )
}

function GroupMatchRow({ matchNumber, home, away, pick, onChange, locked }: {
  matchNumber: number; home: WCTeam; away: WCTeam
  pick?: MatchPick; onChange: (n: number, patch: Partial<MatchPick>) => void
  locked?: boolean
}) {
  const h = pick?.homeScore ?? null
  const a = pick?.awayScore ?? null
  return (
    <div className="rounded-xl px-2.5 py-2 flex items-center gap-1.5"
      style={{ background: '#0D1929', border: '1px solid #1A3050', opacity: locked ? 0.75 : 1 }}>
      <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
        <span className="text-[11px] font-bold truncate text-right" style={{ color: '#8AAAC8' }}>{home.short_name}</span>
        <span className="text-base">{home.flag_emoji}</span>
      </div>
      <Stepper value={h} onChange={v => onChange(matchNumber, { homeScore: v })} disabled={locked} />
      <span className="text-[10px]" style={{ color: '#3D5A7A' }}>{locked ? <Lock size={11} /> : ':'}</span>
      <Stepper value={a} onChange={v => onChange(matchNumber, { awayScore: v })} disabled={locked} />
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        <span className="text-base">{away.flag_emoji}</span>
        <span className="text-[11px] font-bold truncate" style={{ color: '#8AAAC8' }}>{away.short_name}</span>
      </div>
    </div>
  )
}

// =====================================================
// VISTA LLAVE (eliminación)
// =====================================================
function BracketView({ bracket, onChange }: {
  bracket: ReturnType<typeof resolveBracket>
  onChange: (n: number, patch: Partial<MatchPick>) => void
}) {
  return (
    <div className="space-y-5">
      {KO_ROUNDS.map(round => {
        const matches = KNOCKOUT_MATCHES.filter(m => m.phase === round)
        return (
          <section key={round}>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px flex-1" style={{ background: '#1A3050' }} />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: '#3D5A7A' }}>
                {PHASE_LABELS[round]}
              </span>
              <div className="h-px flex-1" style={{ background: '#1A3050' }} />
            </div>
            <div className="space-y-2.5">
              {matches.map(m => (
                <KnockoutCard key={m.match_number} resolved={bracket.matches[m.match_number]} onChange={onChange} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function sourceLabel(src: string): string {
  const pos = /^([12])([A-L])$/.exec(src)
  if (pos) return `${pos[1]}° Grupo ${pos[2]}`
  if (src.startsWith('3')) return 'Mejor 3°'
  const wl = /^([WL])(\d+)$/.exec(src)
  if (wl) return wl[1] === 'W' ? `Ganador M${wl[2]}` : `Perdedor M${wl[2]}`
  return src
}

function KnockoutCard({ resolved, onChange }: {
  resolved: ResolvedMatch
  onChange: (n: number, patch: Partial<MatchPick>) => void
}) {
  const { match, homeId, awayId, homeScore, awayScore, winnerId } = resolved
  const home = homeId ? TEAMS_BY_ID[homeId] : null
  const away = awayId ? TEAMS_BY_ID[awayId] : null
  const ready = !!home && !!away
  const tie = homeScore !== null && awayScore !== null && homeScore === awayScore
  const n = match.match_number

  return (
    <div className="rounded-xl px-3 py-2.5" style={{ background: '#0D1929', border: ready ? '1px solid #1A3050' : '1px dashed #1A3050', opacity: ready ? 1 : 0.65 }}>
      <KoTeamRow side="home" team={home} placeholder={sourceLabel(match.home_source)}
        score={homeScore} editable={ready} isWinner={winnerId === homeId && winnerId !== null}
        onScore={v => onChange(n, { homeScore: v })} />
      <div className="h-px my-1.5" style={{ background: '#0A1422' }} />
      <KoTeamRow side="away" team={away} placeholder={sourceLabel(match.away_source)}
        score={awayScore} editable={ready} isWinner={winnerId === awayId && winnerId !== null}
        onScore={v => onChange(n, { awayScore: v })} />

      {ready && tie && (
        <div className="mt-2 pt-2 flex items-center gap-2" style={{ borderTop: '1px solid #0A1422' }}>
          <span className="text-[10px] font-bold" style={{ color: '#F5B700' }}>Empate &mdash; ¿qui&eacute;n pasa por penales?</span>
          <div className="ml-auto flex gap-1">
            <PenaltyBtn label={home!.short_name} active={winnerId === homeId} onClick={() => onChange(n, { winnerId: homeId })} />
            <PenaltyBtn label={away!.short_name} active={winnerId === awayId} onClick={() => onChange(n, { winnerId: awayId })} />
          </div>
        </div>
      )}
    </div>
  )
}

function KoTeamRow({ team, placeholder, score, editable, isWinner, onScore }: {
  side: 'home' | 'away'; team: WCTeam | null; placeholder: string
  score: number | null; editable: boolean; isWinner: boolean
  onScore: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-lg w-6 text-center">{team?.flag_emoji ?? '🏳️'}</span>
      <span className="flex-1 text-xs font-bold truncate" style={{ color: team ? (isWinner ? '#fff' : '#8AAAC8') : '#3D5A7A' }}>
        {team?.name ?? placeholder}
      </span>
      {isWinner && <Check size={13} style={{ color: '#00D084' }} />}
      <Stepper value={score} onChange={onScore} disabled={!editable} />
    </div>
  )
}

function PenaltyBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="px-2 py-0.5 rounded-md text-[10px] font-black transition-all"
      style={{ background: active ? '#74ACDF' : 'rgba(116,172,223,0.1)', color: active ? '#060C18' : '#74ACDF' }}>
      {label}
    </button>
  )
}

// =====================================================
// STEPPER de marcador (compacto)
// =====================================================
function Stepper({ value, onChange, disabled }: {
  value: number | null; onChange: (v: number) => void; disabled?: boolean
}) {
  const v = value ?? 0
  return (
    <div className="flex items-center gap-0.5" style={{ opacity: disabled ? 0.4 : 1 }}>
      <button disabled={disabled} onClick={() => onChange(Math.max(0, v - 1))}
        className="w-6 h-6 rounded-md flex items-center justify-center active:scale-90 transition-transform"
        style={{ background: '#1A3050', color: '#74ACDF' }}>
        <Minus size={12} />
      </button>
      <div className="w-7 h-7 rounded-md flex items-center justify-center"
        style={{ background: value === null ? '#0A1422' : 'rgba(116,172,223,0.12)', border: '1px solid #1A3050' }}>
        <span className="text-sm font-black" style={{ color: value === null ? '#5A7FA0' : '#fff' }}>{v}</span>
      </div>
      <button disabled={disabled} onClick={() => onChange(v + 1)}
        className="w-6 h-6 rounded-md flex items-center justify-center active:scale-90 transition-transform"
        style={{ background: '#74ACDF', color: '#060C18' }}>
        <Plus size={12} />
      </button>
    </div>
  )
}
