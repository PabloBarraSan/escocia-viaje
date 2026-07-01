import { Link } from 'react-router-dom'
import { BedDouble, CalendarCheck, Clock3, ExternalLink, MapPinned, Navigation, Phone, ShieldCheck } from 'lucide-react'
import { useTripContext } from '../context/TripContext'
import { LODGINGS_BY_DAY } from '../lib/types'
import type { Day } from '../lib/types'

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
  const { days, suggestions, tripInfo } = useTripContext()
  const today = todayKey()
  const day = days.find((item) => item.date === today)
    ?? days.find((item) => item.date > today)
    ?? days.at(-1)

  if (!day) return null

  const selected = suggestions.filter((item) => item.day_id === day.id && item.status === 'selected')
  const practical = tripInfo.filter((item) => ['vols', 'matricula_cotxe', 'telefon_emergencia', 'asseguranca'].includes(item.key) && item.value)
  const lodgingDetails = LODGINGS_BY_DAY[day.day_number] ?? (
    day.lodging_address ? {
      name: day.lodging_name ?? day.lodging ?? 'Allotjament',
      address: day.lodging_address,
      phone: day.lodging_phone ?? '',
    } : null
  )
  const lodgingRoute = lodgingDetails ? directions(lodgingDetails.address) : null
  const upcoming = nextMoment(days)

  return (
    <main className="safe-top space-y-5 p-4">
      <header>
        <p className="text-xs font-bold uppercase tracking-wider text-highland-600">
          {day.date === today ? 'Avui' : 'Pròxim dia'}
        </p>
        <h1 className="text-3xl font-bold text-highland-900">{day.base_city}</h1>
        <p className="text-sm text-gray-500">{day.label} · Dia {day.day_number}</p>
      </header>

      {upcoming && (
        <Link
          to={`/dia/${upcoming.day.day_number}`}
          className="block rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 p-5 text-amber-950 shadow-lg"
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

      <div className="grid grid-cols-2 gap-3">
        <a href={directions(`${day.base_city}, Scotland`)} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-2xl bg-highland-700 p-4 font-semibold text-white">
          <Navigation size={19} /> Com arribar
        </a>
        <Link to={`/dia/${day.day_number}`} className="flex items-center justify-center gap-2 rounded-2xl bg-white p-4 font-semibold text-highland-800 shadow-sm">
          <CalendarCheck size={19} /> Veure dia
        </Link>
      </div>

      {day.lodging && (
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase text-gray-500"><BedDouble size={16} /> Aquesta nit</h2>
          <p className="mt-2 font-semibold text-highland-900">{day.lodging}</p>
          {lodgingDetails?.name && <p className="mt-1 text-sm font-semibold text-highland-700">{lodgingDetails.name}</p>}
          {lodgingDetails?.address && <p className="mt-1 text-sm text-gray-500">{lodgingDetails.address}</p>}
          {lodgingRoute && (
            <a href={lodgingRoute} target="_blank" rel="noreferrer" className="mt-3 flex w-fit items-center gap-2 rounded-xl bg-highland-700 px-3 py-2 text-sm font-semibold text-white">
              <Navigation size={16} /> Anar a l’allotjament
            </a>
          )}
        </section>
      )}

      <section>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-500">Pla del dia</h2>
        <div className="space-y-2">
          {(day.activities ?? []).map((activity) => (
            <div key={activity.id} className="flex gap-3 rounded-xl bg-white p-3 shadow-sm">
              <span className="w-12 shrink-0 text-sm font-bold text-highland-700">{activity.time || '—'}</span>
              <span className="text-sm text-gray-700">{activity.text}</span>
            </div>
          ))}
        </div>
      </section>

      {selected.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-500">Llocs elegits</h2>
          <div className="space-y-2">
            {selected.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl bg-highland-50 p-3">
                <span className="font-semibold text-highland-900">{item.title}</span>
                {item.maps_url && <a href={item.maps_url} target="_blank" rel="noreferrer" aria-label="Obrir a Maps"><ExternalLink size={18} /></a>}
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-500">Informació útil</h2>
        <div className="space-y-2">
          {practical.map((item) => (
            <div key={item.id} className="flex gap-3 rounded-xl bg-white p-3 text-sm shadow-sm">
              {item.key === 'telefon_emergencia' ? <Phone size={17} /> : <ShieldCheck size={17} />}
              <span>{item.value}</span>
            </div>
          ))}
          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`petrol station near ${day.base_city}, Scotland`)}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl bg-white p-3 text-sm font-semibold text-highland-700 shadow-sm">
            <MapPinned size={17} /> Buscar benzinera pròxima
          </a>
        </div>
      </section>
    </main>
  )
}
