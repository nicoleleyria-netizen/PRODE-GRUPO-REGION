// =====================================================
// Capa de datos de predicciones.
// - Usuario real (Supabase): lee/escribe en la tabla `predictions`.
// - Modo demo: solo localStorage.
// localStorage funciona siempre como caché para UI instantánea.
// =====================================================
import { supabase } from './supabase'
import { loadPicks, savePicks } from '../utils/picksStore'
import type { Picks, MatchPick } from '../utils/bracket'

/** Trae las predicciones del usuario desde Supabase y refresca la caché local. */
export async function hydratePredictions(userId: string): Promise<Picks> {
  const { data, error } = await supabase
    .from('predictions')
    .select('match_id, home_score_pred, away_score_pred, winner_team_id')
    .eq('user_id', userId)

  if (error || !data) return loadPicks(userId)

  const picks: Picks = {}
  for (const r of data as { match_id: number; home_score_pred: number; away_score_pred: number; winner_team_id: number | null }[]) {
    picks[r.match_id] = {
      homeScore: r.home_score_pred,
      awayScore: r.away_score_pred,
      winnerId: r.winner_team_id ?? null,
    }
  }
  savePicks(userId, picks)
  return picks
}

/** Guarda una predicción: caché local siempre + Supabase si es usuario real. */
export async function persistPick(
  userId: string,
  isDemo: boolean,
  matchNumber: number,
  pick: MatchPick,
): Promise<void> {
  // Caché local (optimista, instantánea)
  const picks = loadPicks(userId)
  picks[matchNumber] = pick
  savePicks(userId, picks)

  if (isDemo) return
  if (pick.homeScore === null || pick.awayScore === null) return

  const { error } = await supabase.from('predictions').upsert(
    {
      user_id: userId,
      match_id: matchNumber,
      home_score_pred: pick.homeScore,
      away_score_pred: pick.awayScore,
      winner_team_id: pick.winnerId ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,match_id' },
  )
  if (error) console.warn('No se pudo guardar la predicción en Supabase:', error.message)
}
