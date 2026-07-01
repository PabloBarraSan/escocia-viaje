import { Link } from 'react-router-dom'
import {
  ArrowRight, BedDouble, CalendarCheck, Clock3, MapPinned, Navigation,
} from 'lucide-react'
import { useTripContext } from '../context/TripContext'
import { LODGINGS_BY_DAY } from '../lib/types'
import type { Day } from '../lib/types'
import { WeatherCard } from '../components/WeatherCard'
import { ShareWhatsAppButton } from '../components/ShareWhatsAppButton'
import { dayRoute } from '../lib/maps'
import { CarLocationCard } from '../components/CarLocationCard'
import { PhotoHero } from '../components/PhotoHero'
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
  const activities = day.activities ?? []
  const preview = activities.slice(0, 3)
  const lodgingDetails = LODGINGS_BY_DAY[day.day_number] ?? (
    day.lodging_address ? {
      name: day.lodging_name ?? day.lodging ?? 'Allotjament',
      address: day.lodging_address,
      phone: day.lodging_phone ?? '',
    } : null
  )
  const lodgingRoute = lodgingDetails?.address ? directions(lodgingDetails.address) : null
  const photo = dayPhoto(day)

  return (
    <main className="pb-4">
      <PhotoHero
        photo={photo.url}
        alt={photo.label}
        tint={heroTint(day)}
        className="rounded-none shadow-md"
        minHeight="12.5rem"
      >
        <div className="hero-safe-padding flex min-h-[12.5rem] flex-col justify-end p-5 text-white">
          <p className="text-xs font-bold uppercase tracking-wider text-white/80">
            {isToday ? 'Avui' : 'Pròxim dia'}
          </p>
          <h1 className="font-display text-3xl font-bold">{day.base_city}</h1>
          <p className="mt-1 text-sm text-white/75">{day.label} · Dia {day.day_number}</p>
        </div>
      </PhotoHero>

      <div className="space-y-5 px-4 pt-5">
      {upcoming && (
        <Link
          to={`/dia/${upcoming.day.day_number}`}
          className="animate-fade-in block rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 p-5 text-amber-950 shadow-lg transition active:scale-[0.99]"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider">
              <Clock3 size={16} /> Què toca ara?
            </p>
            <span className="rounded-full bg-white/50 px-3 py-1 text-xs font-bold">{upcoming.countdown}</span>
          </div>
          <div className="mt-4 flex items-start gap-4">
            <span className="rounded-xl bg-white/60 px-3 py-2 text-lg font-black">
              {upcoming.activity.time || '—'}
            </span>
            <div>
              <h2 className="text-xl font-bold leading-tight">{upcoming.activity.text}</h2>
              <p className="mt-1 text-sm font-medium opacity-75">
                Dia {upcoming.day.day_number} · {upcoming.day.base_city}
              </p>
            </div>
          </div>
        </Link>
      )}

      <WeatherCard day={day} compact />
      {day.day_number >= 3 && day.day_number <= 7 && <CarLocationCard compact />}

      <section className="grid grid-cols-2 gap-3">
        <a
          href={route?.url ?? directions(`${day.base_city}, Scotland`)}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 rounded-2xl bg-highland-700 p-4 font-semibold text-white transition active:scale-[0.98]"
        >
          <Navigation size={19} /> Ruta
        </a>
        {lodgingRoute ? (
          <a
            href={lodgingRoute}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-2xl bg-white p-4 font-semibold text-highland-800 shadow-sm transition active:scale-[0.98]"
          >
            <BedDouble size={19} /> Allotjament
          </a>
        ) : (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`petrol station near ${day.base_city}, Scotland`)}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-2xl bg-white p-4 font-semibold text-highland-800 shadow-sm transition active:scale-[0.98]"
          >
            <MapPinned size={19} /> Benzinera
          </a>
        )}
      </section>

      {preview.length > 0 && (
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wide text-gray-500">Properes activitats</h2>
            {activities.length > preview.length && (
              <span className="text-xs text-gray-400">+{activities.length - preview.length} més</span>
            )}
          </div>
          <div className="space-y-2">
            {preview.map((activity) => (
              <div key={activity.id} className="flex gap-3 rounded-xl bg-highland-50/60 p-3">
                <span className="w-12 shrink-0 text-sm font-bold text-highland-700">{activity.time || '—'}</span>
                <span className="text-sm text-gray-700">{activity.text}</span>
              </div>
            ))}
          </div>
        </section>
      )}

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

      <ShareWhatsAppButton day={day} />
      </div>
    </main>
  )
}
