import { createClient, SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const isSupabaseConfigured =
  Boolean(url && key && !url.includes('tu-proyecto') && !key.includes('tu-anon'))

/** Missatge per al banner de desenvolupament quan falta configuració. */
export function getSupabaseConfigHint(): string {
  const hasUrl = Boolean(url && !url.includes('tu-proyecto'))
  const hasKey = Boolean(key && !key.includes('tu-anon'))
  if (!hasUrl && !hasKey) {
    return 'al fitxer .env falten VITE_SUPABASE_URL i VITE_SUPABASE_ANON_KEY'
  }
  if (!hasKey) {
    return 'VITE_SUPABASE_ANON_KEY està buida al .env — copia-la des de Vercel (Settings → Environment Variables) o Supabase (Project Settings → API)'
  }
  if (!hasUrl) {
    return 'falta VITE_SUPABASE_URL al .env'
  }
  return 'revisa VITE_SUPABASE_URL i VITE_SUPABASE_ANON_KEY al .env'
}

let client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase no configurat. Copia .env.example a .env i afegeix les credencials.')
  }
  if (!client) {
    client = createClient(url, key)
  }
  return client
}
