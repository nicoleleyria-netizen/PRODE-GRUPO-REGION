import { useMemo, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Layout } from '../components/layout/Layout'
import { Header } from '../components/layout/Header'
import { type GroupLetter } from '../data/worldcup2026'
import { computeGroupStandings, type TeamStanding } from '../utils/bracket'
import { loadPicks } from '../utils/picksStore'

interface GroupData { letter: string; standings: TeamStanding[] }

const GROUP_LETTERS: GroupLetter[] = ['A','B','C','D','E','F','G','H','I','J','K','L']

export function Groups() {
  const { profile } = useAuth()
  const userId = profile?.id ?? 'anon'
  const [selected, setSelected] = useState<string | null>(null)

  const groups = useMemo<GroupData[]>(() => {
    const picks = loadPicks(userId)
    const standings = computeGroupStandings(picks)
    return GROUP_LETTERS.map(letter => ({ letter, standings: standings[letter] }))
  }, [userId])

  const filtered = groups.filter(g => selected === null || g.letter === selected)

  return (
    <Layout>
      <Header title="GRUPOS" />

      {/* Group letter tabs */}
      <div
        className="px-4 py-3 flex gap-1.5 overflow-x-auto"
        style={{ borderBottom: '1px solid #1A3050' }}
      >
        <GroupTab label="TODOS" active={selected === null} onClick={() => setSelected(null)} />
        {groups.map(g => (
          <GroupTab
            key={g.letter}
            label={g.letter}
            active={selected === g.letter}
            onClick={() => setSelected(g.letter)}
            isArgentina={g.standings.some(s => s.team.short_name === 'ARG')}
          />
        ))}
      </div>

      <div className="px-4 pt-4 space-y-4">
        {filtered.map(group => (
          <GroupCard key={group.letter} group={group} />
        ))}
      </div>
    </Layout>
  )
}

function GroupTab({ label, active, onClick, isArgentina }: {
  label: string; active: boolean; onClick: () => void; isArgentina?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
      style={{
        background: active
          ? isArgentina ? '#74ACDF' : 'rgba(116,172,223,0.15)'
          : 'transparent',
        color: active
          ? isArgentina ? '#060C18' : '#74ACDF'
          : '#3D5A7A',
        border: active
          ? isArgentina ? 'none' : '1px solid rgba(116,172,223,0.3)'
          : '1px solid #1A3050',
      }}
    >
      {isArgentina && !active ? `AR ${label}` : label}
    </button>
  )
}

function GroupCard({ group }: { group: GroupData }) {
  const hasArgentina = group.standings.some(s => s.team.short_name === 'ARG')
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: '#0D1929',
        border: hasArgentina ? '1px solid rgba(116,172,223,0.35)' : '1px solid #1A3050',
        boxShadow: hasArgentina ? '0 0 20px rgba(116,172,223,0.05)' : 'none',
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-2.5 flex items-center gap-2"
        style={{
          background: hasArgentina
            ? 'linear-gradient(135deg, #1A3F6F22, #74ACDF11)'
            : 'rgba(26,48,80,0.4)',
          borderBottom: '1px solid #1A3050',
        }}
      >
        {hasArgentina && (
          <span
            className="text-[9px] font-black px-1.5 py-0.5 rounded"
            style={{ background: '#74ACDF', color: '#060C18' }}
          >
            AR
          </span>
        )}
        <span
          className="font-black text-sm uppercase tracking-widest"
          style={{ color: hasArgentina ? '#74ACDF' : '#5A7FA0' }}
        >
          GRUPO {group.letter}
        </span>
      </div>

      {/* Table header */}
      <div
        className="flex items-center px-4 py-2"
        style={{ borderBottom: '1px solid #0A1422' }}
      >
        <span className="flex-1 text-[9px] font-black uppercase tracking-widest" style={{ color: '#3D5A7A' }}>
          SELECCIÓN
        </span>
        {['PJ','G','E','P','PTS'].map(h => (
          <span key={h} className="w-7 text-center text-[9px] font-black uppercase tracking-wider" style={{ color: '#3D5A7A' }}>
            {h}
          </span>
        ))}
      </div>

      {/* Teams */}
      <div>
        {group.standings.map(s => (
          <TeamRow key={s.team.id} standing={s} />
        ))}
      </div>
    </div>
  )
}

function TeamRow({ standing }: { standing: TeamStanding }) {
  const { team, position, played, won, drawn, lost, points } = standing
  const isArgentina = team.short_name === 'ARG'
  const qualified = position <= 2
  const empty = played === 0
  const cell = (v: number | string) => (empty ? '—' : v)

  return (
    <div
      className="flex items-center px-4 py-2.5 gap-2.5"
      style={{
        background: isArgentina ? 'rgba(116,172,223,0.04)' : 'transparent',
        borderBottom: '1px solid #0A1422',
      }}
    >
      <span
        className="text-xs font-black w-4 text-center"
        style={{ color: empty ? '#3D5A7A' : qualified ? '#74ACDF' : position === 3 ? '#F5B700' : '#3D5A7A' }}
      >
        {position}
      </span>
      <span className="text-xl leading-none">{team.flag_emoji}</span>
      <span
        className="flex-1 text-xs font-bold truncate"
        style={{ color: isArgentina ? '#FFFFFF' : '#8AAAC8' }}
      >
        {team.name}
        {isArgentina && <span className="ml-1 text-[10px]" style={{ color: '#74ACDF' }}>★</span>}
      </span>
      {[cell(played), cell(won), cell(drawn), cell(lost)].map((v, i) => (
        <span key={i} className="w-7 text-center text-xs" style={{ color: '#5A7FA0' }}>{v}</span>
      ))}
      <span className="w-7 text-center text-xs font-black" style={{ color: qualified && !empty ? '#74ACDF' : '#5A7FA0' }}>{cell(points)}</span>
    </div>
  )
}
