import { useNavigate } from 'react-router-dom'
import { ArrowLeft, BedDouble, ChevronLeft, ChevronRight, ListChecks } from 'lucide-react'
import type { Day } from '../lib/types'
import { DAY_TYPE_COLORS, DAY_TYPE_LABELS, LODGINGS_BY_DAY } from '../lib/types'
import { PhotoHero } from './PhotoHero'
import { dayPhoto, heroTint } from '../lib/dayTheme'

type Props = {
  day: Day
  prev: Day | undefined
  next: Day | undefined
  backTo?: string
}

const TOTAL_DAYS = 8

export function DayHero({ day, prev, next, backTo = '/dies' }: Props) {
  const navigate = useNavigate()
  const photo = dayPhoto(day)
  const lodging = LODGINGS_BY_DAY[day.day_number]
  const activityCount = (day.activities ?? []).filter((activity) => activity.kind !== 'idea').length

  return (
    <PhotoHero
      photo={photo.url}
      alt={photo.label}
      tint={heroTint(day)}
      className="rounded-none shadow-lg"
      minHeight="14rem"
    >
      <div className="hero-safe-padding flex min-h-[14rem] flex-col justify-between p-4 pb-3 text-white">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate(backTo)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm transition hover:bg-black/45"
            aria-label="Tornar"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-black/30 px-3 py-1.5 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              Dia {day.day_number} de {TOTAL_DAYS}
            </span>
            <span className={`rounded-full px-2.5 py-1.5 text-[10px] font-bold ${DAY_TYPE_COLORS[day.type]}`}>
              {DAY_TYPE_LABELS[day.type]}
            </span>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">{day.label}</p>
          <h1 className="mt-1 font-display text-4xl font-bold leading-none tracking-tight drop-shadow-sm">
            {day.base_city}
          </h1>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-black/30 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm">
              <ListChecks size={14} /> {activityCount} {activityCount === 1 ? 'activitat' : 'activitats'}
            </span>
            {lodging && (
              <span className="flex max-w-[75%] items-center gap-1.5 rounded-full bg-black/30 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm">
                <BedDouble size={14} className="shrink-0" />
                <span className="truncate">{lodging.name}</span>
              </span>
            )}
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-3 flex gap-1" aria-label={`Dia ${day.day_number} de ${TOTAL_DAYS}`}>
            {Array.from({ length: TOTAL_DAYS }, (_, index) => (
              <span
                key={index}
                className={`h-1 flex-1 rounded-full ${
                  index + 1 < day.day_number
                    ? 'bg-white/55'
                    : index + 1 === day.day_number
                      ? 'bg-white'
                      : 'bg-white/20'
                }`}
              />
            ))}
          </div>
          <div className="flex items-center justify-between text-sm font-semibold">
            {prev ? (
              <button
                type="button"
                onClick={() => navigate(`/dia/${prev.day_number}`)}
                className="flex min-h-10 items-center gap-1 rounded-xl bg-black/25 px-3 backdrop-blur-sm"
              >
                <ChevronLeft size={17} /> Dia {prev.day_number}
              </button>
            ) : <span />}
            {next ? (
              <button
                type="button"
                onClick={() => navigate(`/dia/${next.day_number}`)}
                className="flex min-h-10 items-center gap-1 rounded-xl bg-black/25 px-3 backdrop-blur-sm"
              >
                Dia {next.day_number} <ChevronRight size={17} />
              </button>
            ) : <span />}
          </div>
        </div>
      </div>
    </PhotoHero>
  )
}
