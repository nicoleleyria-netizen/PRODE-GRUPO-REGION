// =====================================================
// Guardado de las predicciones del cuadro (Mi Prode)
// v1: persiste en localStorage por usuario.
// (La sincronización con Supabase queda como paso siguiente.)
// =====================================================
import type { Picks, MatchPick } from './bracket'

const KEY_PREFIX = 'prode_picks_'
const ONBOARDING_PREFIX = 'prode_onboarded_'

function key(userId: string): string {
  return `${KEY_PREFIX}${userId}`
}

export function loadPicks(userId: string): Picks {
  try {
    const raw = localStorage.getItem(key(userId))
    return raw ? (JSON.parse(raw) as Picks) : {}
  } catch {
    return {}
  }
}

export function savePicks(userId: string, picks: Picks): void {
  try {
    localStorage.setItem(key(userId), JSON.stringify(picks))
  } catch {
    /* almacenamiento lleno o no disponible */
  }
}

export function setPick(userId: string, matchNumber: number, pick: MatchPick): Picks {
  const picks = loadPicks(userId)
  picks[matchNumber] = pick
  savePicks(userId, picks)
  return picks
}

export function hasOnboarded(userId: string): boolean {
  return localStorage.getItem(`${ONBOARDING_PREFIX}${userId}`) === 'true'
}

export function markOnboarded(userId: string): void {
  localStorage.setItem(`${ONBOARDING_PREFIX}${userId}`, 'true')
}
