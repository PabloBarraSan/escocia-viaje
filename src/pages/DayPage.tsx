import { useState } from 'react'
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft, Bed, ChevronLeft, ChevronRight, ExternalLink, MapPinned, Navigation, Phone,
} from 'lucide-react'
import { useTripContext } from '../context/TripContext'
import { useSession } from '../hooks/useSession'
import { NotesPanel } from '../components/NotesPanel'
import { DAY_TYPE_COLORS, DAY_TYPE_LABELS, LODGINGS_BY_DAY } from '../lib/types'
import { SuggestionsBoard } from '../components/SuggestionsBoard'
import { IdeasBoard } from '../components/IdeasBoard'
import { WeatherCard } from '../components/WeatherCard'
import { PhotoHero } from '../components/PhotoHero'
import { DayTabs, type DayTab } from '../components/DayTabs'
import { DayTimeline } from '../components/DayTimeline'
import { DayChat } from '../components/DayChat'
import { CarLocationCard } from '../components/CarLocationCard'
import { dayRoute } from '../lib/maps'
import { dayPhoto, heroTint } from '../lib/dayTheme'

function parseTab(value: string | null): DayTab {
  if (value === 'practic' || value === 'grup') return value
  return 'horari'
}

export function DayPage() {
  const { dayNum } = useParams<{ dayNum: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { days, updateDay } = useTripContext()
  const { session } = useSession()
  const [editingLodging, setEditingLodging] = useState(false)
  const [lodging, setLodging] = useState('')
  const tab = parseTab(searchParams.get('tab'))

  const setTab = (next: DayTab) => {
    setSearchParams(next === 'horari' ? {} : { tab: next }, { replace: true })
  }

  const day = days.find((d) => d.day_number === Number(dayNum))

  if (!day) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center p-6">
        <p className="text-gray-500">Dia no trobat</p>
        <Link to="/dies" className="mt-4 text-highland-700">Tornar</Link>
      </div>
    )
  }

  const prev = days.find((d) => d.day_number === day.day_number - 1)
  const next = days.find((d) => d.day_number === day.day_number + 1)

  const saveLodging = async () => {
    await updateDay(day.id, { lodging }, session!.name)
    setEditingLodging(false)
  }

  const lodgingDetails = LODGINGS_BY_DAY[day.day_number] ?? (
    day.lodging_address ? {
      name: day.lodging_name ?? day.lodging ?? 'Allotjament',
      address: day.lodging_address,
      phone: day.lodging_phone ?? '',
    } : null
  )
  const lodgingDirections = lodgingDetails
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(lodgingDetails.address)}&travelmode=driving`
    : null
  const route = dayRoute(day.day_number)
  const isSkyeDay = day.day_number === 4 || day.day_number === 5
  const photo = dayPhoto(day)

  return (
    <div className="pb-6">
      <PhotoHero
        photo={photo.url}
        alt={photo.label}
        tint={heroTint(day)}
        className="rounded-none shadow-md"
        minHeight="8.75rem"
      >
        <div className="hero-safe-padding flex min-h-[8.75rem] flex-col justify-between gap-2 p-4 pb-3 text-white">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={() => navigate('/dies')}
              className="mt-0.5 rounded-full bg-black/25 p-2 hover:bg-black/40"
              aria-label="Tornar"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-bold uppercase tracking-wider text-white/70">Dia {day.day_number}</p>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${DAY_TYPE_COLORS[day.type]}`}>
                  {DAY_TYPE_LABELS[day.type]}
                </span>
              </div>
              <h1 className="font-display text-2xl font-bold leading-tight">{day.base_city}</h1>
              <p className="text-sm text-white/80">{day.label}</p>
            </div>
          </div>

          <div className="flex justify-between text-xs font-medium text-white/75">
            {prev ? (
              <button type="button" onClick={() => navigate(`/dia/${prev.day_number}`)} className="flex items-center gap-0.5">
                <ChevronLeft size={15} /> Dia {prev.day_number}
              </button>
            ) : <span />}
            {next ? (
              <button type="button" onClick={() => navigate(`/dia/${next.day_number}`)} className="flex items-center gap-0.5">
                Dia {next.day_number} <ChevronRight size={15} />
              </button>
            ) : <span />}
          </div>
        </div>
      </PhotoHero>

      <DayTabs value={tab} onChange={setTab} />

      <main className="space-y-5 px-4 pb-4">
        {tab === 'horari' && (
          <DayTimeline dayId={day.id} activities={day.activities ?? []} />
        )}

        {tab === 'practic' && (
          <div className="space-y-4">
            <WeatherCard day={day} />
            {route && (
              <a
                href={route.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-2xl border border-highland-100 bg-white p-3.5 shadow-sm transition active:scale-[0.99]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-highland-100 text-highland-700">
                  <Navigation size={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Ruta del dia</p>
                  <p className="truncate font-semibold text-highland-900">{route.label}</p>
                  <p className="text-xs text-gray-500">
                    {route.stops.length} {route.stops.length === 1 ? 'parada' : 'parades'} · Google Maps
                  </p>
                </span>
                <ExternalLink size={16} className="shrink-0 text-gray-300" />
              </a>
            )}

            <div className="rounded-2xl border border-highland-100 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-800">
                  <Bed size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Allotjament</p>
                  {lodgingDetails?.name && (
                    <p className="mt-0.5 font-semibold text-highland-900">{lodgingDetails.name}</p>
                  )}
                  {lodgingDetails?.address && (
                    <p className="mt-0.5 text-sm text-gray-600">{lodgingDetails.address}</p>
                  )}
                  {editingLodging ? (
                    <div className="mt-2 space-y-2">
                      <input
                        value={lodging}
                        onChange={(e) => setLodging(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button onClick={saveLodging} className="rounded-lg bg-highland-700 px-3 py-1.5 text-xs font-semibold text-white">
                          Guardar
                        </button>
                        <button onClick={() => setEditingLodging(false)} className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs">
                          Cancel·lar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setLodging(day.lodging ?? ''); setEditingLodging(true) }}
                      className="mt-1 text-left text-sm text-highland-700 underline-offset-2 hover:underline"
                    >
                      {day.lodging || 'Afegir nota d’allotjament...'}
                    </button>
                  )}
                </div>
              </div>
              {(lodgingDirections || lodgingDetails?.phone) && (
                <div className="mt-3 flex flex-wrap gap-2 border-t border-gray-100 pt-3">
                  {lodgingDirections && (
                    <a
                      href={lodgingDirections}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 rounded-xl bg-highland-700 px-3 py-2 text-xs font-semibold text-white"
                    >
                      <MapPinned size={14} /> Anar-hi
                    </a>
                  )}
                  {lodgingDetails?.phone && (
                    <a
                      href={`tel:${lodgingDetails.phone.replace(/\s/g, '')}`}
                      className="flex items-center gap-1.5 rounded-xl bg-highland-100 px-3 py-2 text-xs font-semibold text-highland-800"
                    >
                      <Phone size={14} /> Trucar
                    </a>
                  )}
                </div>
              )}
            </div>

            {day.day_number >= 3 && day.day_number <= 7 && <CarLocationCard compact />}
          </div>
        )}

        {tab === 'grup' && (
          <div className="space-y-4">
            <DayChat dayId={day.id} />
            <div className="rounded-2xl border border-highland-100 bg-white p-4 shadow-sm">
              <p className="mb-3 font-semibold text-highland-900">Notes del grup</p>
              <NotesPanel dayId={day.id} note={day.note} />
            </div>
            {isSkyeDay && <IdeasBoard />}
            <div className="rounded-2xl border border-highland-100 bg-white p-4 shadow-sm">
              <p className="mb-1 font-semibold text-highland-900">Suggeriments i llocs</p>
              <p className="mb-3 text-xs text-gray-500">Proposa restaurants, parades i activitats</p>
              <SuggestionsBoard day={day} />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
