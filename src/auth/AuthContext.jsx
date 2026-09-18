import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase.js'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

const PIN_KEY = 'fichas_pin_hash'

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  // trava por PIN: bloqueada de partida se já existe PIN cadastrado
  const [locked, setLocked] = useState(() => Boolean(localStorage.getItem(PIN_KEY)))

  useEffect(() => {
    if (!isSupabaseConfigured) { setLoading(false); return }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  const hasPin = Boolean(localStorage.getItem(PIN_KEY))

  const setupPin = useCallback(async (pin) => {
    localStorage.setItem(PIN_KEY, await sha256(pin))
    setLocked(false)
  }, [])

  const verifyPin = useCallback(async (pin) => {
    const ok = (await sha256(pin)) === localStorage.getItem(PIN_KEY)
    if (ok) setLocked(false)
    return ok
  }, [])

  const removePin = useCallback(() => {
    localStorage.removeItem(PIN_KEY)
    setLocked(false)
  }, [])

  const lock = useCallback(() => { if (localStorage.getItem(PIN_KEY)) setLocked(true) }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setSession(null)
  }, [])

  // Papel do usuário: 'admin' (acesso total) ou 'profissional' (padrão).
  // Definido de forma segura em app_metadata no Supabase (o usuário não
  // consegue alterar). Ex.: Raw App Meta Data = {"role":"admin"}.
  const isAdmin = session?.user?.app_metadata?.role === 'admin'

  const value = {
    session, loading, locked, hasPin, isAdmin,
    setupPin, verifyPin, removePin, lock, signOut,
    isSupabaseConfigured,
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
