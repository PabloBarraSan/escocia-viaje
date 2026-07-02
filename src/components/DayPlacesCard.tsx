import { useEffect, useMemo, useState } from 'react'
import { Check, Coffee, Fuel, Landmark, LocateFixed, MapPin, Navigation, Plus, Search, ShoppingBasket, Star, Utensils } from 'lucide-react'
import { useTripContext } from '../context/TripContext'
import { useSession } from '../hooks/useSession'
import {
  formatDistanceKm,
  isGooglePlacesConfigured,
  lodgingSearchLocation,
  nearbyKindLabel,
  searchNearbyPlaces,
  type NearbyPlace,
  type NearbyPlaceKind,
} from '../lib/googlePlaces'
import type { Day } from '../lib/types'

const KINDS: { key: NearbyPlaceKind; icon: typeof Coffee }[] = [
  { key: 'restaurant', icon: Utensils },
  { key: 'cafe', icon: Coffee },
  { key: 'sight', icon: Landmark },
  { key: 'supermarket', icon: ShoppingBasket },
  { key: 'gas', icon: Fuel },
]

function estimatedMinutes(distanceKm: number | null) {
  if (distanceKm == null) return null
  if (distanceKm <= 2.5) return `${Math.max(1, Math.round(distanceKm / 4.5 * 60))} min a peu`
  return `${Math.max(2, Math.round(distanceKm / 35 * 60))} min en cotxe`
}

export function DayPlacesCard({ day }: { day: Day }) {
  const { addActivity } = useTripContext()
  const { session } = useSession()
  const [expanded, setExpanded] = useState(false)
  const [kind, setKind] = useState<NearbyPlaceKind>('restaurant')
  const [places, setPlaces] = useState<NearbyPlace[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null)
  const [locating, setLocating] = useState(false)
  const [added, setAdded] = useState<string[]>([])
  const center = useMemo(
    () => userPosition ?? lodgingSearchLocation(day),
    [day, userPosition],
  )

  useEffect(() => {
    if (!expanded || !isGooglePlacesConfigured) return
    const controller = new AbortController()
    setLoading(true)
    setError('')
    void searchNearbyPlaces(center, kind, controller.signal)
      .then(setPlaces)
      .catch(() => {
        if (!controller.signal.aborted) setError('No hem pogut buscar llocs ara mateix.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [center, expanded, kind])

  if (!isGooglePlacesConfigured) return null

  const locate = () => {
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserPosition({ lat: position.coords.latitude, lng: position.coords.longitude })
        setLocating(false)
      },
      () => {
        setError('Activa el permís d’ubicació per buscar al teu voltant.')
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    )
  }

  const addPlace = async (place: NearbyPlace) => {
    if (!session || added.includes(place.placeId)) return
    await addActivity(
      day.id,
      place.title,
      '',
      session.name,
      60,
      `${nearbyKindLabel(kind)} · ${place.rating ? `${place.rating.toFixed(1)}★` : 'suggeriment del grup'}`,
      place.mapsUrl,
      place.title,
      place.address,
      'idea',
    )
    setAdded((current) => [...current, place.placeId])
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-highland-200 bg-white shadow-sm ring-1 ring-highland-100/70">
      <button type="button" onClick={() => setExpanded((value) => !value)} className="flex w-full items-center gap-3 p-3.5 text-left">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-800"><Search size={21} /></span>
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-bold uppercase tracking-wide text-sky-700">A prop nostre</span>
          <span className="block font-bold text-highland-950">Menjar, veure i parades útils</span>
        </span>
        <span className="text-xs font-bold text-highland-700">{expanded ? 'Tancar' : 'Explorar'}</span>
      </button>

      {expanded && (
        <div className="border-t border-highland-100 p-3.5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-xs text-gray-500">
              <MapPin size={14} /> {userPosition ? 'Des de la ubicació actual' : 'Des de l’allotjament'}
            </p>
            <button type="button" onClick={locate} disabled={locating} className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-2 text-xs font-bold text-blue-800">
              <LocateFixed size={14} /> {locating ? 'Buscant…' : 'Usar on som'}
            </button>
          </div>

          <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
            {KINDS.map(({ key, icon: Icon }) => (
              <button key={key} type="button" onClick={() => setKind(key)} className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold ${kind === key ? 'bg-highland-700 text-white' : 'bg-gray-100 text-gray-700'}`}>
                <Icon size={14} /> {nearbyKindLabel(key)}
              </button>
            ))}
          </div>

          {loading && <p className="py-6 text-center text-sm text-gray-500">Buscant llocs bons…</p>}
          {error && <p className="mb-2 rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</p>}
          {!loading && places.length === 0 && !error && <p className="py-4 text-center text-sm text-gray-500">No hi ha resultats prop.</p>}

          {!loading && places.length > 0 && (
            <div className="space-y-2">
              {places.slice(0, 6).map((place) => {
                const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place.address || place.title)}`
                const wasAdded = added.includes(place.placeId)
                return (
                  <article key={place.placeId} className="rounded-xl border border-gray-100 bg-highland-50/40 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-bold leading-snug text-highland-950">{place.title}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
                          {place.rating != null && <span className="flex items-center gap-1 font-bold text-amber-700"><Star size={12} className="fill-amber-400 text-amber-400" />{place.rating.toFixed(1)} ({place.reviewCount ?? 0})</span>}
                          {place.openNow != null && <span className={`font-bold ${place.openNow ? 'text-emerald-700' : 'text-red-600'}`}>{place.openNow ? 'Obert ara' : 'Tancat ara'}</span>}
                          {place.distanceKm != null && <span className="text-gray-500">{formatDistanceKm(place.distanceKm)} · {estimatedMinutes(place.distanceKm)}</span>}
                        </div>
                        {place.address && <p className="mt-1 line-clamp-1 text-[11px] text-gray-500">{place.address}</p>}
                      </div>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <a href={directions} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-highland-700 px-2 py-2 text-xs font-bold text-white">
                        <Navigation size={14} /> Com arribar
                      </a>
                      <button type="button" disabled={wasAdded} onClick={() => void addPlace(place)} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white px-2 py-2 text-xs font-bold text-highland-800 shadow-sm disabled:text-emerald-700">
                        {wasAdded ? <Check size={14} /> : <Plus size={14} />} {wasAdded ? 'Afegit' : 'Suggerir'}
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
          <p className="mt-3 text-center text-[10px] text-gray-400">Resultats guardats 30 min per reduir consum de Google Places.</p>
        </div>
      )}
    </section>
  )
}
