-- =====================================================
-- PRODE MUNDIAL 2026 - Grupo Región
-- Schema Supabase
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- SECTORS
-- =====================================================
CREATE TABLE IF NOT EXISTS sectors (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- =====================================================
-- PROFILES (extends auth.users)
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  sector TEXT REFERENCES sectors(name) ON UPDATE CASCADE,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- TEAMS
-- =====================================================
CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  flag_emoji TEXT NOT NULL DEFAULT '🏳️',
  group_letter TEXT NOT NULL CHECK (group_letter IN ('A','B','C','D','E','F','G','H','I','J','K','L')),
  eliminated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- MATCHES
-- =====================================================
CREATE TABLE IF NOT EXISTS matches (
  id SERIAL PRIMARY KEY,
  home_team_id INTEGER REFERENCES teams(id),
  away_team_id INTEGER REFERENCES teams(id),
  home_score INTEGER,
  away_score INTEGER,
  match_date TIMESTAMPTZ NOT NULL,
  stadium TEXT,
  city TEXT,
  country TEXT,
  phase TEXT NOT NULL DEFAULT 'group'
    CHECK (phase IN ('group','round_of_32','round_of_16','quarter','semi','third_place','final')),
  group_letter TEXT,
  -- Origen del equipo en eliminatorias mientras no se conocen los clasificados reales:
  -- '1A', '2B', '3CEFHI' (mejor tercero), 'W74' (ganador M74), 'L101' (perdedor M101)
  home_source TEXT,
  away_source TEXT,
  match_number INTEGER,
  status TEXT DEFAULT 'upcoming'
    CHECK (status IN ('upcoming','live','finished')),
  is_argentina BOOLEAN DEFAULT FALSE,
  argentina_scorers TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-set is_argentina flag
CREATE OR REPLACE FUNCTION set_is_argentina()
RETURNS TRIGGER AS $$
BEGIN
  NEW.is_argentina := EXISTS (
    SELECT 1 FROM teams WHERE id IN (NEW.home_team_id, NEW.away_team_id) AND name = 'Argentina'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_is_argentina ON matches;
CREATE TRIGGER trg_set_is_argentina
  BEFORE INSERT OR UPDATE OF home_team_id, away_team_id ON matches
  FOR EACH ROW EXECUTE FUNCTION set_is_argentina();

-- =====================================================
-- PREDICTIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  match_id INTEGER REFERENCES matches(id) NOT NULL,
  home_score_pred INTEGER NOT NULL CHECK (home_score_pred >= 0),
  away_score_pred INTEGER NOT NULL CHECK (away_score_pred >= 0),
  -- En eliminatorias con empate: equipo que el usuario predice que avanza por penales
  winner_team_id INTEGER REFERENCES teams(id),
  points_earned INTEGER DEFAULT 0,
  calculated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, match_id)
);

-- =====================================================
-- ARGENTINA SCORER PREDICTIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS argentina_scorer_predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  match_id INTEGER REFERENCES matches(id) NOT NULL,
  player_name TEXT NOT NULL,
  is_correct BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, match_id, player_name)
);

