import { useRef, useState } from 'react'
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useTripContext } from '../context/TripContext'
import { useSession } from '../hooks/useSession'
import {
  buildTimelineLayout,
  DURATION_PRESETS,
  formatDuration,
  formatTimeRange,
  hourMarkers,
  minuteFromTimelineY,
  minutesToTime,
  sortActivities,
  suggestNextActivityTime,
  TIMELINE_PX_PER_HOUR,
} from '../lib/activities'
import type { Activity } from '../lib/types'

type ActivityDraft = {
  time: string
  text: string
  description: string
  duration_minutes: number | null
}

type EditorState =
  | { mode: 'add'; draft: ActivityDraft }
  | { mode: 'edit'; activityId: string; draft: ActivityDraft }
  | null

function DurationPicker({
  value,
  onChange,
}: {
  value: number | null
  onChange: (minutes: number | null) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {DURATION_PRESETS.map((preset) => (
        <button
          key={preset.value}
          type="button"
          onClick={() => onChange(preset.value)}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
            value === preset.value ? 'bg-highland-700 text-white' : 'bg-gray-100 text-gray-700'
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
  )
}

function ActivityForm({
  title,
  draft,
  onChange,
  onSave,
  onCancel,
  onDelete,
}: {
  title: string
  draft: ActivityDraft
  onChange: (draft: ActivityDraft) => void
  onSave: () => void
  onCancel: () => void
  onDelete?: () => void
}) {
  return (
    <div className="space-y-3 rounded-2xl border-2 border-highland-300 bg-highland-50 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-bold text-highland-900">{title}</p>
        <button type="button" onClick={onCancel} className="rounded-lg p-1 text-gray-400 hover:bg-white" aria-label="Tancar">
          <X size={18} />
        </button>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">Hora</label>
        <input
          type="time"
          value={draft.time}
          onChange={(e) => onChange({ ...draft, time: e.target.value })}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">Títol</label>
        <input
          type="text"
          value={draft.text}
          onChange={(e) => onChange({ ...draft, text: e.target.value })}
          placeholder="Què fem?"
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
          autoFocus
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">Descripció (opcional)</label>
        <textarea
          value={draft.description}
          onChange={(e) => onChange({ ...draft, description: e.target.value })}
          placeholder="Detalls, adreça, enllaç, recordatoris..."
          rows={2}
          className="w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">Duració</label>
        <DurationPicker
          value={draft.duration_minutes}
          onChange={(duration_minutes) => onChange({ ...draft, duration_minutes })}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onSave}
          disabled={!draft.text.trim()}
          className="flex items-center gap-1 rounded-lg bg-highland-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          <Check size={15} /> Guardar
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="flex items-center gap-1 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600"
          >
            <Trash2 size={15} /> Esborrar
          </button>
        )}
      </div>
    </div>
  )
}

function emptyDraft(time = '09:00'): ActivityDraft {
  return { time, text: '', description: '', duration_minutes: 60 }
}

function draftFromActivity(activity: Activity): ActivityDraft {
  return {
    time: activity.time ?? '',
    text: activity.text,
    description: activity.description ?? '',
    duration_minutes: activity.duration_minutes,
  }
}

