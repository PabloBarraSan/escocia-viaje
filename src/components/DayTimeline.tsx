import { useState } from 'react'
import { Check, Pencil, Plus, Trash2 } from 'lucide-react'
import { useTripContext } from '../context/TripContext'
import { useSession } from '../hooks/useSession'
import {
  buildTimelineLayout,
  DURATION_PRESETS,
  formatDuration,
  formatTimeRange,
  hourMarkers,
  minutesToTime,
  sortActivities,
  suggestNextActivityTime,
} from '../lib/activities'
import type { Activity } from '../lib/types'

function DurationPicker({
  value,
  onChange,
}: {
  value: number | null
  onChange: (minutes: number | null) => void
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-gray-500">Duració</p>
      <div className="flex flex-wrap gap-2">
        {DURATION_PRESETS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => onChange(preset.value)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
              value === preset.value
                ? 'bg-highland-700 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {preset.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
            value === null ? 'bg-highland-700 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          Sense duració
        </button>
      </div>
    </div>
  )
}

function ActivityEditor({
  initial,
  onSave,
  onCancel,
}: {
  initial: { time: string; text: string; duration_minutes: number | null }
  onSave: (value: { time: string; text: string; duration_minutes: number | null }) => void
  onCancel: () => void
}) {
  const [time, setTime] = useState(initial.time)
  const [text, setText] = useState(initial.text)
  const [duration, setDuration] = useState(initial.duration_minutes)

  return (
    <div className="space-y-3 rounded-xl border-2 border-highland-300 bg-highland-50 p-3">
      <input
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
      />
      <DurationPicker value={duration} onChange={setDuration} />
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
        autoFocus
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onSave({ time, text, duration_minutes: duration })}
          className="flex items-center gap-1 rounded-lg bg-highland-700 px-3 py-1.5 text-sm text-white"
        >
          <Check size={14} /> Guardar
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg bg-gray-200 px-3 py-1.5 text-sm">
          Cancel·lar
        </button>
      </div>
    </div>
  )
}

