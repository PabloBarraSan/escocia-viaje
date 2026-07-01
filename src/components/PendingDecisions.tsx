import { Link } from 'react-router-dom'
import { ChevronRight, Vote } from 'lucide-react'
import { useTripContext } from '../context/TripContext'

export function PendingDecisions() {
  const { suggestions, days } = useTripContext()
  const pending = suggestions
    .filter((item) => item.status === 'proposed')
    .sort((a, b) => b.votes.length - a.votes.length)

  return (
    <section className="space-y-2">
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
        <Vote size={16} /> Decisions pendents
      </h2>
      {!pending.length && <p className="rounded-xl bg-white p-4 text-sm text-gray-500">No hi ha propostes pendents.</p>}
      {pending.map((item) => {
        const day = days.find((candidate) => candidate.id === item.day_id)
        return (
          <Link key={item.id} to={day ? `/dia/${day.day_number}` : '/'} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-highland-100 text-sm font-bold text-highland-700">{item.votes.length}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{item.title}</p>
              <p className="text-xs text-gray-500">{day?.base_city ?? 'Viatge'} · per {item.author}</p>
            </div>
            <ChevronRight size={17} className="text-gray-300" />
          </Link>
        )
      })}
    </section>
  )
}
