// =====================================================
// Usuarios de Grupo Región (modo local).
// Generado desde la carpeta "FOTO DE PERFILES".
// Acceso: usuario = nombre · contraseña = nombre123 (temporal).
// =====================================================

export interface LocalUser {
  username: string
  password: string
  full_name: string
  avatar_url: string
  role: 'user' | 'admin'
}

export const LOCAL_USERS: LocalUser[] = [
  { username: 'augusto', password: 'augusto123', full_name: "Augusto", avatar_url: '/avatars/augusto.png', role: 'user' },
  { username: 'azul', password: 'azul123', full_name: "Azul", avatar_url: '/avatars/azul.png', role: 'user' },
  { username: 'blas', password: 'blas123', full_name: "Blas", avatar_url: '/avatars/blas.png', role: 'user' },
  { username: 'fede', password: 'fede123', full_name: "Fede", avatar_url: '/avatars/fede.png', role: 'user' },
  { username: 'fer', password: 'fer123', full_name: "Fer", avatar_url: '/avatars/fer.png', role: 'user' },
  { username: 'flavia', password: 'flavia123', full_name: "Flavia", avatar_url: '/avatars/flavia.png', role: 'user' },
  { username: 'flor', password: 'flor123', full_name: "Flor", avatar_url: '/avatars/flor.png', role: 'user' },
  { username: 'gaby', password: 'gaby123', full_name: "Gaby", avatar_url: '/avatars/gaby.png', role: 'user' },
  { username: 'german', password: 'german123', full_name: "German", avatar_url: '/avatars/german.png', role: 'user' },
  { username: 'guada', password: 'guada123', full_name: "Guada", avatar_url: '/avatars/guada.png', role: 'user' },
  { username: 'guille', password: 'guille123', full_name: "Guille", avatar_url: '/avatars/guille.png', role: 'user' },
  { username: 'juan', password: 'juan123', full_name: "Juan", avatar_url: '/avatars/juan.png', role: 'user' },
  { username: 'julian', password: 'julian123', full_name: "Julian", avatar_url: '/avatars/julian.png', role: 'user' },
  { username: 'july', password: 'july123', full_name: "July", avatar_url: '/avatars/july.png', role: 'user' },
  { username: 'leo', password: 'leo123', full_name: "Leo", avatar_url: '/avatars/leo.png', role: 'user' },
  { username: 'marcosg', password: 'marcosg123', full_name: "Marcos G", avatar_url: '/avatars/marcosg.png', role: 'user' },
  { username: 'maria', password: 'maria123', full_name: "Maria", avatar_url: '/avatars/maria.png', role: 'user' },
  { username: 'marquitos', password: 'marquitos123', full_name: "Marquitos", avatar_url: '/avatars/marquitos.png', role: 'user' },
  { username: 'martin', password: 'martin123', full_name: "Martin", avatar_url: '/avatars/martin.png', role: 'user' },
  { username: 'martinf', password: 'martinf123', full_name: "Martin F", avatar_url: '/avatars/martinf.png', role: 'user' },
  { username: 'milena', password: 'milena123', full_name: "Milena", avatar_url: '/avatars/milena.png', role: 'user' },
  { username: 'naty', password: 'naty123', full_name: "Naty", avatar_url: '/avatars/naty.png', role: 'user' },
  { username: 'nico', password: 'nico123', full_name: "Nico", avatar_url: '/avatars/nico.png', role: 'user' },
  { username: 'pitufo', password: 'pitufo123', full_name: "Pitufo", avatar_url: '/avatars/pitufo.png', role: 'user' },
  { username: 'tute', password: 'tute123', full_name: "Tute", avatar_url: '/avatars/tute.png', role: 'user' },
  { username: 'vicky', password: 'vicky123', full_name: "Vicky", avatar_url: '/avatars/vicky.png', role: 'user' },
]

export const USERS_BY_NAME: Record<string, LocalUser> = Object.fromEntries(
  LOCAL_USERS.map(u => [u.username, u])
)
