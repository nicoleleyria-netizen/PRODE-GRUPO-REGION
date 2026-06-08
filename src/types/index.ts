export interface Profile {
  id: string
  username: string
  full_name: string | null
  sector: string | null
  phone: string | null
  avatar_url: string | null
  role: 'user' | 'admin'
  created_at: string
}

export interface Sector {
  id: number
  name: string
}

export interface Team {
  id: number
  name: string
  short_name: string
  flag_emoji: string
  group_letter: string
  eliminated: boolean
}

export interface Match {
  id: number
  home_team_id: number
  away_team_id: number
  home_score: number | null
  away_score: number | null
  match_date: string
  stadium: string | null
  city: string | null
  country: string | null
  phase: 'group' | 'round_of_32' | 'round_of_16' | 'quarter' | 'semi' | 'third_place' | 'final'
  group_letter: string | null
  match_number: number | null
  status: 'upcoming' | 'live' | 'finished'
  is_argentina: boolean
  home_team?: Team
  away_team?: Team
  argentina_scorers?: string[]
}

export interface Prediction {
  id: string
  user_id: string
  match_id: number
  home_score_pred: number
  away_score_pred: number
  points_earned: number | null
  calculated: boolean
  created_at: string
  updated_at: string
  match?: Match
}

export interface ArgentinaScorerPrediction {
  id: string
  user_id: string
  match_id: number
  player_name: string
  is_correct: boolean | null
  created_at: string
}

export interface Badge {
  id: number
  name: string
  description: string
  icon: string
  type: string
  condition_value: number | null
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: number
  earned_at: string
  badge?: Badge
}

export interface AppNotification {
  id: string
  user_id: string | null
  match_id: number | null
  message: string
  phone: string | null
  status: 'pending' | 'sent' | 'failed'
  scheduled_at: string | null
  sent_at: string | null
  created_at: string
  match?: Match
  profile?: Profile
}

export interface RankingRow {
  id: string
  username: string
  full_name: string | null
  sector: string | null
  avatar_url: string | null
  total_points: number
  predictions_count: number
  exact_scores: number
  correct_outcomes: number
  rank: number
}

export interface PointsBreakdown {
  participated: number
  correctWinner: number
  correctDraw: number
  exactScore: number
  argentinaBonus: number
  scorerBonus: number
  total: number
}

export type MatchPhase = Match['phase']
export type MatchStatus = Match['status']
