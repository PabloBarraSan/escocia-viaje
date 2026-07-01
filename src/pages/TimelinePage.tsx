import { Link } from 'react-router-dom'
import { useTripContext } from '../context/TripContext'
import { useSession } from '../hooks/useSession'
import { DAY_TYPE_COLORS, DAY_TYPE_LABELS } from '../lib/types'
import type { Day } from '../lib/types'
import { BedDouble, CalendarDays, ChevronRight, Clock3, LogOut, MapPin } from 'lucide-react'

const DAY_MS = 86_400_000

function localDate(value: string) {
  return new Date(`${value}T00:00:00`)
}

function localDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function tripStatus(days: Day[]) {
  if (!days.length) return null
  const today = localDateKey()
  const current = days.find((day) => day.date === today)
  if (current) {
    return {
      eyebrow: `Avui · Dia ${current.day_number}`,
      title: current.base_city,
      detail: current.label,
      day: current,
    }
  }

  const next = days.find((day) => day.date > today)
  if (next) {
    const remaining = Math.ceil((localDate(next.date).getTime() - localDate(today).getTime()) / DAY_MS)
    return {
      eyebrow: remaining === 1 ? 'Demà comença el viatge' : `Falten ${remaining} dies`,
      title: `Pròxima parada: ${next.base_city}`,
      detail: next.label,
      day: next,
    }
  }

  return {
    eyebrow: 'Viatge completat',
    title: 'Quins records!',
    detail: `${days.length} dies recorrent Escòcia`,
    day: days.at(-1)!,
  }
}

function DayRow({ day }: { day: Day }) {
  const today = localDateKey()
  const isToday = day.date === today
  const isPast = day.date < today
  const activities = day.activities ?? []

  return (
    <Link
      to={`/dia/${day.day_number}`}
      className={`block rounded-2xl border bg-white p-4 shadow-sm transition active:scale-[0.99] ${
        isToday ? 'border-highland-500 ring-2 ring-highland-100' : 'border-highland-100'
      } ${isPast ? 'opacity-70' : ''}`}
    >
      <div className="flex items-start gap-3">
        <div className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl ${
          isToday ? 'bg-highland-700 text-white' : 'bg-highland-100 text-highland-700'
        }`}>
          <span className="text-[10px] font-semibold uppercase leading-none">Dia</span>
          <span className="text-xl font-bold leading-none">{day.day_number}</span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-medium text-gray-500">{day.label}</p>
              <h2 className="mt-0.5 flex items-center gap-1.5 text-lg font-bold text-highland-800">
                <MapPin size={16} />
                {day.base_city}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {isToday && (
                <span className="rounded-full bg-highland-700 px-2 py-1 text-[10px] font-bold uppercase text-white">
                  Avui
                </span>
              )}
              <span className={`rounded-full px-2 py-1 text-[10px] font-medium ${DAY_TYPE_COLORS[day.type]}`}>
                {DAY_TYPE_LABELS[day.type]}
              </span>
            </div>
          </div>

          {activities.length > 0 && (
            <div className="mt-3 space-y-1.5 border-t border-gray-100 pt-3">
              {activities.slice(0, 2).map((activity) => (
                <p key={activity.id} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="mt-0.5 flex min-w-11 items-center gap-1 text-xs font-semibold text-highland-700">
                    <Clock3 size={12} />
                    {activity.time || '—'}
                  </span>
                  <span className="line-clamp-1">{activity.text}</span>
                </p>
              ))}
              {activities.length > 2 && (
                <p className="text-xs font-medium text-highland-600">
                  + {activities.length - 2} {activities.length - 2 === 1 ? 'activitat' : 'activitats'} més
                </p>
              )}
            </div>
          )}

          {day.lodging && (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
              <BedDouble size={14} className="text-highland-600" />
              {day.lodging}
            </p>
          )}
        </div>
        <ChevronRight size={20} className="mt-4 shrink-0 text-gray-300" />
      </div>
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

  const status = tripStatus(days)

  return (
    <div className="safe-top">
      <header className="sticky top-0 z-40 bg-highland-50/95 px-4 pb-3 pt-4 backdrop-blur">
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

      {status && (
        <div className="px-4 pb-5">
          <Link
            to={`/dia/${status.day.day_number}`}
            className="block overflow-hidden rounded-3xl bg-gradient-to-br from-highland-800 to-highland-700 p-5 text-white shadow-lg"
          >
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-highland-200">
              <CalendarDays size={15} />
              {status.eyebrow}
            </p>
            <h2 className="mt-2 text-2xl font-bold">{status.title}</h2>
            <p className="mt-1 text-sm text-highland-100">{status.detail}</p>
          </Link>
        </div>
      )}

      <main className="space-y-3 px-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Ruta completa</p>
            <h2 className="text-lg font-bold text-highland-800">{days.length} dies d’aventura</h2>
          </div>
          <p className="text-xs text-gray-400">5–12 juliol</p>
        </div>
        {days.map((day) => <DayRow key={day.id} day={day} />)}
      </main>
    </div>
  )
}
