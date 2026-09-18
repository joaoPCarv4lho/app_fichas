import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(
  url && anonKey && !url.includes('SEU-PROJETO') && !anonKey.includes('sua-anon-key')
)

// Cliente Supabase. Se ainda não estiver configurado (.env em branco), criamos
// um cliente "placeholder" só pra app não quebrar ao abrir — as telas checam
// isSupabaseConfigured e mostram um aviso amigável.
export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  anonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
)
