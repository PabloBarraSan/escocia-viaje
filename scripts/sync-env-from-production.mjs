import { writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const base = 'https://escocia-viaje-one.vercel.app'

const html = await fetch(base + '/').then((r) => r.text())
const jsMatch = html.match(/src="(\/assets\/index-[^"]+\.js)"/)
if (!jsMatch) {
  console.error('No s’ha trobat el bundle JS a producció.')
  process.exit(1)
}

const js = await fetch(base + jsMatch[1]).then((r) => r.text())

const urlMatch =
  js.match(/https:\/\/[a-z0-9]+\.supabase\.co/) ??
  js.match(/"VITE_SUPABASE_URL","([^"]+)"/)

const url = urlMatch?.[0] ?? urlMatch?.[1]
if (!url) {
  console.error('No s’ha trobat VITE_SUPABASE_URL al build.')
  process.exit(1)
}

const keyPatterns = [
  /sb_publishable_[A-Za-z0-9_-]+/,
  /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/,
]

let key = ''
for (const pattern of keyPatterns) {
  const m = js.match(pattern)
  if (m) {
    key = m[0]
    break
  }
}

if (!key) {
  console.error('No s’ha trobat VITE_SUPABASE_ANON_KEY al build.')
  process.exit(1)
}

let google = ''
const googleMatch = js.match(/AIza[A-Za-z0-9_-]{20,}/)
if (googleMatch) google = googleMatch[0]

const lines = [
  `VITE_SUPABASE_URL=${url}`,
  `VITE_SUPABASE_ANON_KEY=${key}`,
  '',
  `VITE_GOOGLE_PLACES_API_KEY=${google}`,
  '',
]

writeFileSync(resolve(root, '.env'), lines.join('\n'), 'utf8')
console.log('OK: .env creat des del build de Vercel.')
