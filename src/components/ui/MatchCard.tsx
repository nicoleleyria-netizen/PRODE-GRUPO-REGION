import { useNavigate } from 'react-router-dom'
import type { Match, Prediction } from '../../types'
import { formatMatchTime, formatShortDate, isMatchOpen, timeUntilMatch } from '../../utils/dates'

interface MatchCardProps {
  match: Match
  prediction?: Prediction
  compact?: boolean
}

export function MatchCard({ match, prediction, compact = false }: MatchCardProps) {
  const navigate = useNavigate()
  const open = isMatchOpen(match.match_date)
  const finished = match.status === 'finished'
  const live = match.status === 'live'
  const isArgentina = match.is_argentina

  return (
    <button onClick={() => navigate(`/partido/${match.id}`)} className="w-full text-left group">
      <div
        className="relative overflow-hidden rounded-2xl transition-all active:scale-[0.98]"
        style={{
          background: isArgentina
            ? 'linear-gradient(135deg, #0D1F38 0%, #0A1929 100%)'
            : '#0D1929',
          border: isArgentina ? '1px solid rgba(116,172,223,0.35)' : '1px solid #1A3050',
          boxShadow: isArgentina ? '0 0 20px rgba(116,172,223,0.08)' : 'none',
        }}
      >
        {/* Argentina top accent line */}
        {isArgentina && (
          <div
            className="absolute top-0 left-0 right-0 h-0.5"
            style={{ background: 'linear-gradient(90deg, transparent, #74ACDF, transparent)' }}
          />
        )}

        <div className="px-4 py-3.5">
          {/* Top row: group/phase + status */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {isArgentina && (
                <span
                  className="text-[10px] font-black px-1.5 py-0.5 rounded"
                  style={{ background: '#74ACDF', color: '#060C18', letterSpacing: '0.05em' }}
                >
                  AR
                </span>
              )}
              <span
                className="text-[10px] font-semibold uppercase tracking-widest"
                style={{ color: '#3D5A7A' }}
              >
                {match.phase === 'group' ? `GRUPO ${match.group_letter}` : phaseLabel(match.phase)}
              </span>
            </div>

            <StatusBadge finished={finished} live={live} matchDate={match.match_date} />
          </div>

          {/* Teams + score */}
          <div className="flex items-center gap-2">
            {/* Home team */}
            <div className="flex-1 flex items-center gap-2.5">
              <span className="text-3xl leading-none">{match.home_team?.flag_emoji ?? '🏳️'}</span>
              <div>
                <div
                  className="text-lg font-black leading-none tracking-wider"
                  style={{ color: '#FFFFFF' }}
                >
                  {match.home_team?.short_name ?? '???'}
                </div>
                <div className="text-[10px] mt-0.5 font-medium" style={{ color: '#3D5A7A' }}>
                  {match.home_team?.name ?? '---'}
                </div>
              </div>
            </div>

            {/* Center: score or time */}
            <div className="flex flex-col items-center min-w-[80px]">
              {finished || live ? (
                <div className="flex items-center gap-2">
                  <span
                    className="text-3xl font-black tabular-nums"
                    style={{ color: live ? '#74ACDF' : '#FFFFFF' }}
                  >
                    {match.home_score}
                  </span>
                  <span className="text-xl font-light" style={{ color: '#3D5A7A' }}>-</span>
                  <span
                    className="text-3xl font-black tabular-nums"
                    style={{ color: live ? '#74ACDF' : '#FFFFFF' }}
                  >
                    {match.away_score}
                  </span>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-xs font-semibold" style={{ color: '#5A7FA0' }}>
                    {formatShortDate(match.match_date)}
                  </div>
                  <div
                    className="text-xl font-black mt-0.5"
                    style={{ color: '#74ACDF' }}
                  >
                    {formatMatchTime(match.match_date)}
                  </div>
                </div>
              )}
            </div>

            {/* Away team */}
            <div className="flex-1 flex items-center gap-2.5 justify-end">
              <div className="text-right">
                <div
                  className="text-lg font-black leading-none tracking-wider"
                  style={{ color: '#FFFFFF' }}
                >
                  {match.away_team?.short_name ?? '???'}
                </div>
                <div className="text-[10px] mt-0.5 font-medium" style={{ color: '#3D5A7A' }}>
                  {match.away_team?.name ?? '---'}
                </div>
              </div>
              <span className="text-3xl leading-none">{match.away_team?.flag_emoji ?? '🏳️'}</span>
            </div>
          </div>

          {/* Prediction bar */}
          {!compact && (
            <div
              className="mt-3 pt-3 flex items-center justify-between"
              style={{ borderTop: '1px solid #1A3050' }}
            >
              {prediction ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#00D084' }} />
                    <span className="text-xs" style={{ color: '#5A7FA0' }}>
                      Tu prode:{' '}
                      <span className="font-bold" style={{ color: '#74ACDF' }}>
                        {prediction.home_score_pred} - {prediction.away_score_pred}
                      </span>
                    </span>
                  </div>
                  {prediction.points_earned !== null && prediction.calculated && (
                    <PointsBubble points={prediction.points_earned} />
                  )}
                </>
              ) : open ? (
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ background: '#F5B700' }}
                  />
                  <span className="text-xs font-bold" style={{ color: '#F5B700' }}>
                    ¡Cargá tu pronóstico!
                  </span>
                </div>
              ) : (
                <span className="text-xs" style={{ color: '#3D5A7A' }}>
                  Sin pronóstico
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

function StatusBadge({ finished, live, matchDate }: {
  finished: boolean; live: boolean; matchDate: string
}) {
  if (live) {
    return (
      <div
        className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black tracking-widest animate-live"
        style={{ background: 'rgba(255,59,59,0.15)', color: '#FF3B3B', border: '1px solid rgba(255,59,59,0.3)' }}
      >
        <div className="w-1 h-1 rounded-full bg-red-500 animate-ping" />
        EN VIVO
      </div>
    )
  }
  if (finished) {
    return (
      <span
        className="text-[10px] font-semibold uppercase tracking-widest"
        style={{ color: '#3D5A7A' }}
      >
        FINALIZADO
      </span>
    )
  }
  return (
    <span
      className="text-[10px] font-semibold uppercase tracking-widest"
      style={{ color: '#5A7FA0' }}
    >
      {timeUntilMatch(matchDate)}
    </span>
  )
}

function PointsBubble({ points }: { points: number }) {
  const isGreat = points >= 6
  return (
    <div
      className="px-2 py-0.5 rounded text-[11px] font-black"
      style={{
        background: isGreat ? 'rgba(245,183,0,0.15)' : 'rgba(116,172,223,0.1)',
        color: isGreat ? '#F5B700' : '#74ACDF',
        border: isGreat ? '1px solid rgba(245,183,0,0.3)' : '1px solid rgba(116,172,223,0.2)',
      }}
    >
      +{points} PTS
    </div>
  )
}

function phaseLabel(phase: string): string {
  const labels: Record<string, string> = {
    round_of_32: 'RONDA 32',
    round_of_16: 'OCTAVOS',
    quarter: 'CUARTOS',
    semi: 'SEMIFINAL',
    final: 'FINAL',
  }
  return labels[phase] ?? phase.toUpperCase()
}
