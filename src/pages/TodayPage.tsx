import { Link } from 'react-router-dom'
import {
  ArrowRight, Bed, CalendarCheck, Clock3, ExternalLink, MapPinned, Navigation,
} from 'lucide-react'
import { useTripContext } from '../context/TripContext'
import { DAY_TYPE_COLORS, DAY_TYPE_LABELS, LODGINGS_BY_DAY } from '../lib/types'
import type { Day } from '../lib/types'
import { WeatherCard } from '../components/WeatherCard'
import { FlightsCard } from '../components/FlightsCard'
import { dayRoute } from '../lib/maps'
import { CarLocationCard } from '../components/CarLocationCard'
import { PhotoHero } from '../components/PhotoHero'
import { DayItineraryCard } from '../components/DayItineraryCard'
import { PageSection } from '../components/PageSection'
import { dayPhoto, heroTint } from '../lib/dayTheme'

function todayKey() {
  const date = new Date()
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

function directions(destination: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=driving`
}

function nextMoment(days: Day[]) {
  const now = new Date()
  const moments = days.flatMap((day) => {
    const activities = (day.activities ?? []).map((activity) => {
      const time = activity.time || '23:59'
      return {
        day,
        activity,
        date: new Date(`${day.date}T${time}:00`),
      }
    })
    const lodging = LODGINGS_BY_DAY[day.day_number]
    if (lodging) {
      activities.push({
        day,
        activity: {
          id: `lodging-${day.id}`,
          day_id: day.id,
          time: '23:30',
          text: `Tornar a ${lodging.name}`,
          kind: 'plan',
          votes: [],
          place_name: lodging.name,
          place_address: lodging.address,
          description: '',
          maps_url: null,
          duration_minutes: 30,
          sort_order: 999,
          updated_by: null,
          updated_at: '',
        },
        date: new Date(`${day.date}T23:30:00`),
      })
    }
    return activities
  }).filter((moment) => moment.date.getTime() >= now.getTime())
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  const next = moments[0]
  if (!next) return null

  const diffMinutes = Math.max(0, Math.round((next.date.getTime() - now.getTime()) / 60_000))
  let countdown = ''
  if (diffMinutes < 60) countdown = diffMinutes <= 1 ? 'Ara mateix' : `En ${diffMinutes} min`
  else if (diffMinutes < 1_440) countdown = `En ${Math.floor(diffMinutes / 60)} h`
  else {
    const daysLeft = Math.ceil(diffMinutes / 1_440)
    countdown = daysLeft === 1 ? 'Demà' : `En ${daysLeft} dies`
  }

  return { ...next, countdown }
}

export function TodayPage() {
  const { days } = useTripContext()
  const today = todayKey()
  const day = days.find((item) => item.date === today)
    ?? days.find((item) => item.date > today)
    ?? days.at(-1)

  if (!day) return null

  const isToday = day.date === today
  const upcoming = nextMoment(days)
  const route = dayRoute(day.day_number)
  const lodgingDetails = LODGINGS_BY_DAY[day.day_number] ?? (
    day.lodging_address ? {
      name: day.lodging_name ?? day.lodging ?? 'Allotjament',
      address: day.lodging_address,
      phone: day.lodging_phone ?? '',
    } : null
  )
  const lodgingRoute = lodgingDetails?.address ? directions(lodgingDetails.address) : null
  const photo = dayPhoto(day)
  const mapsRoute = route?.url ?? directions(`${day.base_city}, Scotland`)

  return (
    <main className="pb-6">
      <PhotoHero
        photo={photo.url}
        alt={photo.label}
        tint={heroTint(day)}
        className="rounded-none shadow-md"
        minHeight="8.75rem"
      >
        <div className="hero-safe-padding flex min-h-[8.75rem] flex-col justify-end gap-1 p-4 pb-3 text-white">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-bold uppercase tracking-wider text-white/70">
              {isToday ? 'Avui' : 'Pròxim dia'}
            </p>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${DAY_TYPE_COLORS[day.type]}`}>
              {DAY_TYPE_LABELS[day.type]}
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold leading-tight">{day.base_city}</h1>
          <p className="text-sm text-white/80">{day.label} · Dia {day.day_number}</p>
        </div>
      </PhotoHero>

      <div className="space-y-8 px-4 pt-5">
        {upcoming && (
          <Link
            to={`/dia/${upcoming.day.day_number}`}
            className="block animate-fade-in rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-sm ring-1 ring-amber-100 transition active:scale-[0.99]"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-amber-800">
                <Clock3 size={15} /> Què toca ara?
              </p>
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-amber-900 shadow-sm">
                {upcoming.countdown}
              </span>
            </div>
            <div className="mt-3 flex items-start gap-3">
              {upcoming.activity.time && (
                <span className="shrink-0 rounded-lg bg-white px-2.5 py-1.5 text-sm font-bold text-amber-900 shadow-sm">
                  {upcoming.activity.time}
                </span>
              )}
              <div className="min-w-0">
                <p className="text-lg font-bold leading-snug text-highland-900">{upcoming.activity.text}</p>
                <p className="mt-1 text-xs text-gray-600">
                  Dia {upcoming.day.day_number} · {upcoming.day.base_city}
                </p>
              </div>
            </div>
          </Link>
        )}

        <DayItineraryCard
          day={day}
          editHref={`/dia/${day.day_number}/horari`}
          eyebrow={isToday ? 'Itinerari d’avui' : 'Pròxim itinerari'}
        />

        <WeatherCard day={day} />
        <FlightsCard dayNumber={day.day_number} />

        <PageSection title="Pràctic" hint="Ruta, cotxe i allotjament">
          <div className="space-y-2">
            <a
              href={mapsRoute}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-2xl border border-highland-100 bg-white p-3.5 shadow-sm transition active:scale-[0.99]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-highland-100 text-highland-700">
                <Navigation size={20} />
              </span>
              <span className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Ruta del dia</p>
                <p className="truncate font-semibold text-highland-900">{route?.label ?? `Navegar per ${day.base_city}`}</p>
              </span>
              <ExternalLink size={16} className="shrink-0 text-gray-300" />
            </a>

            {lodgingRoute ? (
              <a
                href={lodgingRoute}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-2xl border border-highland-100 bg-white p-3.5 shadow-sm transition active:scale-[0.99]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-800">
                  <Bed size={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Allotjament</p>
                  <p className="truncate font-semibold text-highland-900">{lodgingDetails?.name ?? 'Anar a l’allotjament'}</p>
                </span>
                <ExternalLink size={16} className="shrink-0 text-gray-300" />
              </a>
            ) : (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`petrol station near ${day.base_city}, Scotland`)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-2xl border border-highland-100 bg-white p-3.5 shadow-sm transition active:scale-[0.99]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-800">
                  <MapPinned size={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Benzinera</p>
                  <p className="font-semibold text-highland-900">Cercar a prop de {day.base_city}</p>
                </span>
                <ExternalLink size={16} className="shrink-0 text-gray-300" />
              </a>
            )}

            {day.day_number >= 3 && day.day_number <= 7 && (
              <CarLocationCard compact />
            )}
          </div>
        </PageSection>

        <Link
          to={`/dia/${day.day_number}`}
          className="flex items-center justify-between rounded-2xl border-2 border-highland-200 bg-white p-4 font-semibold text-highland-800 shadow-sm transition active:scale-[0.99]"
        >
          <span className="flex items-center gap-2">
            <CalendarCheck size={20} />
            Veure el dia complet
          </span>
          <ArrowRight size={18} className="text-highland-500" />
        </Link>
      </div>
    </main>
  )
}
