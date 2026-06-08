// =====================================================
// Motor de simulación del Prode
// - Calcula la tabla de posiciones de cada grupo desde los marcadores predichos
// - Determina 1°, 2° y los 8 mejores terceros (regla FIFA 2026)
// - Resuelve el cuadro de eliminación propagando ganadores/perdedores
// =====================================================
import {
  GROUP_MATCHES, KNOCKOUT_MATCHES, TEAMS, TEAMS_BY_ID,
  type GroupLetter, type WCTeam, type WCKnockoutMatch,
} from '../data/worldcup2026'

/** Predicción de un partido (clave = match_number) */
export interface MatchPick {
  homeScore: number | null
  awayScore: number | null
  /** En eliminatorias, id del equipo que avanza si el marcador es empate (penales) */
  winnerId?: number | null
}

export type Picks = Record<number, MatchPick>

export interface TeamStanding {
  team: WCTeam
  played: number
  won: number
  drawn: number
  lost: number
  gf: number
  ga: number
  gd: number
  points: number
  position: number
}

const GROUP_LETTERS: GroupLetter[] = ['A','B','C','D','E','F','G','H','I','J','K','L']

function hasResult(p?: MatchPick): p is MatchPick & { homeScore: number; awayScore: number } {
  return !!p && p.homeScore !== null && p.awayScore !== null
}

// =====================================================
// TABLA DE POSICIONES
// =====================================================
export function computeGroupStandings(picks: Picks): Record<GroupLetter, TeamStanding[]> {
  const result = {} as Record<GroupLetter, TeamStanding[]>

  for (const letter of GROUP_LETTERS) {
    const teams = TEAMS.filter(t => t.group_letter === letter)
    const rows = new Map<number, TeamStanding>(
      teams.map(t => [t.id, {
        team: t, played: 0, won: 0, drawn: 0, lost: 0,
        gf: 0, ga: 0, gd: 0, points: 0, position: 0,
      }])
    )

    for (const m of GROUP_MATCHES) {
      if (m.group_letter !== letter) continue
      const p = picks[m.match_number]
      if (!hasResult(p)) continue
      const home = rows.get(m.home_id)!
      const away = rows.get(m.away_id)!
      home.played++; away.played++
      home.gf += p.homeScore; home.ga += p.awayScore
      away.gf += p.awayScore; away.ga += p.homeScore
      if (p.homeScore > p.awayScore) {
        home.won++; away.lost++; home.points += 3
      } else if (p.homeScore < p.awayScore) {
        away.won++; home.lost++; away.points += 3
      } else {
        home.drawn++; away.drawn++; home.points++; away.points++
      }
    }

    const ordered = Array.from(rows.values())
    for (const r of ordered) r.gd = r.gf - r.ga
    ordered.sort(cmpStanding)
    ordered.forEach((r, i) => { r.position = i + 1 })
    result[letter] = ordered
  }

  return result
}

// Orden: puntos, diferencia de gol, goles a favor; desempate final estable por id
function cmpStanding(a: TeamStanding, b: TeamStanding): number {
  if (b.points !== a.points) return b.points - a.points
  if (b.gd !== a.gd) return b.gd - a.gd
  if (b.gf !== a.gf) return b.gf - a.gf
  return a.team.id - b.team.id
}

/** ¿Está completa la tabla de un grupo? (los 6 partidos cargados) */
export function isGroupComplete(letter: GroupLetter, picks: Picks): boolean {
  return GROUP_MATCHES
    .filter(m => m.group_letter === letter)
    .every(m => hasResult(picks[m.match_number]))
}

export function areAllGroupsComplete(picks: Picks): boolean {
  return GROUP_LETTERS.every(l => isGroupComplete(l, picks))
}

// =====================================================
// MEJORES TERCEROS (8 de 12)
// =====================================================
export interface ThirdPlace {
  letter: GroupLetter
  standing: TeamStanding
}

export function computeBestThirds(
  standings: Record<GroupLetter, TeamStanding[]>
): { qualified: ThirdPlace[]; all: ThirdPlace[] } {
  const thirds: ThirdPlace[] = GROUP_LETTERS
    .map(letter => ({ letter, standing: standings[letter][2] }))
    .filter(t => !!t.standing)

  const ranked = [...thirds].sort((a, b) => cmpStanding(a.standing, b.standing))
  return { qualified: ranked.slice(0, 8), all: ranked }
}

// Slots de "tercero" en dieciseisavos y los grupos candidatos de cada uno
function thirdSlots(): { matchNumber: number; source: string; groups: GroupLetter[] }[] {
  return KNOCKOUT_MATCHES
    .filter(m => m.phase === 'round_of_32')
    .flatMap(m => [m.home_source, m.away_source].map(src => ({ src, matchNumber: m.match_number })))
    .filter(x => x.src.startsWith('3'))
    .map(x => ({
      matchNumber: x.matchNumber,
      source: x.src,
      groups: x.src.slice(1).split('') as GroupLetter[],
    }))
}

