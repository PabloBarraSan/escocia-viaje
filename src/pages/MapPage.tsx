import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import { Link } from 'react-router-dom'
import L from 'leaflet'
import { MAP_STOPS } from '../lib/types'

const icon = L.divIcon({
  className: '',
  html: `<div style="background:#2d5a3d;color:white;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)">📍</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
})

const routeCoords: [number, number][] = MAP_STOPS.map((s) => [s.lat, s.lng])

export function MapPage() {
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    setTimeout(() => mapRef.current?.invalidateSize(), 200)
  }, [])

  return (
    <div className="safe-top flex h-[calc(100vh-5rem)] flex-col">
      <header className="px-4 pt-4 pb-2">
        <h1 className="text-xl font-bold text-highland-800">Mapa del viatge</h1>
        <p className="text-sm text-gray-500">Ruta Edimburg → Highlands → Skye → tornada</p>
      </header>

      <div className="flex-1 px-4 pb-4">
        <MapContainer
          center={[56.5, -4.5]}
          zoom={6}
          className="h-full min-h-[300px]"
          ref={mapRef}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Polyline positions={routeCoords} color="#2d5a3d" weight={3} opacity={0.7} dashArray="8 8" />
          {MAP_STOPS.map((stop) => (
            <Marker key={stop.name} position={[stop.lat, stop.lng]} icon={icon}>
              <Popup>
                <strong>{stop.name}</strong>
                <br />
                Dia {stop.day}
                <br />
                <Link to={`/dia/${stop.day}`} className="text-highland-700 underline text-sm">
                  Veure dia →
                </Link>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
