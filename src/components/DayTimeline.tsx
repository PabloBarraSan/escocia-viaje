import { useRef, useState } from 'react'
import { ExternalLink, Lightbulb, Pencil, Plus } from 'lucide-react'
import { useTripContext } from '../context/TripContext'
import { useSession } from '../hooks/useSession'
import {
  activityBlockClass,
  buildTimelineLayout,
  formatDuration,
  formatTimeRange,
  hourMarkers,
  minuteFromTimelineY,
  minutesToTime,
  partitionActivities,
  sortActivities,
  suggestNextActivityTime,
  TIMELINE_PX_PER_HOUR,
} from '../lib/activities'
import type { Activity, Day } from '../lib/types'
import {
  ActivityEditorFields,
  ActivityEditorFooter,
  type ActivityDraft,
} from './ActivityEditorSheet'
import { BottomSheet } from './BottomSheet'

type EditorState =
  | { mode: 'add'; draft: ActivityDraft }
  | { mode: 'edit'; activityId: string; draft: ActivityDraft }
  | null

function emptyDraft(time = '09:00', kind: import('../lib/types').ActivityKind = 'plan'): ActivityDraft {
  return {
    kind,
    time,
    text: '',
    place_name: '',
    place_address: '',
    description: '',
    maps_url: '',
    duration_minutes: kind === 'idea' ? null : 60,
  }
}

function draftFromActivity(activity: Activity): ActivityDraft {
  return {
    kind: activity.kind === 'idea' ? 'idea' : 'plan',
    time: activity.time ?? '',
    text: activity.text,
    place_name: activity.place_name ?? '',
    place_address: activity.place_address ?? '',
    description: activity.description ?? '',
    maps_url: activity.maps_url ?? '',
    duration_minutes: activity.duration_minutes,
  }
}

