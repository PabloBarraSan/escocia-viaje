import { Plane, PlaneLanding, PlaneTakeoff } from 'lucide-react'
import { FLIGHTS } from '../lib/flights'

export function FlightsCard({ dayNumber }: { dayNumber?: number }) {
  const flights = dayNumber ? FLIGHTS.filter((flight) => flight.dayNumber === dayNumber) : FLIGHTS
  if (!flights.length) return null

  return (
    <section className="space-y-2">
      {!dayNumber && (
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
          <Plane size={16} /> Vols
        </h2>
      )}
      {flights.map((flight) => {
        const Icon = flight.direction === 'anada' ? PlaneTakeoff : PlaneLanding
        return (
          <div key={flight.number} className="rounded-2xl bg-gradient-to-br from-blue-700 to-sky-600 p-4 text-white shadow-sm">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-100">
                <Icon size={17} /> {flight.direction === 'anada' ? 'Vol d’anada' : 'Vol de tornada'}
              </p>
              <span className="rounded-lg bg-white/20 px-2.5 py-1 text-sm font-black">{flight.number}</span>
            </div>
            <div className="mt-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-lg font-bold">{flight.origin} → {flight.destination}</p>
                <p className="mt-1 text-sm text-blue-100">
                  {flight.dayNumber === 1 ? 'Diumenge 5 de juliol' : 'Diumenge 12 de juliol'}
                </p>
              </div>
              <p className="text-3xl font-black">{flight.time}</p>
            </div>
          </div>
        )
      })}
    </section>
  )
}
