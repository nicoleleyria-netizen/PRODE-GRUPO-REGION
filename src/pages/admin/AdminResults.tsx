import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { AdminLayout } from './AdminLayout'
import type { Match } from '../../types'
import { formatMatchDate, formatMatchTime } from '../../utils/dates'
import { calculatePoints } from '../../utils/points'
import { CheckCircle2, Save, RefreshCw, Minus, Plus } from 'lucide-react'

export function AdminResults() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'finished'>('pending')

  useEffect(() => {
    loadMatches()
  }, [])

  async function loadMatches() {
    const { data } = await supabase
      .from('matches')
      .select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)')
      .order('match_date', { ascending: true })
    setMatches((data ?? []) as Match[])
    setLoading(false)
  }

  const filtered = matches.filter(m => {
    if (filter === 'pending') return m.status !== 'finished'
    if (filter === 'finished') return m.status === 'finished'
    return true
  })

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">Cargar resultados</h1>
        <button
          onClick={loadMatches}
          className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center"
        >
          <RefreshCw size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {([
          { key: 'pending', label: 'Pendientes' },
          { key: 'finished', label: 'Finalizados' },
          { key: 'all', label: 'Todos' },
        ] as { key: typeof filter; label: string }[]).map(t => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              filter === t.key ? 'bg-[#003F7F] text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400">Cargando...</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(match => (
            <MatchResultCard
              key={match.id}
              match={match}
              onUpdated={loadMatches}
            />
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <CheckCircle2 size={32} className="mx-auto mb-2 text-green-500 opacity-60" />
              <p>No hay partidos en esta categoría</p>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  )
}

function MatchResultCard({ match, onUpdated }: { match: Match; onUpdated: () => void }) {
  const [homeScore, setHomeScore] = useState(match.home_score ?? 0)
  const [awayScore, setAwayScore] = useState(match.away_score ?? 0)
  const [argScorers, setArgScorers] = useState<string>(
    match.argentina_scorers?.join(', ') ?? ''
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const finished = match.status === 'finished'

  async function saveResult() {
    setSaving(true)
    const scorerArray = argScorers
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)

    const { error } = await supabase
      .from('matches')
      .update({
        home_score: homeScore,
        away_score: awayScore,
        status: 'finished',
        argentina_scorers: match.is_argentina ? scorerArray : null,
      })
      .eq('id', match.id)

    if (!error) {
      await calculatePointsForMatch(match.id)
      setSaved(true)
      setTimeout(() => {
        setSaved(false)
        onUpdated()
      }, 1500)
    }
    setSaving(false)
  }

  async function calculatePointsForMatch(matchId: number) {
    const { data: predictions } = await supabase
      .from('predictions')
      .select('*')
      .eq('match_id', matchId)

    if (!predictions) return

    for (const pred of predictions) {
let correctScorers = 0
      if (match.is_argentina && argScorers) {
        const scorers = argScorers.split(',').map(s => s.trim()).filter(Boolean)
        const { data: scorerPreds } = await supabase
          .from('argentina_scorer_predictions')
          .select('player_name')
          .eq('user_id', pred.user_id)
          .eq('match_id', matchId)

        if (scorerPreds) {
          correctScorers = scorerPreds.filter(sp => scorers.includes(sp.player_name)).length
          await supabase
            .from('argentina_scorer_predictions')
            .update({ is_correct: true })
            .eq('user_id', pred.user_id)
            .eq('match_id', matchId)
            .in('player_name', scorers)
        }
      }

      const points = calculatePoints(
        pred.home_score_pred,
        pred.away_score_pred,
        homeScore,
        awayScore,
        match.is_argentina,
        correctScorers
      )

      await supabase
        .from('predictions')
        .update({ points_earned: points.total, calculated: true })
        .eq('id', pred.id)
    }
  }

  return (
    <div className={`bg-white rounded-2xl border p-4 ${finished ? 'border-green-100' : 'border-gray-100'}`}>
      {/* Match info */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-400">
          {formatMatchDate(match.match_date)} · {formatMatchTime(match.match_date)}
        </span>
        {finished && (
          <span className="flex items-center gap-1 text-xs text-green-600 font-semibold">
            <CheckCircle2 size={12} />
            Finalizado
          </span>
        )}
        {match.is_argentina && <span className="text-xs">🇦🇷</span>}
      </div>

      {/* Teams & score */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 flex items-center gap-2">
          <span className="text-2xl">{match.home_team?.flag_emoji}</span>
          <span className="text-sm font-semibold text-gray-800">{match.home_team?.short_name}</span>
        </div>

        <div className="flex items-center gap-2">
          <ScoreButton value={homeScore} onChange={setHomeScore} />
          <span className="text-gray-300 font-light">-</span>
          <ScoreButton value={awayScore} onChange={setAwayScore} />
        </div>

        <div className="flex-1 flex items-center gap-2 justify-end">
          <span className="text-sm font-semibold text-gray-800">{match.away_team?.short_name}</span>
          <span className="text-2xl">{match.away_team?.flag_emoji}</span>
        </div>
      </div>

      {/* Argentina scorers */}
      {match.is_argentina && (
        <div className="mb-3">
          <label className="text-xs font-medium text-gray-600 block mb-1">
            Goleadores de Argentina (separados por coma)
          </label>
          <input
            value={argScorers}
            onChange={e => setArgScorers(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#74ACDF]"
            placeholder="Messi, Álvarez, ..."
          />
        </div>
      )}

      {/* Save button */}
      <button
        onClick={saveResult}
        disabled={saving || saved}
        className={`w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
          saved
            ? 'bg-green-500 text-white'
            : 'bg-[#003F7F] text-white active:scale-[0.98]'
        } disabled:opacity-70`}
      >
        {saved ? (
          <><CheckCircle2 size={16} /> Guardado y puntos calculados</>
        ) : saving ? (
          'Guardando...'
        ) : (
          <><Save size={16} /> {finished ? 'Actualizar resultado' : 'Cargar resultado'}</>
        )}
      </button>
    </div>
  )
}

function ScoreButton({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center active:scale-95"
      >
        <Minus size={12} />
      </button>
      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg font-bold">
        {value}
      </div>
      <button
        onClick={() => onChange(value + 1)}
        className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center active:scale-95"
      >
        <Plus size={12} />
      </button>
    </div>
  )
}