export function DayTimeline({ day, activities }: { day: Day; activities: Activity[] }) {
  const { addActivity, updateActivity, removeActivity } = useTripContext()
  const { session } = useSession()
  const trackRef = useRef<HTMLDivElement>(null)
  const [editor, setEditor] = useState<EditorState>(null)

  const sorted = sortActivities(activities)
  const { plans, ideas } = partitionActivities(sorted)
  const layout = buildTimelineLayout(sorted, TIMELINE_PX_PER_HOUR)
  const markers = hourMarkers(layout.startMinutes, layout.endMinutes)

  const openAddAt = (minute: number, kind: import('../lib/types').ActivityKind = 'plan') => {
    setEditor({ mode: 'add', draft: emptyDraft(minutesToTime(minute), kind) })
  }

  const openAddIdea = () => {
    setEditor({ mode: 'add', draft: emptyDraft('', 'idea') })
  }

  const openEdit = (activity: Activity) => {
    setEditor({ mode: 'edit', activityId: activity.id, draft: draftFromActivity(activity) })
  }

  const closeEditor = () => setEditor(null)

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
        day.id,
        draft.text.trim(),
        draft.time,
        session.name,
        draft.duration_minutes,
        draft.description.trim(),
        draft.maps_url.trim() || null,
        draft.place_name.trim() || null,
        draft.place_address.trim() || null,
        draft.kind,
      )
    } else {
      await updateActivity(editor.activityId, {
        time: draft.time || undefined,
        text: draft.text.trim(),
        kind: draft.kind,
        place_name: draft.place_name.trim() || null,
        place_address: draft.place_address.trim() || null,
        description: draft.description.trim(),
        maps_url: draft.maps_url.trim() || null,
        duration_minutes: draft.duration_minutes,
      }, session.name)
    }
    closeEditor()
  }

  const deleteEditor = async () => {
    if (!editor || editor.mode !== 'edit') return
    if (!confirm('Esborrar activitat?')) return
    await removeActivity(editor.activityId)
    closeEditor()
  }

  const confirmAsPlan = async () => {
    if (!editor || editor.mode !== 'edit' || editor.draft.kind !== 'idea' || !session) return
    await updateActivity(editor.activityId, {
      kind: 'plan',
      duration_minutes: editor.draft.duration_minutes ?? 60,
    }, session.name)
    closeEditor()
  }

  const sheetTitle = editor?.mode === 'add'
    ? (editor.draft.kind === 'idea' ? 'Nova idea' : 'Nova activitat')
    : (editor?.draft.kind === 'idea' ? 'Editar idea' : 'Editar activitat')

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3 px-0.5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-highland-600">Pla del dia</p>
          <h2 className="font-display text-2xl font-bold text-highland-900">Horari</h2>
          <p className="mt-0.5 text-xs text-gray-500">Toca un espai buit per crear · toca un bloc per editar</p>
        </div>
        <span className="rounded-full bg-highland-50 px-2.5 py-1 text-xs font-semibold text-highland-700">
          {plans.length} {plans.length === 1 ? 'pla' : 'plans'}
          {ideas.length > 0 && ` · ${ideas.length} ${ideas.length === 1 ? 'idea' : 'idees'}`}
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
            {layout.blocks.map(({ activity, top, height }) => {
              const isIdea = activity.kind === 'idea'
              return (
              <button
                key={activity.id}
                type="button"
                data-activity-block
                onClick={(e) => { e.stopPropagation(); openEdit(activity) }}
                className={`absolute right-0 left-2 overflow-hidden rounded-xl border px-3 py-2 text-left shadow-sm transition hover:shadow-md ${activityBlockClass(activity.kind)}`}
                style={{ top, height, minHeight: 40 }}
              >
                {isIdea && (
                  <span className="mb-0.5 inline-flex items-center gap-0.5 rounded bg-emerald-200/80 px-1.5 py-0.5 text-[9px] font-bold uppercase text-emerald-900">
                    <Lightbulb size={9} /> Idea
                  </span>
                )}
                <p className={`truncate text-xs font-bold ${isIdea ? 'text-emerald-800' : 'text-highland-800'}`}>
                  {formatTimeRange(activity) ?? activity.time}
                </p>
                <p className="line-clamp-2 text-sm font-semibold leading-tight text-highland-900">{activity.text}</p>
                {activity.place_name?.trim() && (
                  <p className="mt-0.5 line-clamp-1 text-[11px] font-medium text-highland-700">
                    📍 {activity.place_name}
                  </p>
                )}
                {activity.place_address?.trim()
                  && activity.place_address !== activity.place_name && (
                  <p className="line-clamp-1 text-[10px] text-gray-500">{activity.place_address}</p>
                )}
                {activity.maps_url && (
                  <a
                    href={activity.maps_url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-semibold text-highland-700 underline-offset-2 hover:underline"
                  >
                    <ExternalLink size={10} /> Obrir a Maps
                  </a>
                )}
                {activity.description?.trim() && (
                  <p className="mt-0.5 line-clamp-1 text-[10px] text-gray-600">{activity.description}</p>
                )}
                {activity.duration_minutes && (
                  <p className={`mt-0.5 text-[10px] ${isIdea ? 'text-emerald-700' : 'text-highland-600'}`}>{formatDuration(activity.duration_minutes)}</p>
                )}
              </button>
            )})}
            {layout.blocks.length === 0 && (
              <p className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 text-center text-sm text-gray-400">
                Clica aquí per començar l’horari
              </p>
            )}
          </div>
        </div>
      </div>

      <BottomSheet
        open={editor != null}
        onClose={closeEditor}
        title={sheetTitle}
        footer={editor ? (
          <ActivityEditorFooter
            canSave={Boolean(editor.draft.text.trim())}
            onSave={() => void saveEditor()}
            onDelete={editor.mode === 'edit' ? () => void deleteEditor() : undefined}
            onConfirmAsPlan={
              editor.mode === 'edit' && editor.draft.kind === 'idea'
                ? () => void confirmAsPlan()
                : undefined
            }
          />
        ) : undefined}
      >
        {editor && (
          <ActivityEditorFields
            day={day}
            draft={editor.draft}
            onChange={(draft) => setEditor({ ...editor, draft })}
          />
        )}
      </BottomSheet>

      {layout.untimed.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Sense hora assignada</p>
          {layout.untimed.map((activity) => {
            const isIdea = activity.kind === 'idea'
            return (
            <button
              key={activity.id}
              type="button"
              onClick={() => openEdit(activity)}
              className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left hover:shadow-sm ${
                isIdea ? 'border-emerald-200 bg-emerald-50/60' : 'border-gray-100 bg-white hover:border-highland-200'
              }`}
            >
              <Pencil size={14} className={`mt-1 shrink-0 ${isIdea ? 'text-emerald-500' : 'text-gray-400'}`} />
              <div className="min-w-0">
                {isIdea && (
                  <span className="mb-1 inline-flex items-center gap-0.5 text-[10px] font-bold uppercase text-emerald-800">
                    <Lightbulb size={11} /> Idea
                  </span>
                )}
                <p className="text-sm font-medium text-gray-900">{activity.text}</p>
                {activity.place_name?.trim() && (
                  <p className="mt-0.5 text-xs text-highland-700">📍 {activity.place_name}</p>
                )}
                {activity.description?.trim() && (
                  <p className="mt-0.5 text-xs text-gray-600">{activity.description}</p>
                )}
              </div>
            </button>
          )})}
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => setEditor({ mode: 'add', draft: emptyDraft(suggestNextActivityTime(sorted)) })}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-highland-200 py-3 text-sm font-medium text-highland-700 hover:bg-highland-50"
        >
          <Plus size={16} />
          Afegir activitat
        </button>
        <button
          type="button"
          onClick={openAddIdea}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-emerald-300 py-3 text-sm font-medium text-emerald-800 hover:bg-emerald-50"
        >
          <Lightbulb size={16} />
          Proposar idea
        </button>
      </div>
    </div>
  )
}