/**
 * Asigna cada tercero clasificado a un slot "3XXXX" respetando los grupos candidatos.
 * Usa emparejamiento bipartito (camino de aumento) para garantizar una asignación válida.
 * Devuelve un mapa source('3ABCDF') -> id de equipo.
 */
export function assignThirds(
  standings: Record<GroupLetter, TeamStanding[]>
): Record<string, number> {
  const { qualified } = computeBestThirds(standings)
  const qualifiedLetters = new Set(qualified.map(q => q.letter))
  const slots = thirdSlots()

  // Emparejamiento bipartito (Kuhn): grupo -> índice de slot que lo usa
  const groupOwner = new Map<GroupLetter, number>()

  function tryKuhn(slotIdx: number, visited: Set<GroupLetter>): boolean {
    for (const g of slots[slotIdx].groups) {
      if (!qualifiedLetters.has(g) || visited.has(g)) continue
      visited.add(g)
      const owner = groupOwner.get(g)
      if (owner === undefined || tryKuhn(owner, visited)) {
        groupOwner.set(g, slotIdx)
        return true
      }
    }
    return false
  }

  slots.forEach((_, i) => tryKuhn(i, new Set()))

  // invertir: slotIndex -> grupo
  const slotGroup: (GroupLetter | undefined)[] = slots.map(() => undefined)
  for (const [g, idx] of groupOwner) slotGroup[idx] = g

  const map: Record<string, number> = {}
  slots.forEach((slot, i) => {
    const g = slotGroup[i]
    if (g) map[slot.source] = standings[g][2].team.id
  })
  return map
}

// =====================================================
// RESOLUCIÓN DEL CUADRO DE ELIMINACIÓN
// =====================================================
export interface ResolvedMatch {
  match: WCKnockoutMatch
  homeId: number | null
  awayId: number | null
  homeScore: number | null
  awayScore: number | null
  winnerId: number | null
  loserId: number | null
}

export interface BracketResult {
  standings: Record<GroupLetter, TeamStanding[]>
  thirdsMap: Record<string, number>
  matches: Record<number, ResolvedMatch>  // por match_number
  championId: number | null
}

export function resolveBracket(picks: Picks): BracketResult {
  const standings = computeGroupStandings(picks)
  const thirdsMap = assignThirds(standings)
  const matches: Record<number, ResolvedMatch> = {}

  const koByNumber = new Map(KNOCKOUT_MATCHES.map(m => [m.match_number, m]))

  function resolveSource(src: string): number | null {
    // 1A / 2B
    const pos = /^([12])([A-L])$/.exec(src)
    if (pos) {
      const idx = Number(pos[1]) - 1
      const letter = pos[2] as GroupLetter
      return standings[letter]?.[idx]?.team.id ?? null
    }
    // 3XXXX
    if (src.startsWith('3')) return thirdsMap[src] ?? null
    // W74 / L101
    const wl = /^([WL])(\d+)$/.exec(src)
    if (wl) {
      const r = resolveMatch(Number(wl[2]))
      return wl[1] === 'W' ? r.winnerId : r.loserId
    }
    return null
  }

  function resolveMatch(n: number): ResolvedMatch {
    if (matches[n]) return matches[n]
    const m = koByNumber.get(n)!
    // placeholder para evitar recursión infinita
    const rm: ResolvedMatch = {
      match: m, homeId: null, awayId: null,
      homeScore: null, awayScore: null, winnerId: null, loserId: null,
    }
    matches[n] = rm

    rm.homeId = resolveSource(m.home_source)
    rm.awayId = resolveSource(m.away_source)

    const p = picks[n]
    if (p && p.homeScore !== null && p.awayScore !== null && rm.homeId && rm.awayId) {
      rm.homeScore = p.homeScore
      rm.awayScore = p.awayScore
      if (p.homeScore > p.awayScore) {
        rm.winnerId = rm.homeId; rm.loserId = rm.awayId
      } else if (p.awayScore > p.homeScore) {
        rm.winnerId = rm.awayId; rm.loserId = rm.homeId
      } else if (p.winnerId && (p.winnerId === rm.homeId || p.winnerId === rm.awayId)) {
        // empate definido por penales
        rm.winnerId = p.winnerId
        rm.loserId = p.winnerId === rm.homeId ? rm.awayId : rm.homeId
      }
    }
    return rm
  }

  KNOCKOUT_MATCHES.forEach(m => resolveMatch(m.match_number))

  const final = matches[104]
  return { standings, thirdsMap, matches, championId: final?.winnerId ?? null }
}

export function teamName(id: number | null): string {
  if (id === null) return ''
  return TEAMS_BY_ID[id]?.name ?? ''
}

export function team(id: number | null): WCTeam | null {
  return id === null ? null : (TEAMS_BY_ID[id] ?? null)
}
