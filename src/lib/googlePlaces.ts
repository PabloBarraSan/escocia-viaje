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
}

export type PlaceOption = {
  placeId: string
  label: string
  secondary: string
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

export async function fetchPlaceDetails(placeId: string): Promise<{ title: string; mapsUrl: string } | null> {
  if (!isGooglePlacesConfigured) return null

  const response = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
    headers: {
      'X-Goog-Api-Key': API_KEY!,
      'X-Goog-FieldMask': 'displayName,formattedAddress,googleMapsUri',
    },
  })

  if (!response.ok) return null

  const data = (await response.json()) as PlaceDetails
  const title = data.displayName?.text?.trim()
  if (!title) return null

  const mapsUrl = data.googleMapsUri
    ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${title}, ${data.formattedAddress ?? ''}`)}`

  return { title, mapsUrl }
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
