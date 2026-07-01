import { Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { BottomNav } from './BottomNav'
import { useSession } from '../hooks/useSession'
import { TripProvider, useTripContext } from '../context/TripContext'
import { getSupabaseConfigHint } from '../lib/supabase'
import { WeatherProvider } from '../hooks/useWeather'

function LocalModeBanner() {
  const { isLocalMode } = useTripContext()
  if (!isLocalMode || !import.meta.env.DEV) return null
  return (
    <div className="bg-amber-100 px-4 py-2 text-center text-xs text-amber-900">
      Mode local — {getSupabaseConfigHint()}. Després reinicia{' '}
      <code className="rounded bg-amber-200/60 px-1">npm run dev</code>.
    </div>
  )
}

export function Layout() {
  const { session } = useSession()
  const [online, setOnline] = useState(navigator.onLine)

  useEffect(() => {
    const update = () => setOnline(navigator.onLine)
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])
  if (!session) return null

  return (
    <TripProvider code={session.code}>
      <WeatherProvider>
        <div className="flex min-h-full flex-col">
          <LocalModeBanner />
          {!online && <div className="bg-slate-800 px-4 py-2 text-center text-xs font-semibold text-white">Mode offline · mostrant l’última informació guardada</div>}
          <Outlet />
          <div className="h-20" />
          <BottomNav />
        </div>
      </WeatherProvider>
    </TripProvider>
  )
}
