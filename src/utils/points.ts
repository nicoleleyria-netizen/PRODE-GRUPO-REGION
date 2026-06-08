import type { PointsBreakdown } from '../types'

export function calculatePoints(
  predHome: number,
  predAway: number,
  actHome: number,
  actAway: number,
  isArgentina: boolean,
  correctScorers = 0
): PointsBreakdown {
  const breakdown: PointsBreakdown = {
    participated: 1,
    correctWinner: 0,
    correctDraw: 0,
    exactScore: 0,
    argentinaBonus: 0,
    scorerBonus: 0,
    total: 1,
  }

  const isExact = predHome === actHome && predAway === actAway

  const predOutcome = predHome > predAway ? 'home' : predHome < predAway ? 'away' : 'draw'
  const actOutcome = actHome > actAway ? 'home' : actHome < actAway ? 'away' : 'draw'
  const correctOutcome = predOutcome === actOutcome

  if (isExact) {
    if (isArgentina) {
      breakdown.exactScore = 5
      breakdown.argentinaBonus = 2
    } else {
      breakdown.exactScore = 5
    }
  } else if (correctOutcome) {
    if (actOutcome === 'draw') {
      breakdown.correctDraw = 2
    } else {
      breakdown.correctWinner = 3
    }
  }

  if (isArgentina && correctScorers > 0) {
    breakdown.scorerBonus = correctScorers * 2
  }

  breakdown.total =
    breakdown.participated +
    breakdown.correctWinner +
    breakdown.correctDraw +
    breakdown.exactScore +
    breakdown.argentinaBonus +
    breakdown.scorerBonus

  return breakdown
}

export function getPointsLabel(points: number): { label: string; color: string } {
  if (points >= 8) return { label: `+${points}`, color: 'bg-amber-400 text-amber-900' }
  if (points >= 6) return { label: `+${points}`, color: 'bg-green-500 text-white' }
  if (points >= 4) return { label: `+${points}`, color: 'bg-blue-500 text-white' }
  if (points >= 2) return { label: `+${points}`, color: 'bg-gray-400 text-white' }
  return { label: `+${points}`, color: 'bg-gray-200 text-gray-600' }
}

export const POINTS_TABLE = [
  { label: 'Participó', value: 1, color: 'text-gray-500', description: 'Por cargar un pronóstico' },
  { label: 'Ganador correcto', value: 3, color: 'text-blue-600', description: 'Acertaste qué equipo gana' },
  { label: 'Empate correcto', value: 2, color: 'text-blue-500', description: 'Acertaste que habría empate' },
  { label: 'Resultado exacto', value: 5, color: 'text-green-600', description: 'Acertaste el marcador exacto' },
  { label: 'Exacto Argentina', value: 7, color: 'text-argentina-dark', description: 'Exacto en partido de Argentina (+2 bonus)' },
  { label: 'Goleador Argentina', value: 2, color: 'text-amber-600', description: 'Por cada goleador de Argentina que acertaste' },
]
