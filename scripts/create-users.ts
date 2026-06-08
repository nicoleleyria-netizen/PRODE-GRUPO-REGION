// =====================================================
// Crea los 26 usuarios de Grupo Región en Supabase Auth.
// Cada uno: email interno <usuario>@prode.local, contraseña <usuario>123.
// El trigger handle_new_user crea el profile (con nombre, avatar, rol).
//
// Uso (la service_role NO se hardcodea):
//   SUPABASE_SERVICE_ROLE="..." npx tsx scripts/create-users.ts
// =====================================================
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { LOCAL_USERS } from '../src/data/users'

const EMAIL_DOMAIN = 'prode.local'

const env = Object.fromEntries(
  readFileSync('.env', 'utf8').split('\n').filter(Boolean).map(l => {
    const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
  })
)
const url = env.VITE_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE
if (!serviceKey) {
  console.error('Falta SUPABASE_SERVICE_ROLE en el entorno.')
  process.exit(1)
}

const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })

let ok = 0, skip = 0, fail = 0
for (const u of LOCAL_USERS) {
  const email = `${u.username}@${EMAIL_DOMAIN}`
  const { error } = await admin.auth.admin.createUser({
    email,
    password: u.password,
    email_confirm: true,
    user_metadata: {
      username: u.username,
      full_name: u.full_name,
      avatar_url: u.avatar_url,
      role: u.role,
    },
  })
  if (error) {
    if (/already|registered|exists/i.test(error.message)) { skip++; console.log(`= ${u.username} (ya existía)`) }
    else { fail++; console.log(`✗ ${u.username}: ${error.message}`) }
  } else { ok++; console.log(`✓ ${u.username}`) }
}
console.log(`\nCreados: ${ok} · Ya existían: ${skip} · Errores: ${fail}`)
