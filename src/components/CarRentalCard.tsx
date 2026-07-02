import { CalendarClock, Car, MapPinned, Phone } from 'lucide-react'
import { CAR_RENTAL, carRentalDirections } from '../lib/carRental'

export function CarRentalCard({ dayNumber, full = false }: { dayNumber?: number; full?: boolean }) {
  const isPickup = dayNumber === CAR_RENTAL.pickup.dayNumber
  const isReturn = dayNumber === CAR_RENTAL.return.dayNumber
  if (dayNumber && !isPickup && !isReturn) return null

  const title = isPickup ? 'Recollida del cotxe' : isReturn ? 'Devolució del cotxe' : 'Cotxe de lloguer'
  const time = isPickup ? CAR_RENTAL.pickup.time : isReturn ? CAR_RENTAL.return.time : null

  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-amber-700">
            <Car size={17} /> Budget
          </p>
          <h2 className="mt-1 text-xl font-bold">{title}</h2>
        </div>
        {time && <span className="rounded-xl bg-amber-600 px-3 py-2 text-lg font-black text-white">{time}</span>}
      </div>

      {!dayNumber && (
        <p className="mt-3 flex items-center gap-2 text-sm font-semibold">
          <CalendarClock size={17} /> 7 juliol 08:00 → 11 juliol 19:00
        </p>
      )}

      <div className="mt-3 rounded-xl bg-white/70 p-3">
        <p className="font-bold">{CAR_RENTAL.office}</p>
        <p className="mt-1 text-sm text-amber-900/75">{CAR_RENTAL.address}</p>
      </div>

      {full && (
        <div className="mt-3 space-y-1 text-sm">
          <p>{CAR_RENTAL.vehicle}</p>
          <p>{CAR_RENTAL.coverage} · Total {CAR_RENTAL.price}</p>
          <p className="text-xs text-amber-800">Cal portar carnet de conduir vigent i una targeta a nom del conductor principal.</p>
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2">
        <a href={carRentalDirections()} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-3 py-2.5 text-sm font-bold text-white">
          <MapPinned size={16} /> Com arribar
        </a>
        <a href={`tel:${CAR_RENTAL.phone.replace(/\s/g, '')}`} className="flex items-center justify-center gap-2 rounded-xl bg-white px-3 py-2.5 text-sm font-bold text-amber-900">
          <Phone size={16} /> Telefonar
        </a>
      </div>
    </section>
  )
}
