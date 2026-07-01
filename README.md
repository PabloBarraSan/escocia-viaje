# Nova Ruta Escòcia

App interactiva per al viatge a Escòcia (5–12 juliol 2026). Itinerari editable, notes compartides en temps real, mapa, checklist i idees per a Skye.

## Stack

- Vite + React + TypeScript + Tailwind CSS
- Supabase (PostgreSQL + Realtime)
- react-leaflet per al mapa
- Deploy a Vercel

## Desenvolupament local

```bash
cd escocia-viaje
npm install
npm run dev
```

Per defecte funciona en **mode local** (dades a localStorage) sense configurar Supabase.

## Configurar Supabase (per sincronització en temps real)

1. Crea un projecte a [supabase.com](https://supabase.com)
2. Al **SQL Editor**, executa en ordre:
   - `supabase/migrations/001_schema.sql`
   - `supabase/seed.sql`
3. A **Project Settings → API**, copia URL i la clau **publishable** (`sb_publishable_...`) o `anon` legacy (`eyJhbG...`)
4. Crea `.env` a l'arrel (veure `.env.example`):

```
VITE_SUPABASE_URL=https://ayyrixmqmevubmwmpuey.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```

**No** facis servir la `secret key` (`sb_secret_...`) al frontend ni a Vercel.

5. Reinicia `npm run dev`

## Accés

- **Codi del viatge:** `ESCOCIA2026`
- Cada persona introdueix el seu nom en entrar

## Deploy a Vercel

1. Puja el projecte a GitHub (o connecta la carpeta)
2. A [vercel.com](https://vercel.com), importa el projecte
3. Afegeix les variables d'entorn `VITE_SUPABASE_URL` i `VITE_SUPABASE_ANON_KEY`
4. Deploy → comparteix la URL + codi `ESCOCIA2026` per WhatsApp

## Funcionalitats

- Timeline de 8 dies amb detall per dia
- Activitats editables (afegir, editar, esborrar) en temps real
- Notes compartides per dia (autosave)
- Mapa amb ruta i parades
- Resum d'allotjaments i cotxe (editable)
- Checklist compartida
- Idees per a Skye amb vots
- Reserves en PDF protegides amb accés per correu

## Documents privats

1. Executa `supabase/migrations/002_private_reservations.sql` al SQL Editor.
2. Substitueix els cinc correus d'exemple pels correus de la família.
3. A Supabase Storage, obri el bucket privat `reservas`.
4. Puja els PDF des del panell. No els afegis mai al repositori Git.
