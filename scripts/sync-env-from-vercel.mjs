import { writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_GOOGLE_PLACES_API_KEY } =
  process.env

if (!VITE_SUPABASE_URL || !VITE_SUPABASE_ANON_KEY) {
  console.error('Falten VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY al entorn Vercel.')
  process.exit(1)
}

const lines = [
  `VITE_SUPABASE_URL=${VITE_SUPABASE_URL}`,
  `VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}`,
  '',
  `VITE_GOOGLE_PLACES_API_KEY=${VITE_GOOGLE_PLACES_API_KEY ?? ''}`,
  '',
]

writeFileSync(resolve(root, '.env'), lines.join('\n'), 'utf8')
console.log('OK: .env actualitzat des de Vercel (sense mostrar claus).')
