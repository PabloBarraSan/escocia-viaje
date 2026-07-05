import { useEffect, useMemo, useRef, useState } from 'react'
import { ExternalLink, LoaderCircle, Map, Navigation, Route, X } from 'lucide-react'
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { Day } from '../lib/types'
import { daySearchLocation, fetchPlaceDetails, searchPlaces } from '../lib/googlePlaces'
import { dayLogisticsPoints, dayRoute, knownActivityPoint, type RoutePoint } from '../lib/maps'

function markerIcon(number: number) {
  return L.divIcon({
    className: '',
    html: `<div style="width:28px;height:28px;border-radius:50%;background:#2d5a3d;color:white;border:2px solid white;box-shadow:0 2px 7px #0005;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800">${number}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}

function FitRoute({ points }: { points: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (points.length > 1 && points.some((point) => point[0] !== points[0][0] || point[1] !== points[0][1])) {
      map.fitBounds(points, { padding: [28, 28] })
    } else if (points[0]) {
      map.setView(points[0], 13)
    }
  }, [map, points])
  return null
}

function samePoint(a: RoutePoint, b: RoutePoint) {
  return Math.abs(a.lat - b.lat) < 0.001 && Math.abs(a.lng - b.lng) < 0.001
}

async function resolveActivityPoint(
  activity: NonNullable<Day['activities']>[number],
  day: Day,
): Promise<RoutePoint | null> {
  const known = knownActivityPoint(`${activity.text} ${activity.place_name ?? ''}`)
  if (known) return known
  const coordinateMatch = activity.maps_url?.match(/[?&]query=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/)
  if (coordinateMatch) {
    return {
      name: activity.place_name?.trim() || 'Ubicació',
      query: `${coordinateMatch[1]},${coordinateMatch[2]}`,
      lat: Number(coordinateMatch[1]),
      lng: Number(coordinateMatch[2]),
    }
  }
  const query = activity.place_address?.trim() || activity.place_name?.trim()
  if (!query) return null
  const options = await searchPlaces(query, daySearchLocation(day))
  const details = options[0] ? await fetchPlaceDetails(options[0].placeId) : null
  if (!details || details.lat == null || details.lng == null) return null
  return {
    name: activity.place_name?.trim() || details.title,
    query: activity.place_address?.trim() || details.address || details.title,
    lat: details.lat,
    lng: details.lng,
  }
}

export function DayMapCard({ day }: { day: Day }) {
  const [open, setOpen] = useState(false)
  const [stops, setStops] = useState<RoutePoint[]>(() => dayLogisticsPoints(day.day_number))
  const [loading, setLoading] = useState(false)
  const [resolved, setResolved] = useState(false)
  const mapRef = useRef<L.Map | null>(null)
  const plans = useMemo(
    () => (day.activities ?? []).filter((activity) => activity.kind === 'plan'),
    [day.activities],
  )

  useEffect(() => {
    setStops(dayLogisticsPoints(day.day_number))
    setResolved(false)
  }, [day.day_number, day.activities])

  useEffect(() => {
    if (!open || resolved) return
    let cancelled = false
    setLoading(true)
    void Promise.all(plans.map((activity) => resolveActivityPoint(activity, day)))
      .then((activityPoints) => {
        if (cancelled) return
        const logistics = dayLogisticsPoints(day.day_number)
        const start = logistics[0]
        const end = logistics.at(-1)
        const merged: RoutePoint[] = start ? [start] : []
        for (const point of activityPoints) {
          if (!point || (end && samePoint(point, end)) || merged.some((item) => samePoint(item, point))) continue
          merged.push(point)
        }
        if (end && (merged.length === 0 || !samePoint(merged.at(-1)!, end) || (start && samePoint(start, end) && merged.length > 1))) {
          merged.push(end)
        }
        setStops(merged)
        setResolved(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [day, open, plans, resolved])

  const coords = useMemo<[number, number][]>(() => stops.map((stop) => [stop.lat, stop.lng]), [stops])
  const route = dayRoute(day.day_number, stops)

  useEffect(() => {
    if (open) window.setTimeout(() => mapRef.current?.invalidateSize(), 100)
  }, [open, stops])

  if (!route || stops.length === 0) return null

  return (
    <section className="overflow-hidden rounded-2xl border border-highland-200 bg-white shadow-sm ring-1 ring-highland-100/70">
      <button type="button" onClick={() => setOpen((value) => !value)} className="flex w-full items-center gap-3 p-3.5 text-left">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
          <Map size={21} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-bold uppercase tracking-wide text-emerald-700">Mapa del dia</span>
          <span className="block truncate font-bold text-highland-950">
            {resolved ? `${stops.length} parades` : 'Ruta segons l’itinerari'} · {route.travelMode === 'walking' ? 'A peu' : 'En cotxe'}
          </span>
        </span>
        <span className="text-xs font-bold text-highland-700">{open ? 'Tancar' : 'Veure ruta'}</span>
      </button>

      {open && (
        <div className="border-t border-highland-100">
          <div className="relative h-64">
            <button type="button" onClick={() => setOpen(false)} className="absolute right-2 top-2 z-[500] rounded-full bg-white p-2 text-gray-600 shadow" aria-label="Tancar mapa">
              <X size={17} />
            </button>
            {loading && (
              <div className="absolute inset-0 z-[450] flex items-center justify-center bg-white/75 text-sm font-semibold text-highland-800 backdrop-blur-sm">
                <LoaderCircle size={18} className="mr-2 animate-spin" /> Actualitzant parades…
              </div>
            )}
            <MapContainer center={coords[0]} zoom={9} className="h-full w-full" ref={mapRef} scrollWheelZoom={false}>
              <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Polyline positions={coords} color="#2d5a3d" weight={4} opacity={0.8} />
              {stops.map((stop, index) => (
                <Marker key={`${stop.name}-${index}`} position={[stop.lat, stop.lng]} icon={markerIcon(index + 1)} />
              ))}
              <FitRoute points={coords} />
            </MapContainer>
          </div>
          <div className="space-y-2 p-3.5">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {stops.map((stop, index) => (
                <span key={`${stop.name}-${index}`} className="flex shrink-0 items-center gap-1.5 rounded-full bg-highland-50 px-2.5 py-1.5 text-xs font-semibold text-highland-800">
                  <b className="flex h-5 w-5 items-center justify-center rounded-full bg-highland-700 text-[10px] text-white">{index + 1}</b>
                  {stop.name}
                </span>
              ))}
            </div>
            <a href={route.url} target="_blank" rel="noreferrer" className="flex w-full items-center justify-center gap-2 rounded-xl bg-highland-700 px-4 py-3 text-sm font-bold text-white">
              <Navigation size={18} /> Navegar la ruta real <ExternalLink size={14} />
            </a>
            <p className="flex items-center justify-center gap-1 text-[10px] text-gray-400">
              <Route size={11} /> Parades amb ubicació de l’itinerari · Google Maps calcula la ruta real.
            </p>
          </div>
        </div>
      )}
    </section>
  )
}
