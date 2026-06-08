import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Layout } from '../components/layout/Layout'
import { Header } from '../components/layout/Header'
import { PageLoader } from '../components/ui/LoadingSpinner'
import type { Match, Prediction, ArgentinaScorerPrediction } from '../types'
import { formatMatchDate, formatMatchTime, isMatchOpen } from '../utils/dates'
import { calculatePoints } from '../utils/points'
import { MapPin, Clock, Lock, CheckCircle2, Info, Star, Minus, Plus } from 'lucide-react'

const ARGENTINA_PLAYERS = [
  'Lionel Messi', 'Julián Álvarez', 'Lautaro Martínez', 'Paulo Dybala',
  'Enzo Fernández', 'Nicolás González', 'Rodrigo De Paul', 'Leandro Paredes',
  'Alejandro Garnacho', 'Thiago Almada', 'Germán Pezzella',
]

export function MatchDetail() {
  const { id } = useParams<{ id: string }>()
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [match, setMatch] = useState<Match | null>(null)
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [scorerPreds, setScorerPreds] = useState<string[]>([])
  const [homeScore, setHomeScore] = useState(0)
  const [awayScore, setAwayScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) loadData(Number(id))
  }, [id, profile])

  async function loadData(matchId: number) {
    setLoading(true)
    const [matchRes, predRes, scorerRes] = await Promise.all([
      supabase
        .from('matches')
        .select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)')
        .eq('id', matchId)
        .single(),

      profile
        ? supabase.from('predictions').select('*').eq('user_id', profile.id).eq('match_id', matchId).single()
        : Promise.resolve({ data: null }),

      profile
        ? supabase.from('argentina_scorer_predictions').select('*').eq('user_id', profile.id).eq('match_id', matchId)
        : Promise.resolve({ data: [] }),
    ])

    if (matchRes.data) setMatch(matchRes.data as Match)

    if ((predRes as { data: Prediction | null }).data) {
      const p = (predRes as { data: Prediction }).data
      setPrediction(p)
      setHomeScore(p.home_score_pred)
      setAwayScore(p.away_score_pred)
    }

    const scorers = ((scorerRes as { data: ArgentinaScorerPrediction[] | null }).data ?? [])
    setScorerPreds(scorers.map(s => s.player_name))
    setLoading(false)
  }

  async function savePrediction() {
    if (!profile || !match) return
    setSaving(true)
    setError('')

    const payload = {
      user_id: profile.id,
      match_id: match.id,
      home_score_pred: homeScore,
      away_score_pred: awayScore,
      updated_at: new Date().toISOString(),
    }

    const { error: predError } = prediction
      ? await supabase.from('predictions').update(payload).eq('id', prediction.id)
      : await supabase.from('predictions').insert({ ...payload, created_at: new Date().toISOString() })

    if (predError) {
      setError('Error al guardar el pronóstico')
      setSaving(false)
      return
    }

    if (match.is_argentina && scorerPreds.length > 0) {
      await supabase.from('argentina_scorer_predictions').delete()
        .eq('user_id', profile.id).eq('match_id', match.id)

      await supabase.from('argentina_scorer_predictions').insert(
        scorerPreds.map(player => ({
          user_id: profile.id,
          match_id: match.id,
          player_name: player,
        }))
      )
    }

    setSaved(true)
    setSaving(false)
    setTimeout(() => {
      navigate(-1)
    }, 1000)
  }

  if (loading) return <Layout><PageLoader /></Layout>
  if (!match) return <Layout><div className="p-8 text-center text-gray-500">Partido no encontrado</div></Layout>

  const open = isMatchOpen(match.match_date)
  const finished = match.status === 'finished'

  let pointsPreview = null
  if (finished && match.home_score !== null && match.away_score !== null) {
    const correctScorers = scorerPreds.filter(p =>
      match.argentina_scorers?.includes(p)
    ).length
    pointsPreview = calculatePoints(
      homeScore, awayScore,
      match.home_score, match.away_score,
      match.is_argentina, correctScorers
    )
  }

  return (
    <Layout>
      <Header title="Partido" showBack />

      <div className="px-4 pt-4 space-y-4">
        {/* Match hero */}
        <div
          className={`rounded-2xl overflow-hidden ${
            match.is_argentina ? 'bg-gradient-to-br from-[#003F7F] to-[#74ACDF]' : 'bg-[#003F7F]'
          }`}
        >
          <div className="px-4 pt-4 pb-5 text-white">
            {/* Phase & date */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold bg-white/20 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                {match.phase === 'group' ? `Grupo ${match.group_letter}` : match.phase}
              </span>
              {match.is_argentina && (
                <span className="flex items-center gap-1 text-xs font-bold bg-amber-400/30 text-amber-200 px-2.5 py-0.5 rounded-full">
                  <Star size={10} className="fill-current" />
                  Argentina
                </span>
              )}
            </div>

            {/* Teams */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 flex flex-col items-center gap-2">
                <span className="text-5xl">{match.home_team?.flag_emoji}</span>
                <span className="font-bold text-center text-sm">{match.home_team?.name}</span>
              </div>

              {finished ? (
                <div className="text-center">
                  <div className="text-4xl font-extrabold">
                    {match.home_score} <span className="text-white/50">-</span> {match.away_score}
                  </div>
                  <span className="text-xs text-white/60 bg-white/10 px-2 py-0.5 rounded-full mt-1 inline-block">
                    Final
                  </span>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-2xl font-bold text-white/50">VS</div>
                  <div className="text-xs text-white/70 mt-1">{formatMatchTime(match.match_date)}</div>
                </div>
              )}

              <div className="flex-1 flex flex-col items-center gap-2">
                <span className="text-5xl">{match.away_team?.flag_emoji}</span>
                <span className="font-bold text-center text-sm">{match.away_team?.name}</span>
              </div>
            </div>

            {/* Info row */}
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-white/60">
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {formatMatchDate(match.match_date)}
              </span>
              {match.city && (
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  {match.city}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Prediction section */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Tu pronóstico</h2>
            {!open && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Lock size={12} />
                Cerrado
              </span>
            )}
            {prediction && open && (
              <span className="flex items-center gap-1 text-xs text-emerald-500">
                <CheckCircle2 size={12} />
                Guardado
              </span>
            )}
          </div>

          {/* Score inputs */}
          <div className="flex items-center justify-center gap-6 mb-4">
            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl">{match.home_team?.flag_emoji}</span>
              <span className="text-xs font-semibold text-gray-500">{match.home_team?.short_name}</span>
              <ScoreInput value={homeScore} onChange={setHomeScore} disabled={!open} />
            </div>

            <span className="text-xl font-light text-gray-300 mt-6">—</span>

            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl">{match.away_team?.flag_emoji}</span>
              <span className="text-xs font-semibold text-gray-500">{match.away_team?.short_name}</span>
              <ScoreInput value={awayScore} onChange={setAwayScore} disabled={!open} />
            </div>
          </div>

          {/* Outcome preview */}
          {open && (
            <div className="flex items-center justify-center mb-4">
              <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                {homeScore > awayScore
                  ? `Gana ${match.home_team?.short_name}`
                  : awayScore > homeScore
                  ? `Gana ${match.away_team?.short_name}`
                  : 'Empate'}
              </span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-xl mb-3">
              {error}
            </div>
          )}

          {open ? (
            <button
              onClick={savePrediction}
              disabled={saving || saved}
              className="w-full bg-[#003F7F] text-white font-bold py-3.5 rounded-xl
                         active:scale-[0.98] transition-all disabled:opacity-70
                         flex items-center justify-center gap-2"
            >
              {saved ? (
                <><CheckCircle2 size={18} /> ¡Guardado!</>
              ) : saving ? (
                'Guardando...'
              ) : prediction ? (
                'Actualizar pronóstico'
              ) : (
                'Guardar pronóstico'
              )}
            </button>
          ) : (
            <div className="text-center text-sm text-gray-400 py-2">
              {finished && prediction
                ? 'Tu pronóstico fue registrado'
                : finished
                ? 'No cargaste pronóstico para este partido'
                : 'El período de pronósticos cerró'}
            </div>
          )}
        </div>

        {/* Argentina scorers */}
        {match.is_argentina && (
          <div className="bg-white rounded-2xl border border-[#74ACDF]/30 p-4">
            <h2 className="font-bold text-[#003F7F] flex items-center gap-2 mb-3">
              <span className="text-xl">🇦🇷</span>
              Goleadores de Argentina
              <span className="ml-auto text-xs font-normal text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                +2 pts c/u
              </span>
            </h2>
            <p className="text-xs text-gray-500 mb-3">
              Seleccioná los jugadores que creés que van a marcar
            </p>
            <div className="flex flex-wrap gap-2">
              {ARGENTINA_PLAYERS.map(player => {
                const selected = scorerPreds.includes(player)
                return (
                  <button
                    key={player}
                    onClick={() => {
                      if (!open) return
                      setScorerPreds(prev =>
                        selected ? prev.filter(p => p !== player) : [...prev, player]
                      )
                    }}
                    disabled={!open}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      selected
                        ? 'bg-[#003F7F] text-white'
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                    } ${!open ? 'opacity-60 cursor-not-allowed' : 'active:scale-95'}`}
                  >
                    {player}
                    {selected && ' ✓'}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Points breakdown (if finished) */}
        {finished && prediction && pointsPreview && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Star size={16} className="text-amber-400 fill-amber-400" />
              Puntos obtenidos
            </h2>
            <div className="space-y-2">
              {[
                { label: 'Participó', pts: pointsPreview.participated, always: true },
                { label: 'Ganador correcto', pts: pointsPreview.correctWinner },
                { label: 'Empate correcto', pts: pointsPreview.correctDraw },
                { label: 'Resultado exacto', pts: pointsPreview.exactScore },
                { label: 'Bonus Argentina', pts: pointsPreview.argentinaBonus },
                { label: 'Goleadores', pts: pointsPreview.scorerBonus },
              ]
                .filter(r => r.always || r.pts > 0)
                .map(row => (
                  <div key={row.label} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{row.label}</span>
                    <span className={`text-sm font-bold ${row.pts > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                      +{row.pts}
                    </span>
                  </div>
                ))}
              <div className="border-t border-gray-100 pt-2 flex justify-between items-center">
                <span className="font-bold text-gray-900">Total</span>
                <span className="text-lg font-extrabold text-[#003F7F]">+{pointsPreview.total} pts</span>
              </div>
            </div>
          </div>
        )}

        {/* Points info */}
        <div className="bg-blue-50 rounded-xl px-4 py-3 flex gap-3">
          <Info size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-700">
            <p className="font-semibold mb-1">Podés modificar tu pronóstico hasta que empiece el partido.</p>
            <p>Los pronósticos se cierran automáticamente al inicio del partido.</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}

function ScoreInput({ value, onChange, disabled }: {
  value: number
  onChange: (v: number) => void
  disabled: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        disabled={disabled || value === 0}
        className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40"
      >
        <Minus size={16} />
      </button>
      <div className="w-14 h-14 rounded-2xl bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
      </div>
      <button
        onClick={() => onChange(Math.min(20, value + 1))}
        disabled={disabled || value === 20}
        className="w-9 h-9 rounded-xl bg-[#003F7F] text-white flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40"
      >
        <Plus size={16} />
      </button>
    </div>
  )
}
