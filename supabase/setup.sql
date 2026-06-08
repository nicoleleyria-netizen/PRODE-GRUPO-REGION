-- =====================================================
-- PRODE MUNDIAL 2026 — SETUP COMPLETO
-- Pegar TODO esto en Supabase → SQL Editor → Run.
-- Borra y recrea todo (no hay datos reales todavía).
-- =====================================================

-- ---------- RESET ----------
DROP VIEW IF EXISTS rankings CASCADE;
DROP VIEW IF EXISTS argentina_rankings CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS argentina_scorer_predictions CASCADE;
DROP TABLE IF EXISTS predictions CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS sectors CASCADE;

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

-- ========== SEED ==========
-- =====================================================
-- PRODE MUNDIAL 2026 - Seed Data (OFICIAL)
-- Generado automáticamente desde src/data/worldcup2026.ts
-- Equipos, fixture completo (104 partidos) y cuadro de eliminación.
-- IDs alineados con el archivo TS (match_number = id).
-- =====================================================

-- =====================================================
-- SECTORES (adaptar a Grupo Región)
-- =====================================================
INSERT INTO sectors (name) VALUES
  ('Administración'),
  ('Comercial'),
  ('Redacción'),
  ('Tecnología'),
  ('Marketing'),
  ('Recursos Humanos'),
  ('Operaciones'),
  ('Gerencia')
ON CONFLICT DO NOTHING;

