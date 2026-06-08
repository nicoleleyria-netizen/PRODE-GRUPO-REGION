import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types'
import { hydratePredictions } from '../lib/predictionsRepo'

const DEMO_EMAIL = 'demo@gruporegion.com'
const DEMO_PASSWORD = 'demo2026'
const DEMO_KEY = 'prode_demo_mode'

// Dominio interno: los usuarios entran con "nombre" y se traduce a nombre@prode.local
const USER_EMAIL_DOMAIN = 'prode.local'

const DEMO_PROFILE: Profile = {
  id: 'demo-user-id',
  username: 'demo',
  full_name: 'Juan Demo',
  sector: 'Redacción',
  phone: null,
  avatar_url: null,
  role: 'admin',
  created_at: new Date().toISOString(),
}

function isDemoMode() {
  return localStorage.getItem(DEMO_KEY) === 'true'
}

/** Convierte lo que escribe el usuario en email: "augusto" -> "augusto@prode.local" */
function toEmail(identifier: string): string {
  const id = identifier.trim()
  return id.includes('@') ? id : `${id.toLowerCase()}@${USER_EMAIL_DOMAIN}`
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  isDemo: boolean
  signIn: (identifier: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(false)

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data)
    // Trae las predicciones del usuario a la caché local
    if (data) hydratePredictions(userId).catch(() => {})
  }

  async function refreshProfile() {
    if (isDemo) return
    if (user) await fetchProfile(user.id)
  }

  useEffect(() => {
    // 1. Cuenta demo (solo diseño, sin base)
    if (isDemoMode()) {
      setIsDemo(true)
      setProfile(DEMO_PROFILE)
      setUser({ id: DEMO_PROFILE.id, email: DEMO_EMAIL } as User)
      setLoading(false)
      return
    }

    // 2. Sesión real de Supabase
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) fetchProfile(session.user.id).finally(() => setLoading(false))
        else setLoading(false)
      })
      .catch(() => setLoading(false))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setProfile(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signIn(identifier: string, password: string) {
    // Cuenta demo (solo para ver el diseño, sin base)
    if (identifier.trim() === DEMO_EMAIL && password === DEMO_PASSWORD) {
      localStorage.setItem(DEMO_KEY, 'true')
      setIsDemo(true)
      setProfile(DEMO_PROFILE)
      setUser({ id: DEMO_PROFILE.id, email: DEMO_EMAIL } as User)
      return { error: null }
    }

    // Usuarios reales: "nombre" -> nombre@prode.local
    const { error } = await supabase.auth.signInWithPassword({
      email: toEmail(identifier),
      password,
    })
    return { error }
  }

  async function signOut() {
    if (isDemo) {
      localStorage.removeItem(DEMO_KEY)
      setIsDemo(false)
      setProfile(null)
      setUser(null)
      return
    }
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, isDemo, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
