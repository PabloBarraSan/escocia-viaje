import { Link } from 'react-router-dom'
import { CalendarCheck, Lightbulb, Pencil, ThumbsUp } from 'lucide-react'
import { useTripContext } from '../context/TripContext'
import { useSession } from '../hooks/useSession'
import { partitionActivities } from '../lib/activities'
import type { Activity, Day } from '../lib/types'
import { FeaturedCard } from './PageSection'

function ActivityRow({
  activity,
  onVote,
  voted,
}: {
  activity: Activity
  onVote?: () => void
  voted?: boolean
}) {
  const isIdea = activity.kind === 'idea'
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border p-3.5 ${
        isIdea
          ? 'border-emerald-200 bg-emerald-50/60'
          : 'border-gray-100 bg-highland-50/40'
      }`}
    >
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
        <span className={`shrink-0 rounded-lg px-2.5 py-1 text-sm font-bold ${
          isIdea ? 'bg-emerald-100 text-emerald-900' : 'bg-highland-100 text-highland-800'
        }`}
        >
          {activity.time}
        </span>
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="text-base leading-snug text-gray-900">{activity.text}</p>
        {activity.place_name?.trim() && (
          <p className="mt-0.5 text-xs text-highland-700">📍 {activity.place_name}</p>
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

  if (activities.length === 0) {
    return (
      <FeaturedCard eyebrow="Pla del dia" title={eyebrow} badge="Buit">
        <p className="text-sm text-gray-500">Encara no hi ha activitats previstes.</p>
        {editHref && (
          <Link
            to={editHref}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-highland-700 px-4 py-3 text-sm font-semibold text-white"
          >
            <Pencil size={16} /> Editar horari
          </Link>
        )}
      </FeaturedCard>
    )
  }

  return (
    <FeaturedCard
      eyebrow="Pla del dia"
      title={eyebrow}
      badge={`${plans.length} ${plans.length === 1 ? 'activitat' : 'activitats'}`}
    >
      {plans.length > 0 && (
        <div className="space-y-2">
          {plans.map((activity) => (
            <ActivityRow key={activity.id} activity={activity} />
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
              />
            ))}
          </div>
        </div>
      )}

      {editHref && (
        <Link
          to={editHref}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-highland-200 bg-white py-3 text-sm font-semibold text-highland-800 transition hover:bg-highland-50"
        >
          <Pencil size={16} /> Editar horari
        </Link>
      )}
    </FeaturedCard>
  )
}

export function DayItineraryCompact({ day }: { day: Day }) {
  const activities = day.activities ?? []
  const { plans } = partitionActivities(activities)
  const preview = plans.slice(0, 3)
  if (!preview.length) return null

  return (
    <Link
      to={`/dia/${day.day_number}`}
      className="flex items-center gap-2 text-sm font-semibold text-highland-700"
    >
      <CalendarCheck size={16} /> Veure itinerari complet
    </Link>
  )
}
