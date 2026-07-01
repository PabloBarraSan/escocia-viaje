import { useState } from 'react'
import { Pencil, Trash2, Plus, Check, X } from 'lucide-react'
import { useTripContext } from '../context/TripContext'
import { useSession } from '../hooks/useSession'
import { sortActivities } from '../lib/activities'
import type { Activity } from '../lib/types'

function formatUpdated(updatedBy: string | null, updatedAt: string) {
  if (!updatedBy || !updatedAt) return null
  const diff = Date.now() - new Date(updatedAt).getTime()
  const mins = Math.floor(diff / 60000)
  const label = mins < 1 ? 'ara mateix' : mins < 60 ? `fa ${mins} min` : `fa ${Math.floor(mins / 60)}h`
  return `Actualitzat per ${updatedBy} ${label}`
}

function ActivityItem({ activity, featured = false }: { activity: Activity; featured?: boolean }) {
  const { updateActivity, removeActivity } = useTripContext()
  const { session } = useSession()
  const [editing, setEditing] = useState(false)
  const [time, setTime] = useState(activity.time ?? '')
  const [text, setText] = useState(activity.text)

  const save = async () => {
    await updateActivity(activity.id, { time, text }, session!.name)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="rounded-xl border-2 border-highland-300 bg-highland-50 p-3 space-y-2">
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          autoFocus
        />
        <div className="flex gap-2">
          <button onClick={save} className="flex items-center gap-1 rounded-lg bg-highland-700 px-3 py-1.5 text-sm text-white">
            <Check size={14} /> Guardar
          </button>
          <button onClick={() => setEditing(false)} className="flex items-center gap-1 rounded-lg bg-gray-200 px-3 py-1.5 text-sm">
            <X size={14} /> Cancel·lar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`group flex items-start gap-3 rounded-xl border border-gray-100 bg-white ${featured ? 'p-3.5' : 'p-3'}`}>
      {activity.time && (
        <span className={`shrink-0 rounded-lg bg-highland-100 font-bold text-highland-800 ${featured ? 'px-2.5 py-1.5 text-sm' : 'px-2 py-1 text-xs font-semibold text-highland-700'}`}>
          {activity.time}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className={featured ? 'text-base leading-snug text-gray-900' : 'text-sm text-gray-800'}>{activity.text}</p>
        {formatUpdated(activity.updated_by, activity.updated_at) && (
          <p className="mt-1 text-[10px] text-gray-400">{formatUpdated(activity.updated_by, activity.updated_at)}</p>
        )}
      </div>
      <div className="flex shrink-0 gap-1 opacity-60 group-hover:opacity-100">
        <button onClick={() => setEditing(true)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-highland-700" aria-label="Editar">
          <Pencil size={16} />
        </button>
        <button
          onClick={() => { if (confirm('Esborrar activitat?')) removeActivity(activity.id) }}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
          aria-label="Esborrar"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}

export function ActivityList({
  dayId,
  activities,
  featured = false,
  count,
}: {
  dayId: string
  activities: Activity[]
  featured?: boolean
  count?: number
}) {
  const { addActivity } = useTripContext()
  const { session } = useSession()
  const [adding, setAdding] = useState(false)
  const [newTime, setNewTime] = useState('')
  const [newText, setNewText] = useState('')

  const handleAdd = async () => {
    if (!newText.trim()) return
    await addActivity(dayId, newText.trim(), newTime, session!.name)
    setNewText('')
    setNewTime('')
    setAdding(false)
  }

  const sorted = sortActivities(activities)
  const total = count ?? sorted.length

  const list = (
    <div className="space-y-2">
      {sorted.map((a) => (
        <ActivityItem key={a.id} activity={a} featured={featured} />
      ))}

      {adding ? (
        <div className="rounded-xl border-2 border-dashed border-highland-300 p-3 space-y-2">
          <input
            type="time"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            placeholder="Hora"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
          <input
            type="text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Nova activitat..."
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            autoFocus
          />
          <div className="flex gap-2">
            <button onClick={handleAdd} className="rounded-lg bg-highland-700 px-3 py-1.5 text-sm text-white">Afegir</button>
            <button onClick={() => setAdding(false)} className="rounded-lg bg-gray-200 px-3 py-1.5 text-sm">Cancel·lar</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className={`flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed py-3 text-sm font-medium text-highland-600 hover:border-highland-400 hover:bg-highland-50 ${featured ? 'border-highland-200' : 'border-highland-200'}`}
        >
          <Plus size={16} /> Afegir activitat
        </button>
      )}
    </div>
  )

  if (featured) {
    return (
      <section className="rounded-2xl border border-highland-200 bg-white p-4 shadow-sm ring-1 ring-highland-100/80">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-highland-600">Pla del dia</p>
            <h2 className="font-display text-2xl font-bold text-highland-900">Itinerari</h2>
          </div>
          <span className="rounded-full bg-highland-50 px-2.5 py-1 text-xs font-semibold text-highland-700">
            {total} {total === 1 ? 'activitat' : 'activitats'}
          </span>
        </div>
        {list}
      </section>
    )
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Activitats</h3>
      {list}
    </div>
  )
}
