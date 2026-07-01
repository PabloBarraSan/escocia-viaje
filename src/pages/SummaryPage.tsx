import { useState } from 'react'
import { Car, Bed, Pencil, Check, X } from 'lucide-react'
import { useTripContext } from '../context/TripContext'
import { useSession } from '../hooks/useSession'
import { Checklist } from '../components/Checklist'
import { PendingDecisions } from '../components/PendingDecisions'

const INFO_LABELS: Record<string, string> = {
  nits_edimburg: 'Nits a Edimburg',
  nits_inverness: 'Nits a Inverness',
  nits_skye: 'Nits a Skye',
  nits_fort_william: 'Nits a Fort William',
  cotxe: 'Lloguer de cotxe',
  ruta_cotxe: 'Rutes en cotxe',
  vols: 'Vols',
  matricula_cotxe: 'Matrícula i dades del cotxe',
  telefon_emergencia: 'Contacte d’emergència',
  asseguranca: 'Assegurança de viatge',
}

function TripInfoItem({ id, infoKey, value, updatedBy, updatedAt }: {
  id: string
  infoKey: string
  value: string
  updatedBy: string | null
  updatedAt: string
}) {
  const { saveTripInfo } = useTripContext()
  const { session } = useSession()
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(value)

  const save = async () => {
    await saveTripInfo(id, text, session!.name)
    setEditing(false)
  }

  return (
    <div className="rounded-xl bg-white p-4 border border-gray-100">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
        {INFO_LABELS[infoKey] ?? infoKey}
      </p>
      {editing ? (
        <div className="space-y-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            autoFocus
          />
          <div className="flex gap-2">
            <button onClick={save} className="flex items-center gap-1 rounded-lg bg-highland-700 px-3 py-1 text-xs text-white">
              <Check size={12} /> Guardar
            </button>
            <button onClick={() => { setText(value); setEditing(false) }} className="flex items-center gap-1 rounded-lg bg-gray-200 px-3 py-1 text-xs">
              <X size={12} /> Cancel·lar
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setEditing(true)} className="group flex w-full items-start justify-between text-left">
          <p className="text-sm text-gray-800">{value}</p>
          <Pencil size={14} className="shrink-0 ml-2 text-gray-300 group-hover:text-highland-600" />
        </button>
      )}
      {updatedBy && updatedAt && (
        <p className="mt-1 text-[10px] text-gray-400">per {updatedBy}</p>
      )}
    </div>
  )
}

export function SummaryPage() {
  const { trip, tripInfo, days } = useTripContext()

  return (
    <div className="safe-top space-y-6 p-4">
      <header>
        <h1 className="font-display text-xl font-bold text-highland-800">Resum del viatge</h1>
        <p className="text-sm text-gray-500">{days.length} dies · 5–12 juliol 2026</p>
      </header>

      {trip?.car_rental_from && (
        <div className="flex items-center gap-3 rounded-2xl bg-highland-700 p-4 text-white">
          <Car size={24} />
          <div>
            <p className="font-semibold">Cotxe de lloguer</p>
            <p className="text-sm text-highland-200">
              {trip.car_rental_from} → {trip.car_rental_to} (5 dies)
            </p>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
          <Bed size={16} /> Allotjaments
        </h2>
        {tripInfo.map((info) => (
          <TripInfoItem
            key={info.id}
            id={info.id}
            infoKey={info.key}
            value={info.value}
            updatedBy={info.updated_by}
            updatedAt={info.updated_at}
          />
        ))}
      </div>

      <Checklist />
      <PendingDecisions />
    </div>
  )
}
