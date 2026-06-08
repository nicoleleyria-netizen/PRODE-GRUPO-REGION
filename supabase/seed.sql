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
