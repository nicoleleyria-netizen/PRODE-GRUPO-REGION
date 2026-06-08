// =====================================================
// COPA MUNDIAL FIFA 2026 — Datos oficiales
// Fuente: FIFA.com / FIFA World Cup 2026™
// Grupos, fixture completo (104 partidos) y cuadro de eliminación.
// Horarios cargados como hora local de la sede.
// Este archivo es la fuente de verdad del fixture en la app.
// =====================================================

export type GroupLetter =
  | 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
  | 'G' | 'H' | 'I' | 'J' | 'K' | 'L'

export type KnockoutStage =
  | 'round_of_32' | 'round_of_16' | 'quarter' | 'semi' | 'third_place' | 'final'

export interface WCTeam {
  id: number
  name: string        // Nombre en español (display)
  short_name: string  // Código de 3 letras
  flag_emoji: string
  group_letter: GroupLetter
  en: string          // Nombre en inglés (clave para el fixture oficial)
}

export interface WCGroupMatch {
  match_number: number
  phase: 'group'
  group_letter: GroupLetter
  date: string        // YYYY-MM-DD
  local_time: string  // HH:mm (hora local de la sede)
  home_id: number
  away_id: number
  stadium: string
  city: string
  country: string
}

export interface WCKnockoutMatch {
  match_number: number
  phase: KnockoutStage
  date: string
  local_time: string
  /** Origen del equipo: '1A', '2B', '3ABCDF' (mejor tercero), 'W74' (ganador M74), 'L101' (perdedor M101) */
  home_source: string
  away_source: string
  stadium: string
  city: string
  country: string
}