-- =====================================================
-- BADGES
-- =====================================================
CREATE TABLE IF NOT EXISTS badges (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  type TEXT NOT NULL,
  condition_value INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  badge_id INTEGER REFERENCES badges(id) NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- =====================================================
-- NOTIFICATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  match_id INTEGER REFERENCES matches(id),
  message TEXT NOT NULL,
  phone TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','sent','failed')),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- RANKINGS VIEW (general)
-- =====================================================
CREATE OR REPLACE VIEW rankings AS
SELECT
  p.id,
  p.username,
  p.full_name,
  p.sector,
  p.avatar_url,
  COALESCE(SUM(pr.points_earned), 0)::INTEGER AS total_points,
  COUNT(pr.id)::INTEGER AS predictions_count,
  COUNT(pr.id) FILTER (WHERE pr.calculated AND pr.home_score_pred = m.home_score AND pr.away_score_pred = m.away_score)::INTEGER AS exact_scores,
  COUNT(pr.id) FILTER (
    WHERE pr.calculated AND (
      (pr.home_score_pred > pr.away_score_pred AND m.home_score > m.away_score) OR
      (pr.home_score_pred < pr.away_score_pred AND m.home_score < m.away_score) OR
      (pr.home_score_pred = pr.away_score_pred AND m.home_score = m.away_score)
    )
  )::INTEGER AS correct_outcomes,
  RANK() OVER (ORDER BY COALESCE(SUM(pr.points_earned), 0) DESC, COUNT(pr.id) DESC) AS rank
FROM profiles p
LEFT JOIN predictions pr ON pr.user_id = p.id AND pr.calculated = TRUE
LEFT JOIN matches m ON m.id = pr.match_id
GROUP BY p.id, p.username, p.full_name, p.sector, p.avatar_url;

-- =====================================================
-- ARGENTINA RANKINGS VIEW (points only from Argentina matches)
-- =====================================================
CREATE OR REPLACE VIEW argentina_rankings AS
SELECT
  p.id,
  p.username,
  p.full_name,
  p.sector,
  p.avatar_url,
  COALESCE(SUM(pr.points_earned), 0)::INTEGER AS total_points,
  COUNT(pr.id)::INTEGER AS predictions_count,
  COUNT(pr.id) FILTER (WHERE pr.calculated AND pr.home_score_pred = m.home_score AND pr.away_score_pred = m.away_score)::INTEGER AS exact_scores,
  0::INTEGER AS correct_outcomes,
  RANK() OVER (ORDER BY COALESCE(SUM(pr.points_earned), 0) DESC) AS rank
FROM profiles p
LEFT JOIN predictions pr ON pr.user_id = p.id AND pr.calculated = TRUE
LEFT JOIN matches m ON m.id = pr.match_id AND m.is_argentina = TRUE
GROUP BY p.id, p.username, p.full_name, p.sector, p.avatar_url;

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE argentina_scorer_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Profiles: read all, edit own
CREATE POLICY "profiles_read_all" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Teams: read only
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "teams_read" ON teams FOR SELECT TO authenticated USING (true);
CREATE POLICY "teams_admin_write" ON teams FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Matches: read all, admin writes
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "matches_read" ON matches FOR SELECT TO authenticated USING (true);
CREATE POLICY "matches_admin_write" ON matches FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Predictions: read all, write own (only before match starts)
CREATE POLICY "predictions_read_all" ON predictions FOR SELECT TO authenticated USING (true);
CREATE POLICY "predictions_insert_own" ON predictions FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM matches WHERE id = match_id AND match_date > NOW() AND status = 'upcoming'
    )
  );
CREATE POLICY "predictions_update_own" ON predictions FOR UPDATE TO authenticated
  USING (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM matches WHERE id = match_id AND match_date > NOW() AND status = 'upcoming'
    )
  );
CREATE POLICY "predictions_admin_update" ON predictions FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Argentina scorer predictions
CREATE POLICY "scorer_preds_read_all" ON argentina_scorer_predictions FOR SELECT TO authenticated USING (true);
CREATE POLICY "scorer_preds_write_own" ON argentina_scorer_predictions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "scorer_preds_delete_own" ON argentina_scorer_predictions FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "scorer_preds_update_admin" ON argentina_scorer_predictions FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Badges
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "badges_read" ON badges FOR SELECT TO authenticated USING (true);
CREATE POLICY "badges_admin_write" ON badges FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "user_badges_read" ON user_badges FOR SELECT TO authenticated USING (true);
CREATE POLICY "user_badges_admin_write" ON user_badges FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Notifications: admin only
CREATE POLICY "notifications_admin" ON notifications FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "notifications_read_own" ON notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Sectors: read all
ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sectors_read" ON sectors FOR SELECT TO authenticated USING (true);
CREATE POLICY "sectors_admin_write" ON sectors FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
