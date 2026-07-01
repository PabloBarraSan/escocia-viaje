import { Link } from 'react-router-dom'
import { useTripContext } from '../context/TripContext'
import { useSession } from '../hooks/useSession'
import { DAY_TYPE_COLORS, DAY_TYPE_LABELS } from '../lib/types'
import type { Day } from '../lib/types'
import { BedDouble, CalendarDays, ChevronRight, MapPin } from 'lucide-react'
import { WeatherBadge } from '../components/WeatherCard'
import { PhotoHero, DayPhotoThumb } from '../components/PhotoHero'
import { PageSection } from '../components/PageSection'
import { dayPhoto, heroTint } from '../lib/dayTheme'

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
      title: next.base_city,
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
  const photo = dayPhoto(day)

  return (
    <Link
      to={`/dia/${day.day_number}`}
      className={`block overflow-hidden rounded-2xl border bg-white shadow-sm transition active:scale-[0.99] ${
        isToday ? 'border-highland-400 ring-2 ring-highland-100' : 'border-highland-100'
      } ${isPast ? 'opacity-65' : ''}`}
    >
      <div className="flex items-start gap-3 p-4">
        <DayPhotoThumb dayNumber={day.day_number} photo={photo.url} alt={photo.label} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Dia {day.day_number}</p>
              <h3 className="mt-0.5 flex items-center gap-1 font-display text-lg font-bold text-highland-900">
                <MapPin size={15} className="shrink-0 text-highland-600" />
                <span className="truncate">{day.base_city}</span>
              </h3>
              <p className="mt-0.5 text-xs text-gray-500">{day.label}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <WeatherBadge day={day} />
              <div className="flex flex-wrap justify-end gap-1">
                {isToday && (
                  <span className="rounded-full bg-highland-700 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                    Avui
                  </span>
                )}
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${DAY_TYPE_COLORS[day.type]}`}>
                  {DAY_TYPE_LABELS[day.type]}
                </span>
              </div>
            </div>
          </div>

          {activities.length > 0 && (
            <div className="mt-3 space-y-1.5 border-t border-gray-100 pt-3">
              {activities.slice(0, 2).map((activity) => (
                <p key={activity.id} className="flex items-start gap-2 text-sm text-gray-700">
                  {activity.time && (
                    <span className="shrink-0 rounded-md bg-highland-50 px-1.5 py-0.5 text-xs font-bold text-highland-700">
                      {activity.time}
                    </span>
                  )}
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
            <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
              <BedDouble size={13} className="shrink-0 text-highland-600" />
              <span className="line-clamp-1">{day.lodging}</span>
            </p>
          )}
        </div>
        <ChevronRight size={18} className="mt-5 shrink-0 text-gray-300" />
      </div>
    </Link>
  )
}

export function TimelinePage() {
  const { days, trip, loading, error } = useTripContext()
  const { session } = useSession()

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
    <div className="pb-6">
      <header className="sticky-page-header bg-highland-50/95 px-4 pb-2 backdrop-blur">
        <p className="text-sm text-gray-500">Hola, {session?.name}</p>
        <h1 className="font-display text-2xl font-bold text-highland-900">{trip?.title}</h1>
      </header>

      {status && (() => {
        const photo = dayPhoto(status.day)
        return (
          <div className="px-4 pb-2 pt-3">
            <PhotoHero
              photo={photo.url}
              alt={photo.label}
              tint={heroTint(status.day)}
              to={`/dia/${status.day.day_number}`}
              minHeight="8.75rem"
              className="shadow-md"
            >
              <div className="hero-safe-padding flex min-h-[8.75rem] flex-col justify-end gap-1 p-4 pb-3 text-white">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/70">
                  <CalendarDays size={14} />
                  {status.eyebrow}
                </p>
                <h2 className="font-display text-2xl font-bold leading-tight">{status.title}</h2>
                <p className="text-sm text-white/80">{status.detail}</p>
              </div>
            </PhotoHero>
          </div>
        )
      })()}

      <main className="space-y-3 px-4 pt-5">
        <PageSection title="Tots els dies" hint="8 dies d’aventura · 5–12 juliol">
          <div className="space-y-3">
            {days.map((day) => <DayRow key={day.id} day={day} />)}
          </div>
        </PageSection>
      </main>
    </div>
  )
}
