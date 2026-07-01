import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { useSession } from '../hooks/useSession'
import { TripProvider, useTripContext } from '../context/TripContext'

function LocalModeBanner() {
  const { isLocalMode } = useTripContext()
  if (!isLocalMode) return null
  return (
    <div className="bg-amber-100 px-4 py-2 text-center text-xs text-amber-800">
      Mode local — configura Supabase per sincronitzar en temps real
    </div>
  )
}

export function Layout() {
  const { session } = useSession()
  if (!session) return null

  return (
    <TripProvider code={session.code}>
      <div className="flex min-h-full flex-col">
        <LocalModeBanner />
        <Outlet />
        <div className="h-20" />
        <BottomNav />
      </div>
    </TripProvider>
  )
}