export function DayTimeline({ dayId, activities }: { dayId: string; activities: Activity[] }) {
  const { addActivity, updateActivity, removeActivity } = useTripContext()
  const { session } = useSession()
  const trackRef = useRef<HTMLDivElement>(null)
  const [editor, setEditor] = useState<EditorState>(null)

  const sorted = sortActivities(activities)
  const layout = buildTimelineLayout(sorted, TIMELINE_PX_PER_HOUR)
  const markers = hourMarkers(layout.startMinutes, layout.endMinutes)

  const openAddAt = (minute: number) => {
    setEditor({ mode: 'add', draft: emptyDraft(minutesToTime(minute)) })
  }

  const openEdit = (activity: Activity) => {
    setEditor({ mode: 'edit', activityId: activity.id, draft: draftFromActivity(activity) })
  }

  const handleTrackClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('[data-activity-block]')) return
    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect) return
    const y = event.clientY - rect.top
    openAddAt(minuteFromTimelineY(y, layout.height, layout.startMinutes, layout.endMinutes))
  }

  const saveEditor = async () => {
    if (!editor || !session || !editor.draft.text.trim()) return
    const { draft } = editor
    if (editor.mode === 'add') {
      await addActivity(
        dayId,
        draft.text.trim(),
        draft.time,
        session.name,
        draft.duration_minutes,
        draft.description.trim(),
      )
    } else {
      await updateActivity(editor.activityId, {
        time: draft.time || undefined,
        text: draft.text.trim(),
        description: draft.description.trim(),
        duration_minutes: draft.duration_minutes,
      }, session.name)
    }
    setEditor(null)
  }

  const deleteEditor = async () => {
    if (!editor || editor.mode !== 'edit') return
    if (!confirm('Esborrar activitat?')) return
    await removeActivity(editor.activityId)
    setEditor(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3 px-0.5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-highland-600">Pla del dia</p>
          <h2 className="font-display text-2xl font-bold text-highland-900">Horari</h2>
          <p className="mt-0.5 text-xs text-gray-500">Toca un espai buit per crear · toca un bloc per editar</p>
        </div>
        <span className="rounded-full bg-highland-50 px-2.5 py-1 text-xs font-semibold text-highland-700">
          {sorted.length} {sorted.length === 1 ? 'activitat' : 'activitats'}
        </span>
      </div>

      <div className="rounded-2xl border border-highland-100 bg-white p-3 shadow-sm">
        <div className="flex gap-3">
          <div className="relative w-11 shrink-0" style={{ height: layout.height }}>
            {markers.map((minute) => (
              <button
                key={minute}
                type="button"
                onClick={() => openAddAt(minute)}
                className="absolute left-0 -translate-y-1/2 rounded px-0.5 text-left text-[10px] font-semibold text-gray-400 hover:bg-highland-50 hover:text-highland-700"
                style={{ top: ((minute - layout.startMinutes) / 60) * TIMELINE_PX_PER_HOUR }}
                title={`Afegir activitat a les ${minutesToTime(minute)}`}
              >
                {minutesToTime(minute)}
              </button>
            ))}
          </div>
          <div
            ref={trackRef}
            role="button"
            tabIndex={0}
            onClick={handleTrackClick}
            onKeyDown={(e) => { if (e.key === 'Enter') openAddAt(layout.startMinutes) }}
            className="relative min-h-0 flex-1 cursor-pointer border-l border-dashed border-highland-200 bg-highland-50/30"
            style={{ height: layout.height }}
            aria-label="Horari del dia. Clica per afegir activitat."
          >
            {layout.blocks.map(({ activity, top, height }) => (
              <button
                key={activity.id}
                type="button"
                data-activity-block
                onClick={(e) => { e.stopPropagation(); openEdit(activity) }}
                className="absolute right-0 left-2 overflow-hidden rounded-xl border border-highland-300 bg-gradient-to-br from-highland-100 to-white px-3 py-2 text-left shadow-sm transition hover:border-highland-500 hover:shadow-md"
                style={{ top, height, minHeight: 40 }}
              >
                <p className="truncate text-xs font-bold text-highland-800">
                  {formatTimeRange(activity) ?? activity.time}
                </p>
                <p className="line-clamp-2 text-sm font-semibold leading-tight text-highland-900">{activity.text}</p>
                {activity.description?.trim() && (
                  <p className="mt-0.5 line-clamp-1 text-[10px] text-gray-600">{activity.description}</p>
                )}
                {activity.duration_minutes && (
                  <p className="mt-0.5 text-[10px] text-highland-600">{formatDuration(activity.duration_minutes)}</p>
                )}
              </button>
            ))}
            {layout.blocks.length === 0 && (
              <p className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 text-center text-sm text-gray-400">
                Clica aquí per començar l’horari
              </p>
            )}
          </div>
        </div>
      </div>

      {editor && (
        <ActivityForm
          title={editor.mode === 'add' ? 'Nova activitat' : 'Editar activitat'}
          draft={editor.draft}
          onChange={(draft) => setEditor({ ...editor, draft })}
          onSave={() => void saveEditor()}
          onCancel={() => setEditor(null)}
          onDelete={editor.mode === 'edit' ? () => void deleteEditor() : undefined}
        />
      )}

      {layout.untimed.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Sense hora assignada</p>
          {layout.untimed.map((activity) => (
            <button
              key={activity.id}
              type="button"
              onClick={() => openEdit(activity)}
              className="flex w-full items-start gap-3 rounded-xl border border-gray-100 bg-white p-3 text-left hover:border-highland-200"
            >
              <Pencil size={14} className="mt-1 shrink-0 text-gray-400" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900">{activity.text}</p>
                {activity.description?.trim() && (
                  <p className="mt-0.5 text-xs text-gray-600">{activity.description}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {!editor && (
        <button
          type="button"
          onClick={() => setEditor({ mode: 'add', draft: emptyDraft(suggestNextActivityTime(sorted)) })}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-highland-200 py-3 text-sm font-medium text-highland-700 hover:bg-highland-50"
        >
          <Plus size={16} />
          Afegir activitat
        </button>
      )}
    </div>
  )
}
