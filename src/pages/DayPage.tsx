import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight, Bed } from 'lucide-react'
import { useTripContext } from '../context/TripContext'
import { useSession } from '../hooks/useSession'
import { ActivityList } from '../components/ActivityList'
import { NotesPanel } from '../components/NotesPanel'
import { DAY_TYPE_COLORS, DAY_TYPE_LABELS } from '../lib/types'
import { SuggestionsBoard } from '../components/SuggestionsBoard'

export function DayPage() {
  const { dayNum } = useParams<{ dayNum: string }>()
  const navigate = useNavigate()
  const { days, updateDay } = useTripContext()
  const { session } = useSession()
  const [editingLodging, setEditingLodging] = useState(false)
  const [lodging, setLodging] = useState('')

  const day = days.find((d) => d.day_number === Number(dayNum))

  if (!day) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center p-6">
        <p className="text-gray-500">Dia no trobat</p>
        <Link to="/" className="mt-4 text-highland-700">Tornar</Link>
      </div>
    )
  }

  const prev = days.find((d) => d.day_number === day.day_number - 1)
  const next = days.find((d) => d.day_number === day.day_number + 1)

  const saveLodging = async () => {
    await updateDay(day.id, { lodging }, session!.name)
    setEditingLodging(false)
  }

  return (
    <div className="safe-top">
      <header className="sticky top-0 z-40 bg-highland-50/95 backdrop-blur border-b border-highland-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="rounded-full p-2 hover:bg-highland-100" aria-label="Tornar">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-highland-800">Dia {day.day_number}</h1>
            <p className="text-sm text-gray-500">{day.label}</p>
          </div>
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${DAY_TYPE_COLORS[day.type]}`}>
            {DAY_TYPE_LABELS[day.type]}
          </span>
        </div>
        <div className="mt-2 flex justify-between">
          {prev ? (
            <button onClick={() => navigate(`/dia/${prev.day_number}`)} className="flex items-center gap-1 text-sm text-highland-600">
              <ChevronLeft size={16} /> Dia {prev.day_number}
            </button>
          ) : <span />}
          {next ? (
            <button onClick={() => navigate(`/dia/${next.day_number}`)} className="flex items-center gap-1 text-sm text-highland-600">
              Dia {next.day_number} <ChevronRight size={16} />
            </button>
          ) : <span />}
        </div>
      </header>

      <div className="space-y-6 p-4">
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-highland-100">
          <p className="text-2xl font-bold text-highland-800">{day.base_city}</p>
          <div className="mt-2 flex items-start gap-2">
            <Bed size={16} className="mt-0.5 shrink-0 text-highland-500" />
            {editingLodging ? (
              <div className="flex-1 space-y-2">
                <input
                  value={lodging}
                  onChange={(e) => setLodging(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button onClick={saveLodging} className="rounded-lg bg-highland-700 px-3 py-1 text-xs text-white">Guardar</button>
                  <button onClick={() => setEditingLodging(false)} className="rounded-lg bg-gray-200 px-3 py-1 text-xs">Cancel·lar</button>
                </div>
              </div>
            ) : (
              <button onClick={() => { setLodging(day.lodging ?? ''); setEditingLodging(true) }} className="text-left text-sm text-gray-600 hover:text-highland-700">
                {day.lodging || 'Afegir allotjament...'}
              </button>
            )}
          </div>
        </div>

        <ActivityList dayId={day.id} activities={day.activities ?? []} />
        <SuggestionsBoard day={day} />
        <NotesPanel dayId={day.id} note={day.note} />
      </div>
    </div>
  )
}
