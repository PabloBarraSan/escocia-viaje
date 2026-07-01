import { Link } from 'react-router-dom'
import { useTripContext } from '../context/TripContext'
import { useSession } from '../hooks/useSession'
import { DAY_TYPE_COLORS, DAY_TYPE_LABELS } from '../lib/types'
import { MapPin, LogOut } from 'lucide-react'

export function DayCard({ day }: { day: import('../lib/types').Day }) {
  const activityCount = day.activities?.length ?? 0

  return (
    <Link
      to={`/dia/${day.day_number}`}
      className="block shrink-0 w-44 rounded-2xl bg-white p-4 shadow-sm border border-highland-100 transition active:scale-[0.98]"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl font-bold text-highland-700">Dia {day.day_number}</span>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${DAY_TYPE_COLORS[day.type]}`}>
          {DAY_TYPE_LABELS[day.type]}
        </span>
      </div>
      <p className="text-xs text-gray-500">{day.label}</p>
      <p className="mt-1 flex items-center gap-1 text-sm font-medium text-highland-800">
        <MapPin size={14} />
        {day.base_city}
      </p>
      <p className="mt-2 text-xs text-gray-400">{activityCount} activitats</p>
    </Link>
  )
}

export function TimelinePage() {
  const { days, trip, loading, error } = useTripContext()
  const { session, logout } = useSession()

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <p className="text-gray-500">Carregant itinerari...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-full items-center justify-center p-6">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="safe-top">
      <header className="sticky top-0 z-40 bg-highland-50/95 backdrop-blur px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-highland-800">{trip?.title}</h1>
            <p className="text-sm text-gray-500">Hola, {session?.name}!</p>
          </div>
          <button onClick={logout} className="rounded-full p-2 text-gray-400 hover:text-gray-600" aria-label="Sortir">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <div className="px-4 pb-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Itinerari</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
          {days.map((day) => (
            <DayCard key={day.id} day={day} />
          ))}
        </div>
      </div>

      <div className="px-4 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Tots els dies</h2>
        {days.map((day) => (
          <Link
            key={day.id}
            to={`/dia/${day.day_number}`}
            className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm border border-highland-100 active:bg-highland-50"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-highland-100 text-lg font-bold text-highland-700">
              {day.day_number}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-highland-800">{day.base_city}</p>
              <p className="text-sm text-gray-500 truncate">{day.label}</p>
              {day.lodging && <p className="text-xs text-highland-600 mt-0.5">{day.lodging}</p>}
            </div>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${DAY_TYPE_COLORS[day.type]}`}>
              {DAY_TYPE_LABELS[day.type]}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
