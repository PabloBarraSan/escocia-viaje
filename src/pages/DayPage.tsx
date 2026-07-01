import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, ChevronLeft, ChevronRight, Bed, MapPinned, Navigation, Phone,
} from 'lucide-react'
import { useTripContext } from '../context/TripContext'
import { useSession } from '../hooks/useSession'
import { ActivityList } from '../components/ActivityList'
import { NotesPanel } from '../components/NotesPanel'
import { DAY_TYPE_COLORS, DAY_TYPE_LABELS, LODGINGS_BY_DAY } from '../lib/types'
import { SuggestionsBoard } from '../components/SuggestionsBoard'
import { IdeasBoard } from '../components/IdeasBoard'
import { ShareWhatsAppButton } from '../components/ShareWhatsAppButton'
import { WeatherCard } from '../components/WeatherCard'
import { PhotoHero } from '../components/PhotoHero'
import { dayRoute } from '../lib/maps'
import { dayPhoto, heroTint } from '../lib/dayTheme'

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
    <div>
      <PhotoHero
        photo={photo.url}
        alt={photo.label}
        tint={heroTint(day)}
        className="sticky top-0 z-40 rounded-none shadow-md"
        minHeight="9.5rem"
      >
        <div className="hero-safe-padding flex min-h-[9.5rem] flex-col justify-between p-4 pb-3 text-white">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/dies')}
              className="rounded-full bg-black/25 p-2 hover:bg-black/40"
              aria-label="Tornar"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="min-w-0 flex-1">
              <p className="font-display text-lg font-bold leading-tight">Dia {day.day_number}</p>
              <p className="truncate text-sm text-white/75">{day.label}</p>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${DAY_TYPE_COLORS[day.type]}`}>
              {DAY_TYPE_LABELS[day.type]}
            </span>
          </div>

          <h1 className="font-display text-2xl font-bold leading-tight">{day.base_city}</h1>

          <div className="flex justify-between text-sm text-white/80">
            {prev ? (
              <button type="button" onClick={() => navigate(`/dia/${prev.day_number}`)} className="flex items-center gap-1">
                <ChevronLeft size={16} /> Dia {prev.day_number}
              </button>
            ) : <span />}
            {next ? (
              <button type="button" onClick={() => navigate(`/dia/${next.day_number}`)} className="flex items-center gap-1">
                Dia {next.day_number} <ChevronRight size={16} />
              </button>
            ) : <span />}
          </div>
        </div>
      </PhotoHero>

      <div className="space-y-6 p-4">
        <WeatherCard day={day} />
        <ShareWhatsAppButton day={day} />
        {route && (
          <a href={route.url} target="_blank" rel="noreferrer" className="block rounded-2xl bg-highland-800 p-4 text-white shadow-sm">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-highland-200">
              <Navigation size={16} /> Ruta completa del dia
            </p>
            <p className="mt-1 text-lg font-bold">{route.label}</p>
            <p className="mt-1 text-xs text-highland-200">
              {route.stops.length} {route.stops.length === 1 ? 'destí' : 'parades'} · Obrir a Google Maps
            </p>
          </a>
        )}
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-highland-100">
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
          {lodgingDetails?.name && <p className="mt-3 text-sm font-semibold text-highland-800">{lodgingDetails.name}</p>}
          {lodgingDetails?.address && <p className="mt-1 text-sm text-gray-500">{lodgingDetails.address}</p>}
          {(lodgingDirections || lodgingDetails?.phone) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {lodgingDirections && (
                <a href={lodgingDirections} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl bg-highland-700 px-3 py-2 text-sm font-semibold text-white">
                  <MapPinned size={16} /> Anar a l’allotjament
                </a>
              )}
              {lodgingDetails?.phone && (
                <a href={`tel:${lodgingDetails.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 rounded-xl bg-highland-100 px-3 py-2 text-sm font-semibold text-highland-800">
                  <Phone size={16} /> Telefonar
                </a>
              )}
            </div>
          )}
        </div>

        <ActivityList dayId={day.id} activities={day.activities ?? []} />
        {isSkyeDay && <IdeasBoard />}
        <details className="group rounded-2xl bg-white shadow-sm">
          <summary className="flex cursor-pointer list-none items-center justify-between p-4 text-base font-bold text-highland-900">
            Suggeriments i llocs
            <ChevronRight size={19} className="transition group-open:rotate-90" />
          </summary>
          <div className="border-t border-gray-100 p-4">
            <SuggestionsBoard day={day} />
          </div>
        </details>
        <details className="group rounded-2xl bg-white shadow-sm">
          <summary className="flex cursor-pointer list-none items-center justify-between p-4 text-base font-bold text-highland-900">
            Notes del grup
            <ChevronRight size={19} className="transition group-open:rotate-90" />
          </summary>
          <div className="border-t border-gray-100 p-4">
            <NotesPanel dayId={day.id} note={day.note} />
          </div>
        </details>
      </div>
    </div>
  )
}