// =====================================================
// EQUIPOS — 48 selecciones, 12 grupos
// =====================================================
export const TEAMS: WCTeam[] = [
  // GRUPO A
  { id: 1, name: 'México', short_name: 'MEX', flag_emoji: '🇲🇽', group_letter: 'A', en: 'Mexico' },
  { id: 2, name: 'Sudáfrica', short_name: 'RSA', flag_emoji: '🇿🇦', group_letter: 'A', en: 'South Africa' },
  { id: 3, name: 'Corea del Sur', short_name: 'KOR', flag_emoji: '🇰🇷', group_letter: 'A', en: 'Korea Republic' },
  { id: 4, name: 'Chequia', short_name: 'CZE', flag_emoji: '🇨🇿', group_letter: 'A', en: 'Czechia' },
  // GRUPO B
  { id: 5, name: 'Canadá', short_name: 'CAN', flag_emoji: '🇨🇦', group_letter: 'B', en: 'Canada' },
  { id: 6, name: 'Catar', short_name: 'QAT', flag_emoji: '🇶🇦', group_letter: 'B', en: 'Qatar' },
  { id: 7, name: 'Suiza', short_name: 'SUI', flag_emoji: '🇨🇭', group_letter: 'B', en: 'Switzerland' },
  { id: 8, name: 'Bosnia y Herzegovina', short_name: 'BIH', flag_emoji: '🇧🇦', group_letter: 'B', en: 'Bosnia & Herzegovina' },
  // GRUPO C
  { id: 9, name: 'Brasil', short_name: 'BRA', flag_emoji: '🇧🇷', group_letter: 'C', en: 'Brazil' },
  { id: 10, name: 'Marruecos', short_name: 'MAR', flag_emoji: '🇲🇦', group_letter: 'C', en: 'Morocco' },
  { id: 11, name: 'Haití', short_name: 'HAI', flag_emoji: '🇭🇹', group_letter: 'C', en: 'Haiti' },
  { id: 12, name: 'Escocia', short_name: 'SCO', flag_emoji: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', group_letter: 'C', en: 'Scotland' },
  // GRUPO D
  { id: 13, name: 'Estados Unidos', short_name: 'USA', flag_emoji: '🇺🇸', group_letter: 'D', en: 'United States' },
  { id: 14, name: 'Paraguay', short_name: 'PAR', flag_emoji: '🇵🇾', group_letter: 'D', en: 'Paraguay' },
  { id: 15, name: 'Turquía', short_name: 'TUR', flag_emoji: '🇹🇷', group_letter: 'D', en: 'Türkiye' },
  { id: 16, name: 'Australia', short_name: 'AUS', flag_emoji: '🇦🇺', group_letter: 'D', en: 'Australia' },
  // GRUPO E
  { id: 17, name: 'Alemania', short_name: 'GER', flag_emoji: '🇩🇪', group_letter: 'E', en: 'Germany' },
  { id: 18, name: 'Curazao', short_name: 'CUW', flag_emoji: '🇨🇼', group_letter: 'E', en: 'Curaçao' },
  { id: 19, name: 'Costa de Marfil', short_name: 'CIV', flag_emoji: '🇨🇮', group_letter: 'E', en: "Côte d'Ivoire" },
  { id: 20, name: 'Ecuador', short_name: 'ECU', flag_emoji: '🇪🇨', group_letter: 'E', en: 'Ecuador' },
  // GRUPO F
  { id: 21, name: 'Países Bajos', short_name: 'NED', flag_emoji: '🇳🇱', group_letter: 'F', en: 'Netherlands' },
  { id: 22, name: 'Japón', short_name: 'JPN', flag_emoji: '🇯🇵', group_letter: 'F', en: 'Japan' },
  { id: 23, name: 'Suecia', short_name: 'SWE', flag_emoji: '🇸🇪', group_letter: 'F', en: 'Sweden' },
  { id: 24, name: 'Túnez', short_name: 'TUN', flag_emoji: '🇹🇳', group_letter: 'F', en: 'Tunisia' },
  // GRUPO G
  { id: 25, name: 'Bélgica', short_name: 'BEL', flag_emoji: '🇧🇪', group_letter: 'G', en: 'Belgium' },
  { id: 26, name: 'Egipto', short_name: 'EGY', flag_emoji: '🇪🇬', group_letter: 'G', en: 'Egypt' },
  { id: 27, name: 'Irán', short_name: 'IRN', flag_emoji: '🇮🇷', group_letter: 'G', en: 'IR Iran' },
  { id: 28, name: 'Nueva Zelanda', short_name: 'NZL', flag_emoji: '🇳🇿', group_letter: 'G', en: 'New Zealand' },
  // GRUPO H
  { id: 29, name: 'España', short_name: 'ESP', flag_emoji: '🇪🇸', group_letter: 'H', en: 'Spain' },
  { id: 30, name: 'Cabo Verde', short_name: 'CPV', flag_emoji: '🇨🇻', group_letter: 'H', en: 'Cabo Verde' },
  { id: 31, name: 'Arabia Saudita', short_name: 'KSA', flag_emoji: '🇸🇦', group_letter: 'H', en: 'Saudi Arabia' },
  { id: 32, name: 'Uruguay', short_name: 'URU', flag_emoji: '🇺🇾', group_letter: 'H', en: 'Uruguay' },
  // GRUPO I
  { id: 33, name: 'Francia', short_name: 'FRA', flag_emoji: '🇫🇷', group_letter: 'I', en: 'France' },
  { id: 34, name: 'Senegal', short_name: 'SEN', flag_emoji: '🇸🇳', group_letter: 'I', en: 'Senegal' },
  { id: 35, name: 'Irak', short_name: 'IRQ', flag_emoji: '🇮🇶', group_letter: 'I', en: 'Iraq' },
  { id: 36, name: 'Noruega', short_name: 'NOR', flag_emoji: '🇳🇴', group_letter: 'I', en: 'Norway' },
  // GRUPO J
  { id: 37, name: 'Argentina', short_name: 'ARG', flag_emoji: '🇦🇷', group_letter: 'J', en: 'Argentina' },
  { id: 38, name: 'Argelia', short_name: 'ALG', flag_emoji: '🇩🇿', group_letter: 'J', en: 'Algeria' },
  { id: 39, name: 'Austria', short_name: 'AUT', flag_emoji: '🇦🇹', group_letter: 'J', en: 'Austria' },
  { id: 40, name: 'Jordania', short_name: 'JOR', flag_emoji: '🇯🇴', group_letter: 'J', en: 'Jordan' },
  // GRUPO K
  { id: 41, name: 'Portugal', short_name: 'POR', flag_emoji: '🇵🇹', group_letter: 'K', en: 'Portugal' },
  { id: 42, name: 'Colombia', short_name: 'COL', flag_emoji: '🇨🇴', group_letter: 'K', en: 'Colombia' },
  { id: 43, name: 'Uzbekistán', short_name: 'UZB', flag_emoji: '🇺🇿', group_letter: 'K', en: 'Uzbekistan' },
  { id: 44, name: 'RD Congo', short_name: 'COD', flag_emoji: '🇨🇩', group_letter: 'K', en: 'Congo DR' },
  // GRUPO L
  { id: 45, name: 'Inglaterra', short_name: 'ENG', flag_emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', group_letter: 'L', en: 'England' },
  { id: 46, name: 'Croacia', short_name: 'CRO', flag_emoji: '🇭🇷', group_letter: 'L', en: 'Croatia' },
  { id: 47, name: 'Ghana', short_name: 'GHA', flag_emoji: '🇬🇭', group_letter: 'L', en: 'Ghana' },
  { id: 48, name: 'Panamá', short_name: 'PAN', flag_emoji: '🇵🇦', group_letter: 'L', en: 'Panama' },
]

export const TEAMS_BY_ID: Record<number, WCTeam> = Object.fromEntries(
  TEAMS.map(t => [t.id, t])
)

const ID_BY_EN: Record<string, number> = Object.fromEntries(
  TEAMS.map(t => [t.en, t.id])
)

function tid(en: string): number {
  const id = ID_BY_EN[en]
  if (id === undefined) throw new Error(`Equipo desconocido en fixture: ${en}`)
  return id
}

// Normaliza el país a español
function gm(
  n: number, g: GroupLetter, date: string, time: string,
  home: string, away: string, stadium: string, city: string, country: string
): WCGroupMatch {
  return {
    match_number: n, phase: 'group', group_letter: g, date, local_time: time,
    home_id: tid(home), away_id: tid(away), stadium, city, country,
  }
}

function km(
  n: number, phase: KnockoutStage, date: string, time: string,
  home_source: string, away_source: string, stadium: string, city: string, country: string
): WCKnockoutMatch {
  return { match_number: n, phase, date, local_time: time, home_source, away_source, stadium, city, country }
}

const US = 'Estados Unidos'
const CA = 'Canadá'
const MX = 'México'

// =====================================================
// FASE DE GRUPOS — 72 partidos (M1–M72)
// =====================================================
export const GROUP_MATCHES: WCGroupMatch[] = [
  gm(1, 'A', '2026-06-11', '13:00', 'Mexico', 'South Africa', 'Mexico City Stadium', 'Ciudad de México', MX),
  gm(2, 'A', '2026-06-11', '20:00', 'Korea Republic', 'Czechia', 'Guadalajara Stadium', 'Guadalajara', MX),
  gm(3, 'B', '2026-06-12', '15:00', 'Canada', 'Bosnia & Herzegovina', 'Toronto Stadium', 'Toronto', CA),
  gm(4, 'D', '2026-06-12', '18:00', 'United States', 'Paraguay', 'Los Angeles Stadium', 'Inglewood', US),
  gm(5, 'C', '2026-06-13', '21:00', 'Haiti', 'Scotland', 'Boston Stadium', 'Foxborough', US),
  gm(6, 'D', '2026-06-13', '21:00', 'Türkiye', 'Australia', 'BC Place Vancouver', 'Vancouver', CA),
  gm(7, 'C', '2026-06-13', '18:00', 'Brazil', 'Morocco', 'New York New Jersey Stadium', 'East Rutherford', US),
  gm(8, 'B', '2026-06-13', '12:00', 'Qatar', 'Switzerland', 'San Francisco Bay Area Stadium', 'Santa Clara', US),
  gm(9, 'E', '2026-06-14', '19:00', "Côte d'Ivoire", 'Ecuador', 'Philadelphia Stadium', 'Philadelphia', US),
  gm(10, 'E', '2026-06-14', '12:00', 'Germany', 'Curaçao', 'Houston Stadium', 'Houston', US),
  gm(11, 'F', '2026-06-14', '15:00', 'Netherlands', 'Japan', 'Dallas Stadium', 'Arlington', US),
  gm(12, 'F', '2026-06-14', '20:00', 'Sweden', 'Tunisia', 'Monterrey Stadium', 'Guadalupe', MX),
  gm(13, 'H', '2026-06-15', '18:00', 'Saudi Arabia', 'Uruguay', 'Miami Stadium', 'Miami Gardens', US),
  gm(14, 'H', '2026-06-15', '12:00', 'Spain', 'Cabo Verde', 'Atlanta Stadium', 'Atlanta', US),
  gm(15, 'G', '2026-06-15', '18:00', 'IR Iran', 'New Zealand', 'Los Angeles Stadium', 'Inglewood', US),
  gm(16, 'G', '2026-06-15', '12:00', 'Belgium', 'Egypt', 'Seattle Stadium', 'Seattle', US),
  gm(17, 'I', '2026-06-16', '15:00', 'France', 'Senegal', 'New York New Jersey Stadium', 'East Rutherford', US),
  gm(18, 'I', '2026-06-16', '18:00', 'Iraq', 'Norway', 'Boston Stadium', 'Foxborough', US),
  gm(19, 'J', '2026-06-16', '20:00', 'Argentina', 'Algeria', 'Kansas City Stadium', 'Kansas City', US),
  gm(20, 'J', '2026-06-16', '21:00', 'Austria', 'Jordan', 'San Francisco Bay Area Stadium', 'Santa Clara', US),
  gm(21, 'L', '2026-06-17', '19:00', 'Ghana', 'Panama', 'Toronto Stadium', 'Toronto', CA),
  gm(22, 'L', '2026-06-17', '15:00', 'England', 'Croatia', 'Dallas Stadium', 'Arlington', US),
  gm(23, 'K', '2026-06-17', '12:00', 'Congo DR', 'Portugal', 'Houston Stadium', 'Houston', US),
  gm(24, 'K', '2026-06-17', '20:00', 'Uzbekistan', 'Colombia', 'Mexico City Stadium', 'Ciudad de México', MX),
  gm(25, 'A', '2026-06-18', '12:00', 'Czechia', 'South Africa', 'Atlanta Stadium', 'Atlanta', US),
  gm(26, 'B', '2026-06-18', '12:00', 'Bosnia & Herzegovina', 'Switzerland', 'Los Angeles Stadium', 'Inglewood', US),
  gm(27, 'B', '2026-06-18', '15:00', 'Canada', 'Qatar', 'BC Place Vancouver', 'Vancouver', CA),
  gm(28, 'A', '2026-06-18', '19:00', 'Mexico', 'Korea Republic', 'Guadalajara Stadium', 'Guadalajara', MX),
  gm(29, 'C', '2026-06-19', '20:30', 'Haiti', 'Brazil', 'Philadelphia Stadium', 'Philadelphia', US),
  gm(30, 'C', '2026-06-19', '18:00', 'Scotland', 'Morocco', 'Boston Stadium', 'Foxborough', US),
  gm(31, 'D', '2026-06-19', '20:00', 'Paraguay', 'Türkiye', 'San Francisco Bay Area Stadium', 'Santa Clara', US),
  gm(32, 'D', '2026-06-19', '12:00', 'United States', 'Australia', 'Seattle Stadium', 'Seattle', US),
  gm(33, 'E', '2026-06-20', '16:00', 'Germany', "Côte d'Ivoire", 'Toronto Stadium', 'Toronto', CA),
  gm(34, 'E', '2026-06-20', '19:00', 'Ecuador', 'Curaçao', 'Kansas City Stadium', 'Kansas City', US),
  gm(35, 'F', '2026-06-20', '12:00', 'Sweden', 'Netherlands', 'Houston Stadium', 'Houston', US),
  gm(36, 'F', '2026-06-20', '22:00', 'Tunisia', 'Japan', 'Monterrey Stadium', 'Guadalupe', MX),
  gm(37, 'H', '2026-06-21', '18:00', 'Uruguay', 'Cabo Verde', 'Miami Stadium', 'Miami Gardens', US),
  gm(38, 'H', '2026-06-21', '12:00', 'Spain', 'Saudi Arabia', 'Atlanta Stadium', 'Atlanta', US),
  gm(39, 'G', '2026-06-21', '12:00', 'Belgium', 'IR Iran', 'Los Angeles Stadium', 'Inglewood', US),
  gm(40, 'G', '2026-06-21', '18:00', 'New Zealand', 'Egypt', 'BC Place Vancouver', 'Vancouver', CA),
  gm(41, 'I', '2026-06-22', '20:00', 'Norway', 'Senegal', 'New York New Jersey Stadium', 'East Rutherford', US),
  gm(42, 'I', '2026-06-22', '17:00', 'Iraq', 'France', 'Philadelphia Stadium', 'Philadelphia', US),
  gm(43, 'J', '2026-06-22', '12:00', 'Argentina', 'Austria', 'Dallas Stadium', 'Arlington', US),
  gm(44, 'J', '2026-06-22', '20:00', 'Jordan', 'Algeria', 'San Francisco Bay Area Stadium', 'Santa Clara', US),
  gm(45, 'L', '2026-06-23', '16:00', 'England', 'Ghana', 'Boston Stadium', 'Foxborough', US),
  gm(46, 'L', '2026-06-23', '19:00', 'Panama', 'Croatia', 'Toronto Stadium', 'Toronto', CA),
  gm(47, 'K', '2026-06-23', '12:00', 'Portugal', 'Uzbekistan', 'Houston Stadium', 'Houston', US),
  gm(48, 'K', '2026-06-23', '20:00', 'Congo DR', 'Colombia', 'Guadalajara Stadium', 'Guadalajara', MX),
  gm(49, 'C', '2026-06-24', '18:00', 'Scotland', 'Brazil', 'Miami Stadium', 'Miami Gardens', US),
  gm(50, 'C', '2026-06-24', '18:00', 'Morocco', 'Haiti', 'Atlanta Stadium', 'Atlanta', US),
  gm(51, 'B', '2026-06-24', '12:00', 'Switzerland', 'Canada', 'BC Place Vancouver', 'Vancouver', CA),
  gm(52, 'B', '2026-06-24', '12:00', 'Bosnia & Herzegovina', 'Qatar', 'Seattle Stadium', 'Seattle', US),
  gm(53, 'A', '2026-06-24', '19:00', 'Czechia', 'Mexico', 'Mexico City Stadium', 'Ciudad de México', MX),
  gm(54, 'A', '2026-06-24', '19:00', 'South Africa', 'Korea Republic', 'Monterrey Stadium', 'Guadalupe', MX),
  gm(55, 'E', '2026-06-25', '16:00', 'Curaçao', "Côte d'Ivoire", 'Philadelphia Stadium', 'Philadelphia', US),
  gm(56, 'E', '2026-06-25', '16:00', 'Ecuador', 'Germany', 'New York New Jersey Stadium', 'East Rutherford', US),
  gm(57, 'F', '2026-06-25', '18:00', 'Sweden', 'Japan', 'Dallas Stadium', 'Arlington', US),
  gm(58, 'F', '2026-06-25', '18:00', 'Tunisia', 'Netherlands', 'Kansas City Stadium', 'Kansas City', US),
  gm(59, 'D', '2026-06-25', '19:00', 'Türkiye', 'United States', 'Los Angeles Stadium', 'Inglewood', US),
  gm(60, 'D', '2026-06-25', '19:00', 'Paraguay', 'Australia', 'San Francisco Bay Area Stadium', 'Santa Clara', US),
  gm(61, 'I', '2026-06-26', '15:00', 'Norway', 'France', 'Boston Stadium', 'Foxborough', US),
  gm(62, 'I', '2026-06-26', '15:00', 'Iraq', 'Senegal', 'Toronto Stadium', 'Toronto', CA),
  gm(63, 'G', '2026-06-26', '20:00', 'Egypt', 'IR Iran', 'Seattle Stadium', 'Seattle', US),
  gm(64, 'G', '2026-06-26', '20:00', 'New Zealand', 'Belgium', 'BC Place Vancouver', 'Vancouver', CA),
  gm(65, 'H', '2026-06-26', '19:00', 'Cabo Verde', 'Saudi Arabia', 'Houston Stadium', 'Houston', US),
  gm(66, 'H', '2026-06-26', '18:00', 'Uruguay', 'Spain', 'Guadalajara Stadium', 'Guadalajara', MX),
  gm(67, 'L', '2026-06-27', '17:00', 'Panama', 'England', 'New York New Jersey Stadium', 'East Rutherford', US),
  gm(68, 'L', '2026-06-27', '17:00', 'Croatia', 'Ghana', 'Philadelphia Stadium', 'Philadelphia', US),
  gm(69, 'J', '2026-06-27', '21:00', 'Algeria', 'Austria', 'Kansas City Stadium', 'Kansas City', US),
  gm(70, 'J', '2026-06-27', '21:00', 'Jordan', 'Argentina', 'Dallas Stadium', 'Arlington', US),
  gm(71, 'K', '2026-06-27', '19:30', 'Colombia', 'Portugal', 'Miami Stadium', 'Miami Gardens', US),
  gm(72, 'K', '2026-06-27', '19:30', 'Congo DR', 'Uzbekistan', 'Atlanta Stadium', 'Atlanta', US),
]

// =====================================================
// ELIMINACIÓN DIRECTA — 32 partidos (M73–M104)
// =====================================================
export const KNOCKOUT_MATCHES: WCKnockoutMatch[] = [
  // Dieciseisavos (Round of 32)
  km(73, 'round_of_32', '2026-06-28', '12:00', '2A', '2B', 'Los Angeles Stadium', 'Inglewood', US),
  km(74, 'round_of_32', '2026-06-29', '16:30', '1E', '3ABCDF', 'Boston Stadium', 'Foxborough', US),
  km(75, 'round_of_32', '2026-06-29', '19:00', '1F', '2C', 'Monterrey Stadium', 'Guadalupe', MX),
  km(76, 'round_of_32', '2026-06-29', '12:00', '1C', '2F', 'Houston Stadium', 'Houston', US),
  km(77, 'round_of_32', '2026-06-30', '17:00', '1I', '3CDFGH', 'New York New Jersey Stadium', 'East Rutherford', US),
  km(78, 'round_of_32', '2026-06-30', '12:00', '2E', '2I', 'Dallas Stadium', 'Arlington', US),
  km(79, 'round_of_32', '2026-06-30', '19:00', '1A', '3CEFHI', 'Mexico City Stadium', 'Ciudad de México', MX),
  km(80, 'round_of_32', '2026-07-01', '12:00', '1L', '3EHIJK', 'Atlanta Stadium', 'Atlanta', US),
  km(81, 'round_of_32', '2026-07-01', '17:00', '1D', '3BEFIJ', 'San Francisco Bay Area Stadium', 'Santa Clara', US),
  km(82, 'round_of_32', '2026-07-01', '13:00', '1G', '3AEHIJ', 'Seattle Stadium', 'Seattle', US),
  km(83, 'round_of_32', '2026-07-02', '19:00', '2K', '2L', 'Toronto Stadium', 'Toronto', CA),
  km(84, 'round_of_32', '2026-07-02', '12:00', '1H', '2J', 'Los Angeles Stadium', 'Inglewood', US),
  km(85, 'round_of_32', '2026-07-02', '20:00', '1B', '3EFGIJ', 'BC Place Vancouver', 'Vancouver', CA),
  km(86, 'round_of_32', '2026-07-03', '18:00', '1J', '2H', 'Miami Stadium', 'Miami Gardens', US),
  km(87, 'round_of_32', '2026-07-03', '20:30', '1K', '3DEIJL', 'Kansas City Stadium', 'Kansas City', US),
  km(88, 'round_of_32', '2026-07-03', '13:00', '2D', '2G', 'Dallas Stadium', 'Arlington', US),
  // Octavos (Round of 16)
  km(89, 'round_of_16', '2026-07-04', '17:00', 'W74', 'W77', 'Philadelphia Stadium', 'Philadelphia', US),
  km(90, 'round_of_16', '2026-07-04', '12:00', 'W73', 'W75', 'Houston Stadium', 'Houston', US),
  km(91, 'round_of_16', '2026-07-05', '16:00', 'W76', 'W78', 'New York New Jersey Stadium', 'East Rutherford', US),
  km(92, 'round_of_16', '2026-07-05', '18:00', 'W79', 'W80', 'Mexico City Stadium', 'Ciudad de México', MX),
  km(93, 'round_of_16', '2026-07-06', '14:00', 'W83', 'W84', 'Dallas Stadium', 'Arlington', US),
  km(94, 'round_of_16', '2026-07-06', '17:00', 'W81', 'W82', 'Seattle Stadium', 'Seattle', US),
  km(95, 'round_of_16', '2026-07-07', '12:00', 'W86', 'W88', 'Atlanta Stadium', 'Atlanta', US),
  km(96, 'round_of_16', '2026-07-07', '13:00', 'W85', 'W87', 'BC Place Vancouver', 'Vancouver', CA),
  // Cuartos
  km(97, 'quarter', '2026-07-09', '16:00', 'W89', 'W90', 'Boston Stadium', 'Foxborough', US),
  km(98, 'quarter', '2026-07-10', '12:00', 'W93', 'W94', 'Los Angeles Stadium', 'Inglewood', US),
  km(99, 'quarter', '2026-07-11', '17:00', 'W91', 'W92', 'Miami Stadium', 'Miami Gardens', US),
  km(100, 'quarter', '2026-07-11', '20:00', 'W95', 'W96', 'Kansas City Stadium', 'Kansas City', US),
  // Semifinales
  km(101, 'semi', '2026-07-14', '14:00', 'W97', 'W98', 'Dallas Stadium', 'Arlington', US),
  km(102, 'semi', '2026-07-15', '15:00', 'W99', 'W100', 'Atlanta Stadium', 'Atlanta', US),
  // Tercer puesto y final
  km(103, 'third_place', '2026-07-18', '17:00', 'L101', 'L102', 'Miami Stadium', 'Miami Gardens', US),
  km(104, 'final', '2026-07-19', '15:00', 'W101', 'W102', 'New York New Jersey Stadium', 'East Rutherford', US),
]

export const ALL_MATCHES = [...GROUP_MATCHES, ...KNOCKOUT_MATCHES]

// Etiquetas legibles de cada fase
export const PHASE_LABELS: Record<string, string> = {
  group: 'Fase de grupos',
  round_of_32: 'Dieciseisavos',
  round_of_16: 'Octavos',
  quarter: 'Cuartos',
  semi: 'Semifinal',
  third_place: 'Tercer puesto',
  final: 'Final',
}

export const ARGENTINA_ID = 37

/** Construye un timestamp ISO local desde date + local_time del fixture */
export function matchDateTime(m: { date: string; local_time: string }): string {
  return `${m.date}T${m.local_time}:00`
}
