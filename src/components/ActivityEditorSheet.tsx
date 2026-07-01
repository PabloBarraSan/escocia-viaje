import { useEffect, useState } from 'react'
import { Check, CheckCircle2, ChevronDown, MapPinned, Trash2 } from 'lucide-react'
import { DURATION_PRESETS } from '../lib/activities'
import { lodgingSearchLocation } from '../lib/googlePlaces'
import type { ActivityKind, Day } from '../lib/types'
import { LODGINGS_BY_DAY } from '../lib/types'
import { NearbyPlacesPicker } from './NearbyPlacesPicker'
import { PlaceAutocomplete } from './PlaceAutocomplete'

export type ActivityDraft = {
  kind: ActivityKind
  time: string
  text: string
  place_name: string
  place_address: string
  description: string
  maps_url: string
  duration_minutes: number | null
}

function KindPicker({
  value,
  onChange,
}: {
  value: ActivityKind
  onChange: (kind: ActivityKind) => void
}) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => onChange('plan')}
        className={`flex-1 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition ${
          value === 'plan'
            ? 'border-highland-600 bg-highland-50 text-highland-900'
            : 'border-gray-200 bg-white text-gray-600'
        }`}
      >
        Pla confirmat
      </button>
      <button
        type="button"
        onClick={() => onChange('idea')}
        className={`flex-1 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition ${
          value === 'idea'
            ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
            : 'border-gray-200 bg-white text-gray-600'
        }`}
      >
        Idea del grup
      </button>
    </div>
  )
}

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

type Props = {
  day: Day
  draft: ActivityDraft
  onChange: (draft: ActivityDraft) => void
}

function PlaceSection({
  day,
  draft,
  onChange,
  onPickPlace,
  activityHint,
}: Props & {
  onPickPlace: (placeName: string, mapsUrl: string, address: string) => void
  activityHint: string
}) {
  const hasPlace = Boolean(draft.place_name.trim() || draft.place_address.trim())
  const [open, setOpen] = useState(hasPlace)
  const lodging = lodgingSearchLocation(day)
  const lodgingInfo = LODGINGS_BY_DAY[day.day_number]
  const lodgingName = lodgingInfo?.name ?? day.base_city

  useEffect(() => {
    if (hasPlace) setOpen(true)
  }, [hasPlace])

  return (
    <div className="rounded-xl border border-highland-100 bg-highland-50/50">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-3 p-3 text-left"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-highland-700 shadow-sm">
          <MapPinned size={17} />
        </span>
        <span className="min-w-0 flex-1">
          <p className="text-xs font-bold text-highland-900">Lloc (opcional)</p>
          {hasPlace ? (
            <p className="truncate text-sm text-highland-800">{draft.place_name}</p>
          ) : (
            <p className="text-[11px] text-gray-500">Cercar o triar un lloc a prop de l’allotjament</p>
          )}
        </span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-gray-400 transition ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="space-y-3 border-t border-highland-100 px-3 pb-3 pt-2">
          <p className="text-[11px] text-gray-500">
            Cerca centrada en <span className="font-semibold text-highland-800">{lodgingName}</span>
          </p>
          <div>
            <label className="mb-1.5 block text-[11px] font-medium text-gray-500">Nom del lloc</label>
            <PlaceAutocomplete
              value={draft.place_name}
              mapsUrl={draft.maps_url}
              location={lodging}
              placeholder="Cerca pub, restaurant, museu..."
              onChange={(place_name, maps_url, address) => onChange({
                ...draft,
                place_name,
                maps_url,
                place_address: address ?? draft.place_address,
              })}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-medium text-gray-500">Adreça</label>
            <input
              type="text"
              value={draft.place_address}
              onChange={(e) => onChange({ ...draft, place_address: e.target.value })}
              placeholder="Carrer, ciutat..."
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm"
            />
          </div>
          <NearbyPlacesPicker day={day} activityText={activityHint} onPick={onPickPlace} />
        </div>
      )}
    </div>
  )
}

export function ActivityEditorFields({ day, draft, onChange }: Props) {
  const pickPlace = (placeName: string, mapsUrl: string, address: string) => {
    onChange({
      ...draft,
      place_name: placeName,
      place_address: address,
      maps_url: mapsUrl,
    })
  }

  const activityHint = [draft.text, draft.place_name].filter(Boolean).join(' ')

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
          Tipus
        </label>
        <KindPicker value={draft.kind} onChange={(kind) => onChange({ ...draft, kind })} />
        {draft.kind === 'idea' && (
          <p className="mt-1.5 text-xs text-emerald-700">
            Les idees es veuen en verd i el grup les pot votar des de la vista del dia.
          </p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
          Hora
        </label>
        <input
          type="time"
          value={draft.time}
          onChange={(e) => onChange({ ...draft, time: e.target.value })}
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
          Activitat
        </label>
        <input
          type="text"
          value={draft.text}
          onChange={(e) => onChange({ ...draft, text: e.target.value })}
          placeholder="Què fem? Sopar, visitar museu, arribada..."
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm"
        />
      </div>

      <PlaceSection
        day={day}
        draft={draft}
        onChange={onChange}
        activityHint={activityHint}
        onPickPlace={pickPlace}
      />

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
          Notes
        </label>
        <textarea
          value={draft.description}
          onChange={(e) => onChange({ ...draft, description: e.target.value })}
          placeholder="Reserva, recordatoris, detalls..."
          rows={2}
          className="w-full resize-y rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
          Duració
        </label>
        <DurationPicker
          value={draft.duration_minutes}
          onChange={(duration_minutes) => onChange({ ...draft, duration_minutes })}
        />
      </div>
    </div>
  )
}

export function ActivityEditorFooter({
  canSave,
  onSave,
  onDelete,
  onConfirmAsPlan,
}: {
  canSave: boolean
  onSave: () => void
  onDelete?: () => void
  onConfirmAsPlan?: () => void
}) {
  return (
    <div className="space-y-2">
      {onConfirmAsPlan && (
        <button
          type="button"
          onClick={onConfirmAsPlan}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-highland-600 bg-highland-50 px-4 py-3 text-sm font-semibold text-highland-800"
        >
          <CheckCircle2 size={16} /> Confirmar com a pla
        </button>
      )}
      <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={onSave}
        disabled={!canSave}
        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-highland-700 px-4 py-3 text-sm font-semibold text-white disabled:opacity-40"
      >
        <Check size={16} /> Guardar
      </button>
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600"
        >
          <Trash2 size={16} /> Esborrar
        </button>
      )}
    </div>
    </div>
  )
}
