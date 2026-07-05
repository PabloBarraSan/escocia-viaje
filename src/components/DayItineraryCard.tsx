import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarCheck, CheckCircle2, Circle, Lightbulb, MapPinned,
  Navigation, Pencil, PlayCircle, ThumbsUp,
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
  locationEditHref,
}: {
  activity: Activity
  onVote?: () => void
  voted?: boolean
  status?: ActivityStatus
  onOpenPlace?: () => void
  locationEditHref?: string
}) {
  const isIdea = activity.kind === 'idea'
  const mayNeedPlace = /free\s?tour|tour|visita|castell|museu|parada|sopar|dinar|esmorzar|camin|passeig|punt de trobada/i.test(activity.text)
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
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-base leading-snug text-gray-900">{activity.text}</p>
          {status === 'current' && (
            <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900">
              Següent
            </span>
          )}
        </div>
        {(activity.place_name?.trim() || activity.place_address?.trim()) && (
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            <button type="button" onClick={onOpenPlace} className="flex items-center gap-1 text-left text-xs font-semibold text-highland-700">
              <MapPinned size={13} /> {activity.place_name || activity.place_address}
            </button>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(activity.place_address || activity.place_name || '')}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-[11px] font-bold text-blue-700"
            >
              <Navigation size={12} /> Com arribar
            </a>
          </div>
        )}
        {!isIdea && mayNeedPlace && !activity.place_name?.trim() && !activity.place_address?.trim() && locationEditHref && (
          <Link
            to={locationEditHref}
            className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-amber-700"
          >
            <MapPinned size={12} /> Afegir punt de trobada
          </Link>
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
  highlightNext?: boolean
}

export function DayItineraryCard({ day, editHref, eyebrow = 'Itinerari', highlightNext = false }: Props) {
  const { voteActivity } = useTripContext()
  const { session } = useSession()
  const activities = day.activities ?? []
  const { plans, ideas } = partitionActivities(activities)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)

  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const nextActivity = plans.find((activity) =>
    highlightNext
      && Boolean(activity.time)
      && new Date(`${day.date}T${activity.time}:00`).getTime() >= now.getTime(),
  )
  const statusFor = (activity: Activity): ActivityStatus => {
    if (day.date < today) return 'done'
    if (activity.id === nextActivity?.id) return 'current'
    if (day.date > today) return 'pending'
    if (activity.time && new Date(`${day.date}T${activity.time}:00`).getTime() < now.getTime()) return 'done'
    return 'pending'
  }
  const editAction = editHref ? (
    <Link
      to={editHref}
      className="inline-flex items-center gap-1.5 rounded-xl bg-highland-50 px-3 py-2 text-xs font-semibold text-highland-800 transition hover:bg-highland-100"
    >
      <Pencil size={14} /> Editar
    </Link>
  ) : undefined

  if (activities.length === 0) {
    return (
      <FeaturedCard eyebrow="Pla del dia" title={eyebrow} action={editAction}>
        <p className="text-sm text-gray-500">Encara no hi ha activitats previstes.</p>
      </FeaturedCard>
    )
  }

  return (
    <FeaturedCard eyebrow="Pla del dia" title={eyebrow} action={editAction}>
      {plans.length > 0 && (
        <div className="space-y-2">
          {plans.map((activity) => (
            <ActivityRow
              key={activity.id}
              activity={activity}
              status={statusFor(activity)}
              locationEditHref={editHref ? `${editHref}?activitat=${activity.id}` : undefined}
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
