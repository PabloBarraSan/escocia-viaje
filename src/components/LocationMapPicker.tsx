import { useMemo, useState } from 'react'
import { Check, Crosshair, Link2, LoaderCircle, MapPin } from 'lucide-react'
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet'
import L from 'leaflet'

type Point = { lat: number; lng: number }

const markerIcon = L.divIcon({
  className: '',
  html: '<div style="width:30px;height:30px;border-radius:50% 50% 50% 0;background:#2d5a3d;border:3px solid white;box-shadow:0 2px 8px #0005;transform:rotate(-45deg)"><div style="width:8px;height:8px;border-radius:50%;background:white;margin:8px"></div></div>',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
})

function MapClick({ onPick }: { onPick: (point: Point) => void }) {
  useMapEvents({
    click: (event) => onPick({ lat: event.latlng.lat, lng: event.latlng.lng }),
  })
  return null
}

function parseCoordinates(value: string) {
  const match = value.trim().match(/^(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)$/)
  if (!match) return null
  const lat = Number(match[1])
  const lng = Number(match[2])
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null
  return { lat, lng }
}

export function LocationMapPicker({
  center,
  onConfirm,
}: {
  center: Point
  onConfirm: (point: Point) => void
}) {
  const [open, setOpen] = useState(false)
  const [point, setPoint] = useState<Point>(center)
  const [coordinates, setCoordinates] = useState('')
  const [mapsLink, setMapsLink] = useState('')
  const [resolving, setResolving] = useState(false)
  const [linkError, setLinkError] = useState('')
  const parsed = useMemo(() => parseCoordinates(coordinates), [coordinates])

  const useCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      const next = { lat: position.coords.latitude, lng: position.coords.longitude }
      setPoint(next)
      setCoordinates(`${next.lat.toFixed(6)}, ${next.lng.toFixed(6)}`)
    })
  }

  const confirm = () => {
    onConfirm(parsed ?? point)
    setOpen(false)
  }

  const resolveMapsLink = async () => {
    if (!mapsLink.trim()) return
    setResolving(true)
    setLinkError('')
    try {
      const response = await fetch(`/api/resolve-maps?url=${encodeURIComponent(mapsLink.trim())}`)
      const data = await response.json() as { lat?: number; lng?: number; error?: string }
      if (!response.ok || data.lat == null || data.lng == null) throw new Error(data.error)
      const next = { lat: data.lat, lng: data.lng }
      setPoint(next)
      setCoordinates(`${next.lat.toFixed(6)}, ${next.lng.toFixed(6)}`)
    } catch (error) {
      setLinkError(error instanceof Error && error.message ? error.message : 'No hem pogut llegir l’enllaç.')
    } finally {
      setResolving(false)
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <button type="button" onClick={() => setOpen((value) => !value)} className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-semibold text-highland-800">
        <MapPin size={16} /> Marcar o pegar coordenades
        <span className="ml-auto text-xs text-gray-400">{open ? 'Tancar' : 'Obrir mapa'}</span>
      </button>
      {open && (
        <div className="space-y-3 border-t border-gray-100 p-3">
          <div className="h-52 overflow-hidden rounded-xl border border-gray-100">
            <MapContainer center={[point.lat, point.lng]} zoom={14} className="h-full w-full" scrollWheelZoom={false}>
              <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker
                position={[point.lat, point.lng]}
                icon={markerIcon}
                draggable
                eventHandlers={{
                  dragend: (event) => {
                    const latLng = event.target.getLatLng()
                    setPoint({ lat: latLng.lat, lng: latLng.lng })
                    setCoordinates(`${latLng.lat.toFixed(6)}, ${latLng.lng.toFixed(6)}`)
                  },
                }}
              />
              <MapClick onPick={(next) => {
                setPoint(next)
                setCoordinates(`${next.lat.toFixed(6)}, ${next.lng.toFixed(6)}`)
              }} />
            </MapContainer>
          </div>
          <p className="text-[11px] text-gray-500">Toca el mapa o arrossega el marcador.</p>
          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1">
              <Link2 size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={mapsLink}
                onChange={(event) => setMapsLink(event.target.value)}
                placeholder="Pega un enllaç de Google Maps"
                type="url"
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm"
              />
            </div>
            <button type="button" onClick={() => void resolveMapsLink()} disabled={resolving || !mapsLink.trim()} className="rounded-xl bg-gray-100 px-3 text-xs font-bold text-highland-800 disabled:opacity-40">
              {resolving ? <LoaderCircle size={15} className="animate-spin" /> : 'Llegir'}
            </button>
          </div>
          {linkError && <p className="text-xs text-red-600">{linkError}</p>}
          <input
            value={coordinates}
            onChange={(event) => {
              setCoordinates(event.target.value)
              const next = parseCoordinates(event.target.value)
              if (next) setPoint(next)
            }}
            placeholder="55.953251, -3.188267"
            inputMode="decimal"
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
          />
          <div className="flex gap-2">
            <button type="button" onClick={useCurrentLocation} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-50 px-3 py-2.5 text-xs font-bold text-blue-800">
              <Crosshair size={14} /> Ubicació actual
            </button>
            <button type="button" onClick={confirm} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-highland-700 px-3 py-2.5 text-xs font-bold text-white">
              <Check size={14} /> Usar ubicació
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
