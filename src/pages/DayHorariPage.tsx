import { Link, useParams } from 'react-router-dom'
import { useTripContext } from '../context/TripContext'
import { DayHero } from '../components/DayHero'
import { DayTimeline } from '../components/DayTimeline'

export function DayHorariPage() {
  const { dayNum } = useParams<{ dayNum: string }>()
  const { days } = useTripContext()

  const day = days.find((d) => d.day_number === Number(dayNum))

  if (!day) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center p-6">
        <p className="text-gray-500">Dia no trobat</p>
        <Link to="/dies" className="mt-4 text-highland-700">Tornar</Link>
      </div>
    )
  }

  const prev = days.find((d) => d.day_number === day.day_number - 1)
  const next = days.find((d) => d.day_number === day.day_number + 1)

  return (
    <div className="pb-6">
      <DayHero
        day={day}
        prev={prev}
        next={next}
        backTo={`/dia/${day.day_number}`}
      />

      <main className="px-4 pt-4 pb-4">
        <DayTimeline day={day} activities={day.activities ?? []} />
      </main>
    </div>
  )
}
