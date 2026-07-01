import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import { Link } from 'react-router-dom'
import L from 'leaflet'
import { MAP_STOPS } from '../lib/types'

function numberedIcon(number: number) {
  return L.divIcon({
    className: '',
    html: `<div style="background:#2d5a3d;color:white;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;border:2px solid white;box-shadow:0 2px 7px rgba(0,0,0,0.35)">${number}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  })
}

const routeCoords: [number, number][] = MAP_STOPS.map((stop) => [stop.lat, stop.lng])

export function MapPage() {
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    setTimeout(() => mapRef.current?.invalidateSize(), 200)
  }, [])

  return (
    <div className="safe-top flex h-[calc(100vh-5rem)] flex-col">
      <header className="px-4 pb-2 pt-4">
        <h1 className="text-xl font-bold text-highland-800">Mapa del viatge</h1>
        <p className="text-sm text-gray-500">Segueix els números per veure l’ordre de la ruta</p>
      </header>

      <div className="flex-1 px-4 pb-4">
        <MapContainer
          center={[56.5, -4.5]}
          zoom={6}
          className="h-full min-h-[300px]"
          ref={mapRef}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Polyline positions={routeCoords} color="#2d5a3d" weight={3} opacity={0.7} dashArray="8 8" />
          {MAP_STOPS.map((stop, index) => (
            <Marker
              key={`${stop.name}-${stop.day}`}
              position={[stop.lat, stop.lng]}
              icon={numberedIcon(index + 1)}
            >
              <Popup>
                <span style={{ color: '#6b7280', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                  Parada {index + 1}
                </span>
                <br />
                <strong>{stop.name}</strong>
                <br />
                Dia {stop.day}
                <br />
                <Link to={`/dia/${stop.day}`} className="text-sm text-highland-700 underline">
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
