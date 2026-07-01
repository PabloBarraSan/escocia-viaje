import { Link } from 'react-router-dom'
import { BedDouble, CalendarCheck, ExternalLink, MapPinned, Navigation, Phone, ShieldCheck } from 'lucide-react'
import { useTripContext } from '../context/TripContext'
import { LODGINGS_BY_DAY } from '../lib/types'

function todayKey() {
  const date = new Date()
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

function directions(destination: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=driving`
}

export function TodayPage() {
  const { days, suggestions, tripInfo } = useTripContext()
  const today = todayKey()
  const day = days.find((item) => item.date === today)
    ?? days.find((item) => item.date > today)
    ?? days.at(-1)

  if (!day) return null

  const selected = suggestions.filter((item) => item.day_id === day.id && item.status === 'selected')
  const practical = tripInfo.filter((item) => ['vols', 'matricula_cotxe', 'telefon_emergencia', 'asseguranca'].includes(item.key) && item.value)
  const lodgingDetails = LODGINGS_BY_DAY[day.day_number] ?? (
    day.lodging_address ? {
      name: day.lodging_name ?? day.lodging ?? 'Allotjament',
      address: day.lodging_address,
      phone: day.lodging_phone ?? '',
    } : null
  )
  const lodgingRoute = lodgingDetails ? directions(lodgingDetails.address) : null

  return (
    <main className="safe-top space-y-5 p-4">
      <header>
        <p className="text-xs font-bold uppercase tracking-wider text-highland-600">
          {day.date === today ? 'Avui' : 'Pròxim dia'}
        </p>
        <h1 className="text-3xl font-bold text-highland-900">{day.base_city}</h1>
        <p className="text-sm text-gray-500">{day.label} · Dia {day.day_number}</p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <a href={directions(`${day.base_city}, Scotland`)} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-2xl bg-highland-700 p-4 font-semibold text-white">
          <Navigation size={19} /> Com arribar
        </a>
        <Link to={`/dia/${day.day_number}`} className="flex items-center justify-center gap-2 rounded-2xl bg-white p-4 font-semibold text-highland-800 shadow-sm">
          <CalendarCheck size={19} /> Veure dia
        </Link>
      </div>

      {day.lodging && (
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase text-gray-500"><BedDouble size={16} /> Aquesta nit</h2>
          <p className="mt-2 font-semibold text-highland-900">{day.lodging}</p>
          {lodgingDetails?.name && <p className="mt-1 text-sm font-semibold text-highland-700">{lodgingDetails.name}</p>}
          {lodgingDetails?.address && <p className="mt-1 text-sm text-gray-500">{lodgingDetails.address}</p>}
          {lodgingRoute && (
            <a href={lodgingRoute} target="_blank" rel="noreferrer" className="mt-3 flex w-fit items-center gap-2 rounded-xl bg-highland-700 px-3 py-2 text-sm font-semibold text-white">
              <Navigation size={16} /> Anar a l’allotjament
            </a>
          )}
        </section>
      )}

      <section>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-500">Pla del dia</h2>
        <div className="space-y-2">
          {(day.activities ?? []).map((activity) => (
            <div key={activity.id} className="flex gap-3 rounded-xl bg-white p-3 shadow-sm">
              <span className="w-12 shrink-0 text-sm font-bold text-highland-700">{activity.time || '—'}</span>
              <span className="text-sm text-gray-700">{activity.text}</span>
            </div>
          ))}
        </div>
      </section>

      {selected.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-500">Llocs elegits</h2>
          <div className="space-y-2">
            {selected.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl bg-highland-50 p-3">
                <span className="font-semibold text-highland-900">{item.title}</span>
                {item.maps_url && <a href={item.maps_url} target="_blank" rel="noreferrer" aria-label="Obrir a Maps"><ExternalLink size={18} /></a>}
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-500">Informació útil</h2>
        <div className="space-y-2">
          {practical.map((item) => (
            <div key={item.id} className="flex gap-3 rounded-xl bg-white p-3 text-sm shadow-sm">
              {item.key === 'telefon_emergencia' ? <Phone size={17} /> : <ShieldCheck size={17} />}
              <span>{item.value}</span>
            </div>
          ))}
          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`petrol station near ${day.base_city}, Scotland`)}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl bg-white p-3 text-sm font-semibold text-highland-700 shadow-sm">
            <MapPinned size={17} /> Buscar benzinera pròxima
          </a>
        </div>
      </section>
    </main>
  )
}
