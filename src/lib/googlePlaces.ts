import type { Day } from './types'
import { LODGINGS_BY_DAY } from './types'

const API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY as string | undefined

export const isGooglePlacesConfigured = Boolean(API_KEY?.trim())

type LatLng = { lat: number; lng: number }

type AutocompleteSuggestion = {
  placePrediction?: {
    placeId?: string
    place?: string
    text?: { text?: string }
    structuredFormat?: {
      mainText?: { text?: string }
      secondaryText?: { text?: string }
    }
  }
}

type AutocompleteResponse = {
  suggestions?: AutocompleteSuggestion[]
}

type PlaceDetails = {
  displayName?: { text?: string }
  formattedAddress?: string
  googleMapsUri?: string
  rating?: number
  userRatingCount?: number
  currentOpeningHours?: { openNow?: boolean; weekdayDescriptions?: string[] }
  photos?: { name?: string }[]
}

type NearbyPlaceRaw = {
  id?: string
  displayName?: { text?: string }
  formattedAddress?: string
  googleMapsUri?: string
  rating?: number
  userRatingCount?: number
  location?: { latitude?: number; longitude?: number }
  currentOpeningHours?: { openNow?: boolean }
}

type NearbySearchResponse = {
  places?: NearbyPlaceRaw[]
}

export type PlaceOption = {
  placeId: string
  label: string
  secondary: string
}

export type NearbyPlaceKind = 'pub' | 'restaurant' | 'cafe' | 'sight' | 'supermarket' | 'gas'

export type NearbyPlace = {
  placeId: string
  title: string
  address: string
  mapsUrl: string
  rating: number | null
  reviewCount: number | null
  distanceKm: number | null
  lat: number | null
  lng: number | null
  openNow: boolean | null
}

const NEARBY_TYPES: Record<NearbyPlaceKind, string[]> = {
  pub: ['pub', 'bar'],
  restaurant: ['restaurant', 'meal_takeaway'],
  cafe: ['cafe', 'coffee_shop'],
  sight: ['tourist_attraction', 'museum', 'park'],
  supermarket: ['supermarket', 'grocery_store'],
  gas: ['gas_station'],
}

const NEARBY_LABELS: Record<NearbyPlaceKind, string> = {
  pub: 'Pubs',
  restaurant: 'Restaurants',
  cafe: 'Cafè',
  sight: 'Llocs guapos',
  supermarket: 'Supermercats',
  gas: 'Gasolineres',
}

const nearbyCache = new Map<string, { expires: number; places: NearbyPlace[] }>()
const detailsCache = new Map<string, { expires: number; value: NonNullable<Awaited<ReturnType<typeof fetchPlaceDetails>>> }>()

export function haversineKm(from: LatLng, to: LatLng) {
  const R = 6371
  const dLat = ((to.lat - from.lat) * Math.PI) / 180
  const dLng = ((to.lng - from.lng) * Math.PI) / 180
  const lat1 = (from.lat * Math.PI) / 180
  const lat2 = (to.lat * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function formatDistanceKm(km: number | null) {
  if (km == null) return null
  if (km < 1) return `${(Math.round(km * 10) / 10).toFixed(1)} km`
  if (km < 10) return `${km.toFixed(1)} km`
  return `${Math.round(km)} km`
}

function placeIdFromResource(resource?: string, fallback?: string) {
  if (resource?.startsWith('places/')) return resource.slice('places/'.length)
  return fallback ?? ''
}

export async function searchPlaces(
  input: string,
  location: LatLng,
  signal?: AbortSignal,
): Promise<PlaceOption[]> {
  if (!isGooglePlacesConfigured || input.trim().length < 2) return []

  const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': API_KEY!,
    },
    body: JSON.stringify({
      input: input.trim(),
      includedRegionCodes: ['gb'],
      locationBias: {
        circle: {
          center: { latitude: location.lat, longitude: location.lng },
          radius: 40_000,
        },
      },
    }),
  })

  if (!response.ok) return []

  const data = (await response.json()) as AutocompleteResponse
  return (data.suggestions ?? [])
    .map((item) => {
      const prediction = item.placePrediction
      if (!prediction) return null
      const placeId = placeIdFromResource(prediction.place, prediction.placeId)
      if (!placeId) return null
      const main = prediction.structuredFormat?.mainText?.text ?? prediction.text?.text ?? ''
      const secondary = prediction.structuredFormat?.secondaryText?.text ?? ''
      return { placeId, label: main, secondary }
    })
    .filter((item): item is PlaceOption => Boolean(item?.placeId && item.label))
}

