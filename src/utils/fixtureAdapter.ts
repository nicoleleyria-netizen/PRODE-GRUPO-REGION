// =====================================================
// Adapta la data oficial (worldcup2026) al tipo Match que usa la UI,
// resolviendo los cruces de eliminación con las predicciones del usuario.
// =====================================================
import {
  GROUP_MATCHES, KNOCKOUT_MATCHES, TEAMS_BY_ID, ARGENTINA_ID, matchDateTime,
} from '../data/worldcup2026'
import { resolveBracket, type Picks } from './bracket'
import type { Match, Team, Prediction } from '../types'

function wcToTeam(id: number): Team {
  const t = TEAMS_BY_ID[id]
  return {
    id: t.id, name: t.name, short_name: t.short_name,
    flag_emoji: t.flag_emoji, group_letter: t.group_letter, eliminated: false,
  }
}

/** Construye la lista completa de 104 partidos para mostrar en el Fixture. */
export function buildFixture(picks: Picks): Match[] {
  const bracket = resolveBracket(picks)

  const group: Match[] = GROUP_MATCHES.map(m => ({
    id: m.match_number,
    home_team_id: m.home_id,
    away_team_id: m.away_id,
    home_score: null,
    away_score: null,
    match_date: matchDateTime(m),
    stadium: m.stadium,
    city: m.city,
    country: m.country,
    phase: 'group',
    group_letter: m.group_letter,
    match_number: m.match_number,
    status: 'upcoming',
    is_argentina: m.home_id === ARGENTINA_ID || m.away_id === ARGENTINA_ID,
    home_team: wcToTeam(m.home_id),
    away_team: wcToTeam(m.away_id),
  }))

  const ko: Match[] = KNOCKOUT_MATCHES.map(m => {
    const r = bracket.matches[m.match_number]
    const homeId = r?.homeId ?? null
    const awayId = r?.awayId ?? null
    return {
      id: m.match_number,
      home_team_id: homeId ?? 0,
      away_team_id: awayId ?? 0,
      home_score: null,
      away_score: null,
      match_date: matchDateTime(m),
      stadium: m.stadium,
      city: m.city,
      country: m.country,
      phase: m.phase,
      group_letter: null,
      match_number: m.match_number,
      status: 'upcoming',
      is_argentina: homeId === ARGENTINA_ID || awayId === ARGENTINA_ID,
      home_team: homeId ? wcToTeam(homeId) : undefined,
      away_team: awayId ? wcToTeam(awayId) : undefined,
    }
  })

  return [...group, ...ko]
}

/** Mapa match_number -> Prediction (sintética) a partir de los marcadores cargados. */
export function buildPredictionMap(picks: Picks): Map<number, Prediction> {
  const map = new Map<number, Prediction>()
  for (const [num, p] of Object.entries(picks)) {
    if (p.homeScore === null || p.awayScore === null) continue
    const n = Number(num)
    map.set(n, {
      id: `pick-${n}`,
      user_id: 'local',
      match_id: n,
      home_score_pred: p.homeScore,
      away_score_pred: p.awayScore,
      points_earned: null,
      calculated: false,
      created_at: '',
      updated_at: '',
    })
  }
  return map
}
