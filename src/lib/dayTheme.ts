import type { Day } from './types'

export const DAY_TYPE_HERO: Record<Day['type'], { gradient: string; emoji: string; accent: string }> = {
  city: {
    gradient: 'from-slate-900 via-highland-900 to-highland-800',
    emoji: '🏰',
    accent: 'text-slate-200',
  },
  road: {
    gradient: 'from-amber-800 via-orange-900 to-highland-900',
    emoji: '🚗',
    accent: 'text-amber-200',
  },
  nature: {
    gradient: 'from-emerald-900 via-highland-900 to-teal-950',
    emoji: '🏔️',
    accent: 'text-emerald-200',
  },
}
