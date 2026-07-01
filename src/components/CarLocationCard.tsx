import { useState } from 'react'
import { CarFront, LocateFixed, Navigation } from 'lucide-react'
import { useTripContext } from '../context/TripContext'
import { useSession } from '../hooks/useSession'

type CarLocation = {
  lat: number
  lng: number
  by: string
  at: string
}

export function CarLocationCard({ compact = false }: { compact?: boolean }) {
  const { tripInfo, saveTripInfoByKey } = useTripContext()
  const { session } = useSession()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const row = tripInfo.find((item) => item.key === 'ubicacio_cotxe')
  let location: CarLocation | null = null
  try {
    location = row?.value ? JSON.parse(row.value) : null
  } catch { location = null }

  const saveHere = () => {
    if (!session || !navigator.geolocation) {
      setError('Aquest dispositiu no permet obtenir la ubicació.')
      return
    }
    setSaving(true)
    setError('')
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await saveTripInfoByKey('ubicacio_cotxe', JSON.stringify({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            by: session.name,
            at: new Date().toISOString(),
          }), session.name)
        } catch {
          setError('No s’ha pogut guardar la ubicació.')
        } finally {
          setSaving(false)
        }
      },
      () => {
        setError('Activa el permís d’ubicació per guardar el cotxe.')
        setSaving(false)
      },
      { enableHighAccuracy: true, timeout: 12_000 },
    )
  }

  const route = location
    ? `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}&travelmode=walking`
    : null

  return (
    <section className={`rounded-2xl border border-highland-100 bg-white shadow-sm ${compact ? 'p-4' : 'bg-amber-50 p-4'}`}>
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-800">
          <CarFront size={20} />
        </span>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Cotxe</p>
          <h2 className="font-semibold text-highland-900">On està aparcat?</h2>
        </div>
      </div>
      {location ? (
        <>
          <p className="mt-1 text-xs text-gray-500">
            Guardat per {location.by} · {new Date(location.at).toLocaleString('ca-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </p>
          <div className="mt-3 flex gap-2">
            <a href={route!} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-600 px-3 py-2 text-sm font-semibold text-white">
              <Navigation size={16} /> Tornar al cotxe
            </a>
            <button onClick={saveHere} disabled={saving} className="rounded-xl bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-900">
              Actualitzar
            </button>
          </div>
        </>
      ) : (
        <button onClick={saveHere} disabled={saving} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-3 py-2 text-sm font-semibold text-white">
          <LocateFixed size={16} /> {saving ? 'Guardant…' : 'Hem aparcat ací'}
        </button>
      )}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </section>
  )
}
