import { Link } from 'react-router-dom'
import { Clock3, Navigation } from 'lucide-react'
import type { Activity, Day } from '../lib/types'

type Moment = {
  day: Day
  activity: Activity
  date: Date
  countdown: string
}

function findNextMoment(days: Day[]): Moment | null {
  const now = new Date()
  const moments = days
    .flatMap((day) => (day.activities ?? [])
      .filter((activity) => activity.time && activity.kind !== 'idea')
      .map((activity) => ({
        day,
        activity,
        date: new Date(`${day.date}T${activity.time}:00`),
      })))
    .filter((moment) => moment.date.getTime() >= now.getTime())
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  const next = moments[0]
  if (!next) return null
  const minutes = Math.max(0, Math.round((next.date.getTime() - now.getTime()) / 60_000))
  const countdown = minutes < 60
    ? minutes <= 1 ? 'Ara mateix' : `En ${minutes} min`
    : minutes < 1_440
      ? `En ${Math.floor(minutes / 60)} h`
      : Math.ceil(minutes / 1_440) === 1 ? 'Demà' : `En ${Math.ceil(minutes / 1_440)} dies`
  return { ...next, countdown }
}

export function NextUpCard({ days, visibleDay }: { days: Day[]; visibleDay: Day }) {
  const upcoming = findNextMoment(days)
  if (!upcoming || upcoming.day.id !== visibleDay.id) return null

  const destination = upcoming.activity.place_address || upcoming.activity.place_name
  const directions = destination
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`
    : null

  return (
    <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-sm ring-1 ring-amber-100">
      <Link to={`/dia/${upcoming.day.day_number}/horari`} className="block">
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-amber-800">
            <Clock3 size={15} /> Què toca ara?
          </p>
          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-amber-900 shadow-sm">
            {upcoming.countdown}
          </span>
        </div>
        <div className="mt-3 flex items-start gap-3">
          <span className="shrink-0 rounded-lg bg-white px-2.5 py-1.5 text-sm font-bold text-amber-900 shadow-sm">
            {upcoming.activity.time}
          </span>
          <div className="min-w-0">
            <p className="text-lg font-bold leading-snug text-highland-900">{upcoming.activity.text}</p>
            <p className="mt-1 text-xs text-gray-600">Dia {upcoming.day.day_number} · {upcoming.day.base_city}</p>
          </div>
        </div>
      </Link>
      {directions && (
        <a href={directions} target="_blank" rel="noreferrer" className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-bold text-white">
          <Navigation size={17} /> Anar al lloc
        </a>
      )}
    </div>
  )
}
