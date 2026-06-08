import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> }
      teams: { Row: Team; Insert: Partial<Team>; Update: Partial<Team> }
      matches: { Row: Match; Insert: Partial<Match>; Update: Partial<Match> }
      predictions: { Row: Prediction; Insert: Partial<Prediction>; Update: Partial<Prediction> }
      argentina_scorer_predictions: { Row: ArgentinaScorerPrediction; Insert: Partial<ArgentinaScorerPrediction>; Update: Partial<ArgentinaScorerPrediction> }
      badges: { Row: Badge; Insert: Partial<Badge>; Update: Partial<Badge> }
      user_badges: { Row: UserBadge; Insert: Partial<UserBadge>; Update: Partial<UserBadge> }
      notifications: { Row: Notification; Insert: Partial<Notification>; Update: Partial<Notification> }
      sectors: { Row: Sector; Insert: Partial<Sector>; Update: Partial<Sector> }
    }
  }
}

type Profile = import('../types').Profile
type Team = import('../types').Team
type Match = import('../types').Match
type Prediction = import('../types').Prediction
type ArgentinaScorerPrediction = import('../types').ArgentinaScorerPrediction
type Badge = import('../types').Badge
type UserBadge = import('../types').UserBadge
type Notification = import('../types').AppNotification
type Sector = import('../types').Sector
