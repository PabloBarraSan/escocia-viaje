import { createClient, SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const isSupabaseConfigured =
  Boolean(url && key && !url.includes('tu-proyecto') && !key.includes('tu-anon'))

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
