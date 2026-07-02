import { useEffect, useMemo, useRef, useState } from 'react'
import { ExternalLink, Map, Navigation, Route, X } from 'lucide-react'
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { Day } from '../lib/types'
import { dayRoute, dayRoutePoints } from '../lib/maps'

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
    if (points.length > 1) map.fitBounds(points, { padding: [28, 28] })
  }, [map, points])
  return null
}

export function DayMapCard({ day }: { day: Day }) {
  const [open, setOpen] = useState(false)
  const mapRef = useRef<L.Map | null>(null)
  const route = dayRoute(day.day_number)
  const stops = dayRoutePoints(day.day_number)
  const coords = useMemo<[number, number][]>(() => stops.map((stop) => [stop.lat, stop.lng]), [stops])

  useEffect(() => {
    if (open) window.setTimeout(() => mapRef.current?.invalidateSize(), 100)
  }, [open])

  if (!route || stops.length < 2) return null

  return (
    <section className="overflow-hidden rounded-2xl border border-highland-200 bg-white shadow-sm ring-1 ring-highland-100/70">
      <button type="button" onClick={() => setOpen((value) => !value)} className="flex w-full items-center gap-3 p-3.5 text-left">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
          <Map size={21} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-bold uppercase tracking-wide text-emerald-700">Mapa del dia</span>
          <span className="block truncate font-bold text-highland-950">{stops.length} parades · {route.travelMode === 'walking' ? 'A peu' : 'En cotxe'}</span>
        </span>
        <span className="text-xs font-bold text-highland-700">{open ? 'Tancar' : 'Veure ruta'}</span>
      </button>

      {open && (
        <div className="border-t border-highland-100">
          <div className="relative h-64">
            <button type="button" onClick={() => setOpen(false)} className="absolute right-2 top-2 z-[500] rounded-full bg-white p-2 text-gray-600 shadow" aria-label="Tancar mapa">
              <X size={17} />
            </button>
            <MapContainer center={coords[0]} zoom={9} className="h-full w-full" ref={mapRef} scrollWheelZoom={false}>
              <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Polyline positions={coords} color="#2d5a3d" weight={4} opacity={0.8} />
              {stops.map((stop, index) => (
                <Marker key={stop.name} position={[stop.lat, stop.lng]} icon={markerIcon(index + 1)} />
              ))}
              <FitRoute points={coords} />
            </MapContainer>
          </div>
          <div className="space-y-2 p-3.5">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {stops.map((stop, index) => (
                <span key={stop.name} className="flex shrink-0 items-center gap-1.5 rounded-full bg-highland-50 px-2.5 py-1.5 text-xs font-semibold text-highland-800">
                  <b className="flex h-5 w-5 items-center justify-center rounded-full bg-highland-700 text-[10px] text-white">{index + 1}</b>
                  {stop.name}
                </span>
              ))}
            </div>
            <a href={route.url} target="_blank" rel="noreferrer" className="flex w-full items-center justify-center gap-2 rounded-xl bg-highland-700 px-4 py-3 text-sm font-bold text-white">
              <Navigation size={18} /> Navegar la ruta real <ExternalLink size={14} />
            </a>
            <p className="flex items-center justify-center gap-1 text-[10px] text-gray-400"><Route size={11} /> Google Maps calcularà trànsit, distància i temps reals.</p>
          </div>
        </div>
      )}
    </section>
  )
}