-- =====================================================
-- EQUIPOS - 48 selecciones (IDs explícitos 1-48)
-- =====================================================
INSERT INTO teams (id, name, short_name, flag_emoji, group_letter) VALUES
  (1, 'México', 'MEX', '🇲🇽', 'A'),
  (2, 'Sudáfrica', 'RSA', '🇿🇦', 'A'),
  (3, 'Corea del Sur', 'KOR', '🇰🇷', 'A'),
  (4, 'Chequia', 'CZE', '🇨🇿', 'A'),
  (5, 'Canadá', 'CAN', '🇨🇦', 'B'),
  (6, 'Catar', 'QAT', '🇶🇦', 'B'),
  (7, 'Suiza', 'SUI', '🇨🇭', 'B'),
  (8, 'Bosnia y Herzegovina', 'BIH', '🇧🇦', 'B'),
  (9, 'Brasil', 'BRA', '🇧🇷', 'C'),
  (10, 'Marruecos', 'MAR', '🇲🇦', 'C'),
  (11, 'Haití', 'HAI', '🇭🇹', 'C'),
  (12, 'Escocia', 'SCO', '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'C'),
  (13, 'Estados Unidos', 'USA', '🇺🇸', 'D'),
  (14, 'Paraguay', 'PAR', '🇵🇾', 'D'),
  (15, 'Turquía', 'TUR', '🇹🇷', 'D'),
  (16, 'Australia', 'AUS', '🇦🇺', 'D'),
  (17, 'Alemania', 'GER', '🇩🇪', 'E'),
  (18, 'Curazao', 'CUW', '🇨🇼', 'E'),
  (19, 'Costa de Marfil', 'CIV', '🇨🇮', 'E'),
  (20, 'Ecuador', 'ECU', '🇪🇨', 'E'),
  (21, 'Países Bajos', 'NED', '🇳🇱', 'F'),
  (22, 'Japón', 'JPN', '🇯🇵', 'F'),
  (23, 'Suecia', 'SWE', '🇸🇪', 'F'),
  (24, 'Túnez', 'TUN', '🇹🇳', 'F'),
  (25, 'Bélgica', 'BEL', '🇧🇪', 'G'),
  (26, 'Egipto', 'EGY', '🇪🇬', 'G'),
  (27, 'Irán', 'IRN', '🇮🇷', 'G'),
  (28, 'Nueva Zelanda', 'NZL', '🇳🇿', 'G'),
  (29, 'España', 'ESP', '🇪🇸', 'H'),
  (30, 'Cabo Verde', 'CPV', '🇨🇻', 'H'),
  (31, 'Arabia Saudita', 'KSA', '🇸🇦', 'H'),
  (32, 'Uruguay', 'URU', '🇺🇾', 'H'),
  (33, 'Francia', 'FRA', '🇫🇷', 'I'),
  (34, 'Senegal', 'SEN', '🇸🇳', 'I'),
  (35, 'Irak', 'IRQ', '🇮🇶', 'I'),
  (36, 'Noruega', 'NOR', '🇳🇴', 'I'),
  (37, 'Argentina', 'ARG', '🇦🇷', 'J'),
  (38, 'Argelia', 'ALG', '🇩🇿', 'J'),
  (39, 'Austria', 'AUT', '🇦🇹', 'J'),
  (40, 'Jordania', 'JOR', '🇯🇴', 'J'),
  (41, 'Portugal', 'POR', '🇵🇹', 'K'),
  (42, 'Colombia', 'COL', '🇨🇴', 'K'),
  (43, 'Uzbekistán', 'UZB', '🇺🇿', 'K'),
  (44, 'RD Congo', 'COD', '🇨🇩', 'K'),
  (45, 'Inglaterra', 'ENG', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'L'),
  (46, 'Croacia', 'CRO', '🇭🇷', 'L'),
  (47, 'Ghana', 'GHA', '🇬🇭', 'L'),
  (48, 'Panamá', 'PAN', '🇵🇦', 'L')
ON CONFLICT (id) DO NOTHING;

SELECT setval(pg_get_serial_sequence('teams','id'), 48);

-- =====================================================
-- FASE DE GRUPOS - 72 partidos (IDs 1-72)
-- match_date = hora local de la sede
-- =====================================================
INSERT INTO matches (id, home_team_id, away_team_id, match_date, stadium, city, country, phase, group_letter, match_number) VALUES
  (1, 1, 2, '2026-06-11 13:00:00', 'Mexico City Stadium', 'Ciudad de México', 'México', 'group', 'A', 1),
  (2, 3, 4, '2026-06-11 20:00:00', 'Guadalajara Stadium', 'Guadalajara', 'México', 'group', 'A', 2),
  (3, 5, 8, '2026-06-12 15:00:00', 'Toronto Stadium', 'Toronto', 'Canadá', 'group', 'B', 3),
  (4, 13, 14, '2026-06-12 18:00:00', 'Los Angeles Stadium', 'Inglewood', 'Estados Unidos', 'group', 'D', 4),
  (5, 11, 12, '2026-06-13 21:00:00', 'Boston Stadium', 'Foxborough', 'Estados Unidos', 'group', 'C', 5),
  (6, 15, 16, '2026-06-13 21:00:00', 'BC Place Vancouver', 'Vancouver', 'Canadá', 'group', 'D', 6),
  (7, 9, 10, '2026-06-13 18:00:00', 'New York New Jersey Stadium', 'East Rutherford', 'Estados Unidos', 'group', 'C', 7),
  (8, 6, 7, '2026-06-13 12:00:00', 'San Francisco Bay Area Stadium', 'Santa Clara', 'Estados Unidos', 'group', 'B', 8),
  (9, 19, 20, '2026-06-14 19:00:00', 'Philadelphia Stadium', 'Philadelphia', 'Estados Unidos', 'group', 'E', 9),
  (10, 17, 18, '2026-06-14 12:00:00', 'Houston Stadium', 'Houston', 'Estados Unidos', 'group', 'E', 10),
  (11, 21, 22, '2026-06-14 15:00:00', 'Dallas Stadium', 'Arlington', 'Estados Unidos', 'group', 'F', 11),
  (12, 23, 24, '2026-06-14 20:00:00', 'Monterrey Stadium', 'Guadalupe', 'México', 'group', 'F', 12),
  (13, 31, 32, '2026-06-15 18:00:00', 'Miami Stadium', 'Miami Gardens', 'Estados Unidos', 'group', 'H', 13),
  (14, 29, 30, '2026-06-15 12:00:00', 'Atlanta Stadium', 'Atlanta', 'Estados Unidos', 'group', 'H', 14),
  (15, 27, 28, '2026-06-15 18:00:00', 'Los Angeles Stadium', 'Inglewood', 'Estados Unidos', 'group', 'G', 15),
  (16, 25, 26, '2026-06-15 12:00:00', 'Seattle Stadium', 'Seattle', 'Estados Unidos', 'group', 'G', 16),
  (17, 33, 34, '2026-06-16 15:00:00', 'New York New Jersey Stadium', 'East Rutherford', 'Estados Unidos', 'group', 'I', 17),
  (18, 35, 36, '2026-06-16 18:00:00', 'Boston Stadium', 'Foxborough', 'Estados Unidos', 'group', 'I', 18),
  (19, 37, 38, '2026-06-16 20:00:00', 'Kansas City Stadium', 'Kansas City', 'Estados Unidos', 'group', 'J', 19),
  (20, 39, 40, '2026-06-16 21:00:00', 'San Francisco Bay Area Stadium', 'Santa Clara', 'Estados Unidos', 'group', 'J', 20),
  (21, 47, 48, '2026-06-17 19:00:00', 'Toronto Stadium', 'Toronto', 'Canadá', 'group', 'L', 21),
  (22, 45, 46, '2026-06-17 15:00:00', 'Dallas Stadium', 'Arlington', 'Estados Unidos', 'group', 'L', 22),
  (23, 44, 41, '2026-06-17 12:00:00', 'Houston Stadium', 'Houston', 'Estados Unidos', 'group', 'K', 23),
  (24, 43, 42, '2026-06-17 20:00:00', 'Mexico City Stadium', 'Ciudad de México', 'México', 'group', 'K', 24),
  (25, 4, 2, '2026-06-18 12:00:00', 'Atlanta Stadium', 'Atlanta', 'Estados Unidos', 'group', 'A', 25),
  (26, 8, 7, '2026-06-18 12:00:00', 'Los Angeles Stadium', 'Inglewood', 'Estados Unidos', 'group', 'B', 26),
  (27, 5, 6, '2026-06-18 15:00:00', 'BC Place Vancouver', 'Vancouver', 'Canadá', 'group', 'B', 27),
  (28, 1, 3, '2026-06-18 19:00:00', 'Guadalajara Stadium', 'Guadalajara', 'México', 'group', 'A', 28),
  (29, 11, 9, '2026-06-19 20:30:00', 'Philadelphia Stadium', 'Philadelphia', 'Estados Unidos', 'group', 'C', 29),
  (30, 12, 10, '2026-06-19 18:00:00', 'Boston Stadium', 'Foxborough', 'Estados Unidos', 'group', 'C', 30),
  (31, 14, 15, '2026-06-19 20:00:00', 'San Francisco Bay Area Stadium', 'Santa Clara', 'Estados Unidos', 'group', 'D', 31),
  (32, 13, 16, '2026-06-19 12:00:00', 'Seattle Stadium', 'Seattle', 'Estados Unidos', 'group', 'D', 32),
  (33, 17, 19, '2026-06-20 16:00:00', 'Toronto Stadium', 'Toronto', 'Canadá', 'group', 'E', 33),
  (34, 20, 18, '2026-06-20 19:00:00', 'Kansas City Stadium', 'Kansas City', 'Estados Unidos', 'group', 'E', 34),
  (35, 23, 21, '2026-06-20 12:00:00', 'Houston Stadium', 'Houston', 'Estados Unidos', 'group', 'F', 35),
  (36, 24, 22, '2026-06-20 22:00:00', 'Monterrey Stadium', 'Guadalupe', 'México', 'group', 'F', 36),
  (37, 32, 30, '2026-06-21 18:00:00', 'Miami Stadium', 'Miami Gardens', 'Estados Unidos', 'group', 'H', 37),
  (38, 29, 31, '2026-06-21 12:00:00', 'Atlanta Stadium', 'Atlanta', 'Estados Unidos', 'group', 'H', 38),
  (39, 25, 27, '2026-06-21 12:00:00', 'Los Angeles Stadium', 'Inglewood', 'Estados Unidos', 'group', 'G', 39),
  (40, 28, 26, '2026-06-21 18:00:00', 'BC Place Vancouver', 'Vancouver', 'Canadá', 'group', 'G', 40),
  (41, 36, 34, '2026-06-22 20:00:00', 'New York New Jersey Stadium', 'East Rutherford', 'Estados Unidos', 'group', 'I', 41),
  (42, 35, 33, '2026-06-22 17:00:00', 'Philadelphia Stadium', 'Philadelphia', 'Estados Unidos', 'group', 'I', 42),
  (43, 37, 39, '2026-06-22 12:00:00', 'Dallas Stadium', 'Arlington', 'Estados Unidos', 'group', 'J', 43),
  (44, 40, 38, '2026-06-22 20:00:00', 'San Francisco Bay Area Stadium', 'Santa Clara', 'Estados Unidos', 'group', 'J', 44),
  (45, 45, 47, '2026-06-23 16:00:00', 'Boston Stadium', 'Foxborough', 'Estados Unidos', 'group', 'L', 45),
  (46, 48, 46, '2026-06-23 19:00:00', 'Toronto Stadium', 'Toronto', 'Canadá', 'group', 'L', 46),
  (47, 41, 43, '2026-06-23 12:00:00', 'Houston Stadium', 'Houston', 'Estados Unidos', 'group', 'K', 47),
  (48, 44, 42, '2026-06-23 20:00:00', 'Guadalajara Stadium', 'Guadalajara', 'México', 'group', 'K', 48),
  (49, 12, 9, '2026-06-24 18:00:00', 'Miami Stadium', 'Miami Gardens', 'Estados Unidos', 'group', 'C', 49),
  (50, 10, 11, '2026-06-24 18:00:00', 'Atlanta Stadium', 'Atlanta', 'Estados Unidos', 'group', 'C', 50),
  (51, 7, 5, '2026-06-24 12:00:00', 'BC Place Vancouver', 'Vancouver', 'Canadá', 'group', 'B', 51),
  (52, 8, 6, '2026-06-24 12:00:00', 'Seattle Stadium', 'Seattle', 'Estados Unidos', 'group', 'B', 52),
  (53, 4, 1, '2026-06-24 19:00:00', 'Mexico City Stadium', 'Ciudad de México', 'México', 'group', 'A', 53),
  (54, 2, 3, '2026-06-24 19:00:00', 'Monterrey Stadium', 'Guadalupe', 'México', 'group', 'A', 54),
  (55, 18, 19, '2026-06-25 16:00:00', 'Philadelphia Stadium', 'Philadelphia', 'Estados Unidos', 'group', 'E', 55),
  (56, 20, 17, '2026-06-25 16:00:00', 'New York New Jersey Stadium', 'East Rutherford', 'Estados Unidos', 'group', 'E', 56),
  (57, 23, 22, '2026-06-25 18:00:00', 'Dallas Stadium', 'Arlington', 'Estados Unidos', 'group', 'F', 57),
  (58, 24, 21, '2026-06-25 18:00:00', 'Kansas City Stadium', 'Kansas City', 'Estados Unidos', 'group', 'F', 58),
  (59, 15, 13, '2026-06-25 19:00:00', 'Los Angeles Stadium', 'Inglewood', 'Estados Unidos', 'group', 'D', 59),
  (60, 14, 16, '2026-06-25 19:00:00', 'San Francisco Bay Area Stadium', 'Santa Clara', 'Estados Unidos', 'group', 'D', 60),
  (61, 36, 33, '2026-06-26 15:00:00', 'Boston Stadium', 'Foxborough', 'Estados Unidos', 'group', 'I', 61),
  (62, 35, 34, '2026-06-26 15:00:00', 'Toronto Stadium', 'Toronto', 'Canadá', 'group', 'I', 62),
  (63, 26, 27, '2026-06-26 20:00:00', 'Seattle Stadium', 'Seattle', 'Estados Unidos', 'group', 'G', 63),
  (64, 28, 25, '2026-06-26 20:00:00', 'BC Place Vancouver', 'Vancouver', 'Canadá', 'group', 'G', 64),
  (65, 30, 31, '2026-06-26 19:00:00', 'Houston Stadium', 'Houston', 'Estados Unidos', 'group', 'H', 65),
  (66, 32, 29, '2026-06-26 18:00:00', 'Guadalajara Stadium', 'Guadalajara', 'México', 'group', 'H', 66),
  (67, 48, 45, '2026-06-27 17:00:00', 'New York New Jersey Stadium', 'East Rutherford', 'Estados Unidos', 'group', 'L', 67),
  (68, 46, 47, '2026-06-27 17:00:00', 'Philadelphia Stadium', 'Philadelphia', 'Estados Unidos', 'group', 'L', 68),
  (69, 38, 39, '2026-06-27 21:00:00', 'Kansas City Stadium', 'Kansas City', 'Estados Unidos', 'group', 'J', 69),
  (70, 40, 37, '2026-06-27 21:00:00', 'Dallas Stadium', 'Arlington', 'Estados Unidos', 'group', 'J', 70),
  (71, 42, 41, '2026-06-27 19:30:00', 'Miami Stadium', 'Miami Gardens', 'Estados Unidos', 'group', 'K', 71),
  (72, 44, 43, '2026-06-27 19:30:00', 'Atlanta Stadium', 'Atlanta', 'Estados Unidos', 'group', 'K', 72)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- ELIMINACIÓN DIRECTA - 32 partidos (IDs 73-104)
-- Equipos en NULL hasta conocerse los clasificados reales.
-- home_source/away_source guardan el slot ('1A', '3CEFHI', 'W74', ...)
-- =====================================================
INSERT INTO matches (id, home_team_id, away_team_id, match_date, stadium, city, country, phase, home_source, away_source, match_number) VALUES
  (73, NULL, NULL, '2026-06-28 12:00:00', 'Los Angeles Stadium', 'Inglewood', 'Estados Unidos', 'round_of_32', '2A', '2B', 73),
  (74, NULL, NULL, '2026-06-29 16:30:00', 'Boston Stadium', 'Foxborough', 'Estados Unidos', 'round_of_32', '1E', '3ABCDF', 74),
  (75, NULL, NULL, '2026-06-29 19:00:00', 'Monterrey Stadium', 'Guadalupe', 'México', 'round_of_32', '1F', '2C', 75),
  (76, NULL, NULL, '2026-06-29 12:00:00', 'Houston Stadium', 'Houston', 'Estados Unidos', 'round_of_32', '1C', '2F', 76),
  (77, NULL, NULL, '2026-06-30 17:00:00', 'New York New Jersey Stadium', 'East Rutherford', 'Estados Unidos', 'round_of_32', '1I', '3CDFGH', 77),
  (78, NULL, NULL, '2026-06-30 12:00:00', 'Dallas Stadium', 'Arlington', 'Estados Unidos', 'round_of_32', '2E', '2I', 78),
  (79, NULL, NULL, '2026-06-30 19:00:00', 'Mexico City Stadium', 'Ciudad de México', 'México', 'round_of_32', '1A', '3CEFHI', 79),
  (80, NULL, NULL, '2026-07-01 12:00:00', 'Atlanta Stadium', 'Atlanta', 'Estados Unidos', 'round_of_32', '1L', '3EHIJK', 80),
  (81, NULL, NULL, '2026-07-01 17:00:00', 'San Francisco Bay Area Stadium', 'Santa Clara', 'Estados Unidos', 'round_of_32', '1D', '3BEFIJ', 81),
  (82, NULL, NULL, '2026-07-01 13:00:00', 'Seattle Stadium', 'Seattle', 'Estados Unidos', 'round_of_32', '1G', '3AEHIJ', 82),
  (83, NULL, NULL, '2026-07-02 19:00:00', 'Toronto Stadium', 'Toronto', 'Canadá', 'round_of_32', '2K', '2L', 83),
  (84, NULL, NULL, '2026-07-02 12:00:00', 'Los Angeles Stadium', 'Inglewood', 'Estados Unidos', 'round_of_32', '1H', '2J', 84),
  (85, NULL, NULL, '2026-07-02 20:00:00', 'BC Place Vancouver', 'Vancouver', 'Canadá', 'round_of_32', '1B', '3EFGIJ', 85),
  (86, NULL, NULL, '2026-07-03 18:00:00', 'Miami Stadium', 'Miami Gardens', 'Estados Unidos', 'round_of_32', '1J', '2H', 86),
  (87, NULL, NULL, '2026-07-03 20:30:00', 'Kansas City Stadium', 'Kansas City', 'Estados Unidos', 'round_of_32', '1K', '3DEIJL', 87),
  (88, NULL, NULL, '2026-07-03 13:00:00', 'Dallas Stadium', 'Arlington', 'Estados Unidos', 'round_of_32', '2D', '2G', 88),
  (89, NULL, NULL, '2026-07-04 17:00:00', 'Philadelphia Stadium', 'Philadelphia', 'Estados Unidos', 'round_of_16', 'W74', 'W77', 89),
  (90, NULL, NULL, '2026-07-04 12:00:00', 'Houston Stadium', 'Houston', 'Estados Unidos', 'round_of_16', 'W73', 'W75', 90),
  (91, NULL, NULL, '2026-07-05 16:00:00', 'New York New Jersey Stadium', 'East Rutherford', 'Estados Unidos', 'round_of_16', 'W76', 'W78', 91),
  (92, NULL, NULL, '2026-07-05 18:00:00', 'Mexico City Stadium', 'Ciudad de México', 'México', 'round_of_16', 'W79', 'W80', 92),
  (93, NULL, NULL, '2026-07-06 14:00:00', 'Dallas Stadium', 'Arlington', 'Estados Unidos', 'round_of_16', 'W83', 'W84', 93),
  (94, NULL, NULL, '2026-07-06 17:00:00', 'Seattle Stadium', 'Seattle', 'Estados Unidos', 'round_of_16', 'W81', 'W82', 94),
  (95, NULL, NULL, '2026-07-07 12:00:00', 'Atlanta Stadium', 'Atlanta', 'Estados Unidos', 'round_of_16', 'W86', 'W88', 95),
  (96, NULL, NULL, '2026-07-07 13:00:00', 'BC Place Vancouver', 'Vancouver', 'Canadá', 'round_of_16', 'W85', 'W87', 96),
  (97, NULL, NULL, '2026-07-09 16:00:00', 'Boston Stadium', 'Foxborough', 'Estados Unidos', 'quarter', 'W89', 'W90', 97),
  (98, NULL, NULL, '2026-07-10 12:00:00', 'Los Angeles Stadium', 'Inglewood', 'Estados Unidos', 'quarter', 'W93', 'W94', 98),
  (99, NULL, NULL, '2026-07-11 17:00:00', 'Miami Stadium', 'Miami Gardens', 'Estados Unidos', 'quarter', 'W91', 'W92', 99),
  (100, NULL, NULL, '2026-07-11 20:00:00', 'Kansas City Stadium', 'Kansas City', 'Estados Unidos', 'quarter', 'W95', 'W96', 100),
  (101, NULL, NULL, '2026-07-14 14:00:00', 'Dallas Stadium', 'Arlington', 'Estados Unidos', 'semi', 'W97', 'W98', 101),
  (102, NULL, NULL, '2026-07-15 15:00:00', 'Atlanta Stadium', 'Atlanta', 'Estados Unidos', 'semi', 'W99', 'W100', 102),
  (103, NULL, NULL, '2026-07-18 17:00:00', 'Miami Stadium', 'Miami Gardens', 'Estados Unidos', 'third_place', 'L101', 'L102', 103),
  (104, NULL, NULL, '2026-07-19 15:00:00', 'New York New Jersey Stadium', 'East Rutherford', 'Estados Unidos', 'final', 'W101', 'W102', 104)
ON CONFLICT (id) DO NOTHING;

SELECT setval(pg_get_serial_sequence('matches','id'), 104);

-- =====================================================
-- BADGES
-- =====================================================
INSERT INTO badges (name, description, icon, type, condition_value) VALUES
  ('Primera sangre', 'Cargaste tu primer pronóstico', '⚽', 'first_prediction', 1),
  ('Adivino', 'Acertaste 5 resultados exactos', '🎯', 'exact_scores', 5),
  ('Super adivino', 'Acertaste 10 resultados exactos', '🔮', 'exact_scores', 10),
  ('Albiceleste', 'Acertaste un resultado exacto de Argentina', '🇦🇷', 'argentina_exact', 1),
  ('Campeón argentino', 'Acertaste 3 resultados exactos de Argentina', '🏆', 'argentina_exact', 3),
  ('Constante', 'Pronosticaste 20 partidos', '📅', 'predictions_count', 20),
  ('Completo', 'Pronosticaste todos los partidos de grupos', '🌍', 'all_group_predictions', 1),
  ('Perfecto', 'Acertaste el ganador en 10 partidos seguidos', '✨', 'consecutive_outcomes', 10),
  ('Goleador', 'Acertaste 5 goleadores de Argentina', '⚽', 'scorer_correct', 5),
  ('Lider', 'Llegaste al top 3 del ranking general', '👑', 'top3_rank', 1)
ON CONFLICT DO NOTHING;

-- =====================================================
-- NOTA: Crear usuarios admin desde Supabase Auth.
-- Luego: UPDATE profiles SET role = 'admin' WHERE username = 'tu_usuario';
-- =====================================================
