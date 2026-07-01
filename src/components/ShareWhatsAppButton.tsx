import { MessageCircle } from 'lucide-react'
import { useTripContext } from '../context/TripContext'
import type { Day } from '../lib/types'
import { formatDayPlan, whatsAppShareUrl } from '../lib/share'

type Props = {
  day: Day
  compact?: boolean
  className?: string
}

export function ShareWhatsAppButton({ day, compact = false, className = '' }: Props) {
  const { suggestions, trip } = useTripContext()

  const share = () => {
    const text = formatDayPlan(day, {
      suggestions,
      tripTitle: trip?.title,
    })
    window.open(whatsAppShareUrl(text), '_blank', 'noopener,noreferrer')
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={share}
        className={`flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] p-4 font-semibold text-white shadow-sm transition active:scale-[0.98] ${className}`}
      >
        <MessageCircle size={19} />
        WhatsApp
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={share}
      className={`flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-3.5 font-semibold text-white shadow-md transition active:scale-[0.98] ${className}`}
    >
      <MessageCircle size={20} />
      Compartir el pla del dia
    </button>
  )
}