function ActivityRow({ activity }: { activity: Activity }) {
  const { updateActivity, removeActivity } = useTripContext()
  const { session } = useSession()
  const [editing, setEditing] = useState(false)

  if (editing) {
    return (
      <ActivityEditor
        initial={{
          time: activity.time ?? '',
          text: activity.text,
          duration_minutes: activity.duration_minutes,
        }}
        onSave={async (value) => {
          await updateActivity(activity.id, {
            time: value.time || undefined,
            text: value.text,
            duration_minutes: value.duration_minutes,
          }, session!.name)
          setEditing(false)
        }}
        onCancel={() => setEditing(false)}
      />
    )
  }

  return (
    <div className="group flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-3">
      <div className="min-w-[4.5rem] shrink-0">
        {activity.time ? (
          <>
            <p className="text-sm font-bold text-highland-800">{activity.time}</p>
            {formatTimeRange(activity) && formatTimeRange(activity) !== activity.time && (
              <p className="text-[10px] text-gray-500">{formatTimeRange(activity)}</p>
            )}
          </>
        ) : (
          <p className="text-xs text-gray-400">Sense hora</p>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-snug text-gray-900">{activity.text}</p>
        {activity.duration_minutes && (
          <p className="mt-0.5 text-xs text-highland-600">{formatDuration(activity.duration_minutes)}</p>
        )}
      </div>
      <div className="flex shrink-0 gap-1 opacity-70 group-hover:opacity-100">
        <button type="button" onClick={() => setEditing(true)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100" aria-label="Editar">
          <Pencil size={15} />
        </button>
        <button
          type="button"
          onClick={() => { if (confirm('Esborrar activitat?')) removeActivity(activity.id) }}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
          aria-label="Esborrar"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  )
}

export function DayTimeline({ dayId, activities }: { dayId: string; activities: Activity[] }) {
  const { addActivity } = useTripContext()
  const { session } = useSession()
  const [adding, setAdding] = useState(false)
  const [newTime, setNewTime] = useState('')
  const [newText, setNewText] = useState('')
  const [newDuration, setNewDuration] = useState<number | null>(60)

  const sorted = sortActivities(activities)
  const layout = buildTimelineLayout(sorted)
  const markers = hourMarkers(layout.startMinutes, layout.endMinutes)
  const firstTimed = sorted.find((activity) => activity.time)

  const openAdd = () => {
    setNewTime(suggestNextActivityTime(sorted))
    setNewText('')
    setNewDuration(60)
    setAdding(true)
  }

  const handleAdd = async () => {
    if (!newText.trim() || !session) return
    await addActivity(dayId, newText.trim(), newTime, session.name, newDuration)
    setAdding(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3 px-0.5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-highland-600">Pla del dia</p>
          <h2 className="font-display text-2xl font-bold text-highland-900">Horari</h2>
        </div>
        <span className="rounded-full bg-highland-50 px-2.5 py-1 text-xs font-semibold text-highland-700">
          {sorted.length} {sorted.length === 1 ? 'activitat' : 'activitats'}
        </span>
      </div>

      {layout.blocks.length > 0 ? (
        <div className="rounded-2xl border border-highland-100 bg-white p-3 shadow-sm">
          <div className="flex gap-3">
            <div className="relative w-11 shrink-0" style={{ height: layout.height }}>
              {markers.map((minute) => (
                <span
                  key={minute}
                  className="absolute left-0 -translate-y-1/2 text-[10px] font-semibold text-gray-400"
                  style={{ top: ((minute - layout.startMinutes) / 60) * 52 }}
                >
                  {minutesToTime(minute)}
                </span>
              ))}
            </div>
            <div className="relative min-h-0 flex-1 border-l border-dashed border-highland-200" style={{ height: layout.height }}>
              {layout.blocks.map(({ activity, top, height }) => (
                <div
                  key={activity.id}
                  className="absolute right-0 left-2 rounded-xl border border-highland-200 bg-gradient-to-br from-highland-50 to-white px-3 py-2 shadow-sm"
                  style={{ top, height, minHeight: 36 }}
                >
                  <p className="truncate text-xs font-bold text-highland-800">{formatTimeRange(activity) ?? activity.time}</p>
                  <p className="line-clamp-2 text-sm font-medium leading-tight text-highland-900">{activity.text}</p>
                  {activity.duration_minutes && (
                    <p className="mt-0.5 text-[10px] text-highland-600">{formatDuration(activity.duration_minutes)}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-highland-200 bg-white p-6 text-center text-sm text-gray-500">
          Encara no hi ha activitats amb hora. Afegeix la primera per omplir l’horari del dia.
        </div>
      )}

      {layout.untimed.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Sense hora assignada</p>
          {layout.untimed.map((activity) => (
            <ActivityRow key={activity.id} activity={activity} />
          ))}
        </div>
      )}

      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Llista completa</p>
        {sorted.filter((activity) => activity.time).map((activity) => (
          <ActivityRow key={`list-${activity.id}`} activity={activity} />
        ))}
      </div>

      {adding ? (
        <div className="rounded-xl border-2 border-dashed border-highland-300 bg-white p-3">
          <p className="mb-2 text-sm font-semibold text-highland-800">Nova activitat</p>
          <div className="space-y-3">
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
            <DurationPicker value={newDuration} onChange={setNewDuration} />
            <input
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Què fem?"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              autoFocus
            />
            <div className="flex gap-2">
              <button type="button" onClick={handleAdd} className="rounded-lg bg-highland-700 px-3 py-1.5 text-sm text-white">
                Afegir
              </button>
              <button type="button" onClick={() => setAdding(false)} className="rounded-lg bg-gray-200 px-3 py-1.5 text-sm">
                Cancel·lar
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={openAdd}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-highland-200 py-3 text-sm font-medium text-highland-700 hover:bg-highland-50"
        >
          <Plus size={16} />
          {firstTimed ? 'Afegir al horari' : 'Començar l’horari'}
        </button>
      )}
    </div>
  )
}
