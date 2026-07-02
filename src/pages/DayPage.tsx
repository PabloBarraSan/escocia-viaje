import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Bed, ExternalLink, MapPinned, Navigation, Phone } from 'lucide-react'
import { useTripContext } from '../context/TripContext'
import { useSession } from '../hooks/useSession'
import { LODGINGS_BY_DAY } from '../lib/types'
import { WeatherCard } from '../components/WeatherCard'
import { FlightsCard } from '../components/FlightsCard'
import { CarRentalCard } from '../components/CarRentalCard'
import { DayHero } from '../components/DayHero'
import { DayItineraryCard } from '../components/DayItineraryCard'
import { CarLocationCard } from '../components/CarLocationCard'
import { PageSection } from '../components/PageSection'
import { dayRoute } from '../lib/maps'
import { NextUpCard } from '../components/NextUpCard'

function localDateKey() {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function DayPage({ auto = false }: { auto?: boolean }) {
  const { dayNum } = useParams<{ dayNum: string }>()
  const { days, updateDay } = useTripContext()
  const { session } = useSession()
  const [editingLodging, setEditingLodging] = useState(false)
  const [lodging, setLodging] = useState('')

  const today = localDateKey()
  const day = auto
    ? days.find((item) => item.date === today) ?? days.find((item) => item.date > today) ?? days.at(-1)
    : days.find((d) => d.day_number === Number(dayNum))

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

  return (
    <div className="pb-6">
      <DayHero day={day} prev={prev} next={next} />

      <main className="space-y-6 px-4 pt-5 pb-4">
        <WeatherCard day={day} compact />
        <NextUpCard days={days} visibleDay={day} />

        <DayItineraryCard
          day={day}
          editHref={`/dia/${day.day_number}/horari`}
        />

        <FlightsCard dayNumber={day.day_number} />
        <CarRentalCard dayNumber={day.day_number} full />

        <PageSection title="Pràctic" hint="Ruta, cotxe i allotjament">
          <div className="space-y-2">
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
                        <button type="button" onClick={() => void saveLodging()} className="rounded-lg bg-highland-700 px-3 py-1.5 text-xs font-semibold text-white">
                          Guardar
                        </button>
                        <button type="button" onClick={() => setEditingLodging(false)} className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs">
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
        </PageSection>
      </main>
    </div>
  )
}
