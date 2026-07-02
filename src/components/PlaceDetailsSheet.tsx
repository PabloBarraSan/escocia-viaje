import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, Polyline, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import { ExternalLink, LocateFixed, MapPinned, Navigation, X } from 'lucide-react'
import type { Activity, Day } from '../lib/types'
import { daySearchLocation, fetchPlaceDetails, formatDistanceKm, haversineKm, searchPlaces } from '../lib/googlePlaces'

type Point = { lat: number; lng: number }

const destinationIcon = L.divIcon({
  className: '',
  html: '<div style="width:28px;height:28px;border-radius:50%;background:#2d5a3d;color:white;border:3px solid white;box-shadow:0 2px 8px #0005;display:flex;align-items:center;justify-content:center">●</div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
})

const userIcon = L.divIcon({
  className: '',
  html: '<div style="width:22px;height:22px;border-radius:50%;background:#2563eb;border:4px solid white;box-shadow:0 2px 8px #0005"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
})

export function PlaceDetailsSheet({
  activity,
  day,
  onClose,
}: {
  activity: Activity
  day: Day
  onClose: () => void
}) {
  const [destination, setDestination] = useState<Point | null>(null)
  const [userPosition, setUserPosition] = useState<Point | null>(null)
  const [locating, setLocating] = useState(false)
  const [locationError, setLocationError] = useState('')

  useEffect(() => {
    let cancelled = false
    const resolve = async () => {
      const query = [activity.place_name, activity.place_address].filter(Boolean).join(', ')
      if (query) {
        const options = await searchPlaces(query, daySearchLocation(day))
        const details = options[0] ? await fetchPlaceDetails(options[0].placeId) : null
        if (!cancelled && details?.lat != null && details.lng != null) {
          setDestination({ lat: details.lat, lng: details.lng })
          return
        }
      }
      if (!cancelled && day.lat != null && day.lng != null) setDestination({ lat: day.lat, lng: day.lng })
    }
    void resolve()
    return () => { cancelled = true }
  }, [activity.place_address, activity.place_name, day])

  const distance = useMemo(
    () => destination && userPosition ? haversineKm(userPosition, destination) : null,
    [destination, userPosition],
  )
  const walkingMinutes = distance == null ? null : Math.max(1, Math.round((distance / 4.5) * 60))
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    activity.place_address || activity.place_name || day.base_city,
  )}`

  const locate = () => {
    setLocationError('')
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserPosition({ lat: position.coords.latitude, lng: position.coords.longitude })
        setLocating(false)
      },
      () => {
        setLocationError('No hem pogut obtindre la ubicació. Revisa el permís del navegador.')
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 12_000 },
    )
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end bg-black/45" role="dialog" aria-modal="true">
      <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-highland-50 p-4 shadow-2xl">
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-gray-300" />
        <div className="mx-auto max-w-lg">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-highland-100 text-highland-700">
              <MapPinned size={22} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-wide text-highland-600">Lloc de l’activitat</p>
              <h2 className="text-xl font-bold text-highland-950">{activity.place_name || activity.text}</h2>
              {activity.place_address && <p className="mt-1 text-sm text-gray-600">{activity.place_address}</p>}
            </div>
            <button onClick={onClose} className="rounded-full bg-white p-2 text-gray-500" aria-label="Tancar"><X size={20} /></button>
          </div>

          {destination && (
            <div className="mt-4 h-56 overflow-hidden rounded-2xl border border-highland-100">
              <MapContainer
                key={`${destination.lat}-${destination.lng}-${userPosition?.lat ?? ''}`}
                center={userPosition
                  ? [(destination.lat + userPosition.lat) / 2, (destination.lng + userPosition.lng) / 2]
                  : [destination.lat, destination.lng]}
                zoom={userPosition ? 13 : 15}
                className="h-full w-full"
                scrollWheelZoom={false}
              >
                <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[destination.lat, destination.lng]} icon={destinationIcon} />
                {userPosition && (
                  <>
                    <Marker position={[userPosition.lat, userPosition.lng]} icon={userIcon} />
                    <Polyline positions={[[userPosition.lat, userPosition.lng], [destination.lat, destination.lng]]} color="#2563eb" dashArray="6 7" />
                  </>
                )}
              </MapContainer>
            </div>
          )}

          {distance != null && (
            <div className="mt-3 rounded-xl bg-blue-50 p-3 text-sm text-blue-950">
              <strong>{formatDistanceKm(distance)}</strong> en línia recta · aproximadament {walkingMinutes} min caminant
            </div>
          )}

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <a href={directionsUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-2xl bg-highland-700 px-4 py-3.5 text-base font-bold text-white">
              <Navigation size={20} /> Anar amb Google Maps
            </a>
            <button onClick={locate} disabled={locating} className="flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3.5 text-base font-bold text-highland-800 shadow-sm">
              <LocateFixed size={20} /> {locating ? 'Buscant…' : 'On som ara?'}
            </button>
          </div>
          {activity.maps_url && (
            <a href={activity.maps_url} target="_blank" rel="noreferrer" className="mt-3 flex items-center justify-center gap-2 text-sm font-semibold text-highland-700">
              <ExternalLink size={15} /> Veure la fitxa del lloc
            </a>
          )}
          {locationError && <p className="mt-3 text-sm text-red-600">{locationError}</p>}
        </div>
      </div>
    </div>
  )
}
