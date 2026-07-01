import { useEffect, useState } from 'react'
import { MapPinned, Search, Star } from 'lucide-react'
import {
  fetchPlaceDetails,
  formatDistanceKm,
  haversineKm,
  isGooglePlacesConfigured,
  lodgingSearchLocation,
  nearbyKindLabel,
  searchNearbyPlaces,
  searchPlaces,
  suggestNearbyKind,
  type NearbyPlace,
  type NearbyPlaceKind,
  type PlaceOption,
} from '../lib/googlePlaces'
import { LODGINGS_BY_DAY } from '../lib/types'
import type { Day } from '../lib/types'

const KINDS: NearbyPlaceKind[] = ['pub', 'restaurant', 'sight']

type SearchResult = {
  placeId: string
  title: string
  address: string
  distanceKm: number | null
}

type Props = {
  day: Day
  activityText?: string
  onPick: (title: string, mapsUrl: string, address: string) => void
}

function formatRating(place: NearbyPlace) {
  if (place.rating == null) return null
  const reviews = place.reviewCount != null ? ` (${place.reviewCount})` : ''
  return `${place.rating.toFixed(1)}★${reviews}`
}

export function NearbyPlacesPicker({ day, activityText = '', onPick }: Props) {
  const lodging = LODGINGS_BY_DAY[day.day_number]
  const searchCenter = lodgingSearchLocation(day)
  const defaultKind = suggestNearbyKind(activityText) ?? 'pub'
  const [kind, setKind] = useState<NearbyPlaceKind>(defaultKind)
  const [query, setQuery] = useState('')
  const [places, setPlaces] = useState<NearbyPlace[]>([])
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isSearchMode = query.trim().length >= 2

  useEffect(() => {
    const suggested = suggestNearbyKind(activityText)
    if (suggested) setKind(suggested)
  }, [activityText])

  useEffect(() => {
    if (!isGooglePlacesConfigured || isSearchMode) return

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const results = await searchNearbyPlaces(searchCenter, kind, controller.signal)
        setPlaces(results)
        if (results.length === 0) {
          setError('No hem trobat llocs amb aquest filtre. Prova la cerca o un altre tipus.')
        }
      } catch {
        if (!controller.signal.aborted) {
          setPlaces([])
          setError('No s’ha pogut carregar suggeriments.')
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, 200)

    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [day, kind, isSearchMode, searchCenter.lat, searchCenter.lng])

  useEffect(() => {
    if (!isGooglePlacesConfigured || !isSearchMode) {
      setSearchResults([])
      setSearching(false)
      return
    }

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setSearching(true)
      setError(null)
      try {
        const options = await searchPlaces(query, searchCenter, controller.signal)
        const enriched = await Promise.all(
          options.slice(0, 8).map(async (option: PlaceOption) => {
            const details = await fetchPlaceDetails(option.placeId)
            const lat = details?.lat
            const lng = details?.lng
            const distanceKm =
              lat != null && lng != null
                ? haversineKm(searchCenter, { lat, lng })
                : null
            return {
              placeId: option.placeId,
              title: details?.title ?? option.label,
              address: details?.address ?? option.secondary,
              distanceKm,
            }
          }),
        )
        if (!controller.signal.aborted) {
          setSearchResults(enriched)
          if (enriched.length === 0) {
            setError('Cap resultat. Prova amb un altre nom o menys lletres.')
          }
        }
      } catch {
        if (!controller.signal.aborted) {
          setSearchResults([])
          setError('Error en la cerca.')
        }
      } finally {
        if (!controller.signal.aborted) setSearching(false)
      }
    }, 320)

    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [query, isSearchMode, searchCenter.lat, searchCenter.lng])

  const pickSearchResult = async (result: SearchResult) => {
    const details = await fetchPlaceDetails(result.placeId)
    if (details) {
      onPick(details.title, details.mapsUrl, details.address)
      return
    }
    onPick(result.title, `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${result.title}, ${result.address}`)}`, result.address)
  }

  if (!isGooglePlacesConfigured) return null

  const anchorLabel = lodging?.name ?? day.base_city

  return (
    <div className="rounded-xl border border-highland-200 bg-white p-3">
      <div className="mb-2 flex items-start gap-2">
        <MapPinned size={16} className="mt-0.5 shrink-0 text-highland-600" />
        <div className="min-w-0">
          <p className="text-xs font-bold text-highland-900">A prop de l’allotjament</p>
          <p className="text-[11px] text-gray-500">
            {anchorLabel} · valoració i distància
          </p>
        </div>
      </div>

      <div className="relative mb-3">
        <Search size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cercar pub, restaurant, museu..."
          className="w-full rounded-lg border border-gray-200 py-2 pl-8 pr-3 text-sm"
          autoComplete="off"
        />
      </div>

      {!isSearchMode && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {KINDS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setKind(item)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold ${
                kind === item ? 'bg-highland-700 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {nearbyKindLabel(item)}
            </button>
          ))}
        </div>
      )}

      {(loading || searching) && (
        <p className="py-2 text-center text-xs text-gray-500">
          {isSearchMode ? 'Cercant...' : `Cercant ${nearbyKindLabel(kind).toLowerCase()}...`}
        </p>
      )}

      {!loading && !searching && error && places.length === 0 && searchResults.length === 0 && (
        <p className="text-xs text-gray-500">{error}</p>
      )}

      {!searching && isSearchMode && searchResults.length > 0 && (
        <ul className="max-h-52 space-y-1 overflow-y-auto">
          {searchResults.map((place) => (
            <li key={place.placeId}>
              <button
                type="button"
                onClick={() => void pickSearchResult(place)}
                className="w-full rounded-lg px-2 py-2 text-left hover:bg-highland-50"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-highland-900">{place.title}</p>
                  {place.distanceKm != null && (
                    <span className="shrink-0 text-[10px] font-medium text-highland-600">
                      {formatDistanceKm(place.distanceKm)}
                    </span>
                  )}
                </div>
                {place.address && (
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-gray-500">{place.address}</p>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {!loading && !isSearchMode && places.length > 0 && (
        <ul className="max-h-52 space-y-1 overflow-y-auto">
          {places.map((place) => {
            const rating = formatRating(place)
            const distance = formatDistanceKm(place.distanceKm)
            return (
              <li key={place.placeId}>
                <button
                  type="button"
                  onClick={() => onPick(place.title, place.mapsUrl, place.address)}
                  className="w-full rounded-lg px-2 py-2 text-left hover:bg-highland-50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-highland-900">{place.title}</p>
                    <div className="flex shrink-0 flex-col items-end gap-0.5">
                      {rating && (
                        <span className="flex items-center gap-0.5 text-[11px] font-semibold text-amber-700">
                          <Star size={11} className="fill-amber-400 text-amber-400" />
                          {rating}
                        </span>
                      )}
                      {distance && (
                        <span className="text-[10px] font-medium text-highland-600">{distance}</span>
                      )}
                    </div>
                  </div>
                  {place.address && (
                    <p className="mt-0.5 line-clamp-1 text-[11px] text-gray-500">{place.address}</p>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
