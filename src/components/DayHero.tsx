import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Day } from '../lib/types'
import { DAY_TYPE_COLORS, DAY_TYPE_LABELS } from '../lib/types'
import { PhotoHero } from './PhotoHero'
import { dayPhoto, heroTint } from '../lib/dayTheme'

type Props = {
  day: Day
  prev: Day | undefined
  next: Day | undefined
  backTo?: string
}

export function DayHero({ day, prev, next, backTo = '/dies' }: Props) {
  const navigate = useNavigate()
  const photo = dayPhoto(day)

  return (
    <PhotoHero
      photo={photo.url}
      alt={photo.label}
      tint={heroTint(day)}
      className="rounded-none shadow-md"
      minHeight="8.75rem"
    >
      <div className="hero-safe-padding flex min-h-[8.75rem] flex-col justify-between gap-2 p-4 pb-3 text-white">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => navigate(backTo)}
            className="mt-0.5 rounded-full bg-black/25 p-2 hover:bg-black/40"
            aria-label="Tornar"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-bold uppercase tracking-wider text-white/70">Dia {day.day_number}</p>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${DAY_TYPE_COLORS[day.type]}`}>
                {DAY_TYPE_LABELS[day.type]}
              </span>
            </div>
            <h1 className="font-display text-2xl font-bold leading-tight">{day.base_city}</h1>
            <p className="text-sm text-white/80">{day.label}</p>
          </div>
        </div>

        <div className="flex justify-between text-xs font-medium text-white/75">
          {prev ? (
            <button type="button" onClick={() => navigate(`/dia/${prev.day_number}`)} className="flex items-center gap-0.5">
              <ChevronLeft size={15} /> Dia {prev.day_number}
            </button>
          ) : <span />}
          {next ? (
            <button type="button" onClick={() => navigate(`/dia/${next.day_number}`)} className="flex items-center gap-0.5">
              Dia {next.day_number} <ChevronRight size={15} />
            </button>
          ) : <span />}
        </div>
      </div>
    </PhotoHero>
  )
}