export async function fetchPlaceDetails(
  placeId: string,
): Promise<{
  title: string
  address: string
  mapsUrl: string
  lat: number | null
  lng: number | null
  rating: number | null
  reviewCount: number | null
  openNow: boolean | null
  openingHours: string[]
  photoUrl: string | null
} | null> {
  if (!isGooglePlacesConfigured) return null
  const cached = detailsCache.get(placeId)
  if (cached && cached.expires > Date.now()) return cached.value

  const response = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
    headers: {
      'X-Goog-Api-Key': API_KEY!,
      'X-Goog-FieldMask': 'displayName,formattedAddress,googleMapsUri,location,rating,userRatingCount,currentOpeningHours,photos',
    },
  })

  if (!response.ok) return null

  const data = (await response.json()) as PlaceDetails & { location?: { latitude?: number; longitude?: number } }
  const title = data.displayName?.text?.trim()
  if (!title) return null

  const mapsUrl = data.googleMapsUri
    ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${title}, ${data.formattedAddress ?? ''}`)}`

  const lat = data.location?.latitude
  const lng = data.location?.longitude
  const photoName = data.photos?.[0]?.name

  const value = {
    title,
    address: data.formattedAddress?.trim() ?? '',
    mapsUrl,
    lat: lat ?? null,
    lng: lng ?? null,
    rating: data.rating ?? null,
    reviewCount: data.userRatingCount ?? null,
    openNow: data.currentOpeningHours?.openNow ?? null,
    openingHours: data.currentOpeningHours?.weekdayDescriptions ?? [],
    photoUrl: photoName
      ? `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=900&key=${encodeURIComponent(API_KEY!)}`
      : null,
  }
  detailsCache.set(placeId, { expires: Date.now() + 24 * 60 * 60_000, value })
  return value
}

export function daySearchLocation(day: { lat: number | null; lng: number | null; base_city: string }) {
  if (day.lat != null && day.lng != null) {
    return { lat: day.lat, lng: day.lng }
  }
  const city = day.base_city.toLowerCase()
  if (city.includes('edimburg') || city.includes('edinburgh')) return { lat: 55.9533, lng: -3.1883 }
  if (city.includes('inverness')) return { lat: 57.4778, lng: -4.2247 }
  if (city.includes('skye') || city.includes('broadford')) return { lat: 57.4127, lng: -6.1940 }
  if (city.includes('fort william')) return { lat: 56.8198, lng: -5.1052 }
  if (city.includes('glasgow')) return { lat: 55.8642, lng: -4.2518 }
  return { lat: 56.5, lng: -4.5 }
}

/** Punt de cerca: allotjament del dia si el tenim, sinó la ciutat base. */
export function lodgingSearchLocation(day: Day) {
  const lodging = LODGINGS_BY_DAY[day.day_number]
  if (lodging) return { lat: lodging.lat, lng: lodging.lng }
  return daySearchLocation(day)
}

export function suggestNearbyKind(activityText: string): NearbyPlaceKind | null {
  const t = activityText.toLowerCase()
  if (/pub|sopar|cerve|whisky|bar\b/.test(t)) return 'pub'
  if (/dinar|esmorzar|menjar|restaurant|sopar/.test(t)) return 'restaurant'
  if (/visitar|castell|museu|caminata|lloc|passeig|veure|mirador/.test(t)) return 'sight'
  return null
}

export function nearbyKindLabel(kind: NearbyPlaceKind) {
  return NEARBY_LABELS[kind]
}

export async function searchNearbyPlaces(
  location: LatLng,
  kind: NearbyPlaceKind,
  signal?: AbortSignal,
): Promise<NearbyPlace[]> {
  if (!isGooglePlacesConfigured) return []
  const cacheKey = `${location.lat.toFixed(3)}:${location.lng.toFixed(3)}:${kind}`
  const cached = nearbyCache.get(cacheKey)
  if (cached && cached.expires > Date.now()) return cached.places

  const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': API_KEY!,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.googleMapsUri,places.rating,places.userRatingCount,places.location,places.currentOpeningHours',
    },
    body: JSON.stringify({
      includedTypes: NEARBY_TYPES[kind],
      maxResultCount: 12,
      rankPreference: 'POPULARITY',
      locationRestriction: {
        circle: {
          center: { latitude: location.lat, longitude: location.lng },
          radius: 1500,
        },
      },
    }),
  })

  if (!response.ok) return []

  const data = (await response.json()) as NearbySearchResponse
  const places = (data.places ?? [])
    .map((place) => {
      const placeId = place.id?.replace(/^places\//, '') ?? ''
      const title = place.displayName?.text?.trim()
      if (!placeId || !title) return null
      const address = place.formattedAddress ?? ''
      const mapsUrl = place.googleMapsUri
        ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${title}, ${address}`)}`
      const lat = place.location?.latitude
      const lng = place.location?.longitude
      const distanceKm =
        lat != null && lng != null
          ? haversineKm(location, { lat, lng })
          : null
      return {
        placeId,
        title,
        address,
        mapsUrl,
        rating: place.rating ?? null,
        reviewCount: place.userRatingCount ?? null,
        distanceKm,
        lat: lat ?? null,
        lng: lng ?? null,
        openNow: place.currentOpeningHours?.openNow ?? null,
      }
    })
    .filter((item): item is NearbyPlace => Boolean(item))
    .filter((item) => item.rating == null || item.rating >= 3.8)
    .sort((a, b) => {
      const ratingDiff = (b.rating ?? 0) - (a.rating ?? 0)
      if (Math.abs(ratingDiff) > 0.05) return ratingDiff
      return (a.distanceKm ?? 999) - (b.distanceKm ?? 999)
    })
  nearbyCache.set(cacheKey, { expires: Date.now() + 30 * 60_000, places })
  return places
}
