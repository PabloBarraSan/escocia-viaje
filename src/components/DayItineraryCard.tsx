import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarCheck, CheckCircle2, Circle, Lightbulb, MapPinned,
  Pencil, PlayCircle, ThumbsUp,
} from 'lucide-react'
import { useTripContext } from '../context/TripContext'
import { useSession } from '../hooks/useSession'
import { partitionActivities } from '../lib/activities'
import type { Activity, Day } from '../lib/types'
import { FeaturedCard } from './PageSection'
import { PlaceDetailsSheet } from './PlaceDetailsSheet'

type ActivityStatus = 'done' | 'current' | 'pending'

function ActivityRow({
  activity,
  onVote,
  voted,
  status,
  onOpenPlace,
}: {
  activity: Activity
  onVote?: () => void
  voted?: boolean
  status?: ActivityStatus
  onOpenPlace?: () => void
}) {
  const isIdea = activity.kind === 'idea'
  return (
    <div className={`flex items-start gap-3 rounded-xl border p-3.5 ${
      isIdea ? 'border-emerald-200 bg-emerald-50/60' : status === 'current'
        ? 'border-amber-300 bg-amber-50'
        : 'border-gray-100 bg-highland-50/40'
    }`}>
      {!isIdea && status === 'done' && <CheckCircle2 size={20} className="mt-1 shrink-0 text-emerald-600" />}
      {!isIdea && status === 'current' && <PlayCircle size={20} className="mt-1 shrink-0 text-amber-600" />}
      {!isIdea && status === 'pending' && <Circle size={20} className="mt-1 shrink-0 text-gray-300" />}
      {isIdea && onVote ? (
        <button
          type="button"
          onClick={onVote}
          className={`flex min-w-10 shrink-0 flex-col items-center rounded-xl px-2 py-1 transition ${
            voted ? 'bg-emerald-700 text-white' : 'bg-white text-gray-500 hover:bg-emerald-100'
          }`}
        >
          <ThumbsUp size={14} />
          <span className="text-xs font-bold">{activity.votes.length}</span>
        </button>
      ) : activity.time ? (
        <span className="shrink-0 rounded-lg bg-highland-100 px-2.5 py-1 text-sm font-bold text-highland-800">
          {activity.time}
        </span>
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="text-base leading-snug text-gray-900">{activity.text}</p>
        {(activity.place_name?.trim() || activity.place_address?.trim()) && (
          <button
            type="button"
            onClick={onOpenPlace}
            className="mt-1 flex items-center gap-1 text-left text-xs font-semibold text-highland-700"
          >
            <MapPinned size={13} /> {activity.place_name || activity.place_address}
          </button>
        )}
        {isIdea && activity.updated_by && (
          <p className="mt-0.5 text-[10px] text-gray-400">per {activity.updated_by}</p>
        )}
      </div>
    </div>
  )
}

type Props = {
  day: Day
  editHref?: string
  eyebrow?: string
}

export function DayItineraryCard({ day, editHref, eyebrow = 'Itinerari' }: Props) {
  const { voteActivity } = useTripContext()
  const { session } = useSession()
  const activities = day.activities ?? []
  const { plans, ideas } = partitionActivities(activities)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)

  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const nextActivity = plans.find((activity) =>
    Boolean(activity.time)
      && day.date === today
      && new Date(`${day.date}T${activity.time}:00`).getTime() >= now.getTime(),
  )
  const statusFor = (activity: Activity): ActivityStatus => {
    if (day.date < today) return 'done'
    if (day.date > today) return 'pending'
    if (activity.id === nextActivity?.id) return 'current'
    if (activity.time && new Date(`${day.date}T${activity.time}:00`).getTime() < now.getTime()) return 'done'
    return 'pending'
  }

  if (activities.length === 0) {
    return (
      <FeaturedCard eyebrow="Pla del dia" title={eyebrow} badge="Buit">
        <p className="text-sm text-gray-500">Encara no hi ha activitats previstes.</p>
        {editHref && (
          <Link to={editHref} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-highland-700 px-4 py-3 text-sm font-semibold text-white">
            <Pencil size={16} /> Editar horari
          </Link>
        )}
      </FeaturedCard>
    )
  }

  return (
    <FeaturedCard eyebrow="Pla del dia" title={eyebrow} badge={`${plans.length} ${plans.length === 1 ? 'activitat' : 'activitats'}`}>
      {plans.length > 0 && (
        <div className="space-y-2">
          {plans.map((activity) => (
            <ActivityRow
              key={activity.id}
              activity={activity}
              status={statusFor(activity)}
              onOpenPlace={activity.place_name || activity.place_address ? () => setSelectedActivity(activity) : undefined}
            />
          ))}
        </div>
      )}

      {ideas.length > 0 && (
        <div className={plans.length > 0 ? 'mt-5' : ''}>
          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-emerald-800">
            <Lightbulb size={14} /> Idees del grup
          </p>
          <div className="space-y-2">
            {ideas.map((activity) => (
              <ActivityRow
                key={activity.id}
                activity={activity}
                voted={session ? activity.votes.includes(session.name) : false}
                onVote={session ? () => void voteActivity(activity.id, session.name) : undefined}
                onOpenPlace={activity.place_name || activity.place_address ? () => setSelectedActivity(activity) : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {editHref && (
        <Link to={editHref} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-highland-200 bg-white py-3 text-sm font-semibold text-highland-800 transition hover:bg-highland-50">
          <Pencil size={16} /> Editar horari
        </Link>
      )}
      {selectedActivity && (
        <PlaceDetailsSheet activity={selectedActivity} day={day} onClose={() => setSelectedActivity(null)} />
      )}
    </FeaturedCard>
  )
}

export function DayItineraryCompact({ day }: { day: Day }) {
  const { plans } = partitionActivities(day.activities ?? [])
  if (!plans.length) return null
  return (
    <Link to={`/dia/${day.day_number}`} className="flex items-center gap-2 text-sm font-semibold text-highland-700">
      <CalendarCheck size={16} /> Veure itinerari complet
    </Link>
  )
}
