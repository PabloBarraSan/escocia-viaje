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
      .map((activity) => ({ day, activity, date: new Date(`${day.date}T${activity.time}:00`) })))
    .filter((moment) => moment.date.getTime() >= now.getTime())
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  const next = moments[0]
  if (!next) return null
  const minutes = Math.max(0, Math.round((next.date.getTime() - now.getTime()) / 60_000))
  const countdown = minutes < 60
    ? minutes <= 1 ? 'ara' : `en ${minutes} min`
    : minutes < 1_440
      ? `en ${Math.floor(minutes / 60)} h`
      : Math.ceil(minutes / 1_440) === 1 ? 'demà' : `en ${Math.ceil(minutes / 1_440)} dies`
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
    <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-amber-950 shadow-sm">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-200/70 text-amber-800">
        <Clock3 size={18} />
      </span>
      <Link to={`/dia/${upcoming.day.day_number}/horari`} className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold">{upcoming.activity.text}</p>
        <p className="text-xs text-amber-800">{upcoming.activity.time} · {upcoming.countdown}</p>
      </Link>
      {directions && (
        <a href={directions} target="_blank" rel="noreferrer" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-600 text-white" aria-label="Anar al lloc">
          <Navigation size={17} />
        </a>
      )}
    </div>
  )
}
