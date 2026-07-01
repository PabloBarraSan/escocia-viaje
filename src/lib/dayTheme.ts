import type { Day } from './types'

export const DAY_TYPE_HERO: Record<Day['type'], { gradient: string; emoji: string; accent: string; tint: 'green' | 'warm' | 'slate' }> = {
  city: {
    gradient: 'from-slate-900 via-highland-900 to-highland-800',
    emoji: '🏰',
    accent: 'text-slate-200',
    tint: 'slate',
  },
  road: {
    gradient: 'from-amber-800 via-orange-900 to-highland-900',
    emoji: '🚗',
    accent: 'text-amber-200',
    tint: 'warm',
  },
  nature: {
    gradient: 'from-emerald-900 via-highland-900 to-teal-950',
    emoji: '🏔️',
    accent: 'text-emerald-200',
    tint: 'green',
  },
}

/**
 * Fotos verificades (Unsplash → public/images/).
 * Cada entrada té ubicació geogràfica confirmada al perfil de la foto.
 */
export const DAY_PHOTOS: Record<number, { url: string; label: string; place: string }> = {
  1: {
    url: '/images/day-1.jpg',
    label: 'Castell d’Edimburg',
    place: 'Edinburgh Castle, Edinburgh',
  },
  2: {
    url: '/images/day-2.jpg',
    label: 'Carrer històric amb el castell',
    place: 'Edinburgh (vista des del centre)',
  },
  3: {
    url: '/images/day-3.jpg',
    label: 'Highlands escoceses',
    place: 'Scottish Highlands (camí cap a Inverness)',
  },
  4: {
    url: '/images/day-4.jpg',
    label: 'Costa de la Illa de Skye',
    place: 'Isle of Skye, Scotland',
  },
  5: {
    url: '/images/day-5.jpg',
    label: 'Old Man of Storr',
    place: 'Isle of Skye, Scotland',
  },
  6: {
    url: '/images/day-6.jpg',
    label: 'Ben Nevis',
    place: 'Fort William, Scotland',
  },
  7: {
    url: '/images/day-7.jpg',
    label: 'Vall de Glencoe',
    place: 'Glencoe, Scotland',
  },
  8: {
    url: '/images/day-8.jpg',
    label: 'Castell d’Edimburg',
    place: 'Edinburgh Castle, Edinburgh',
  },
}

const TYPE_FALLBACK: Record<Day['type'], string> = {
  city: '/images/day-1.jpg',
  road: '/images/day-3.jpg',
  nature: '/images/day-7.jpg',
}

export const LOGIN_PHOTO = '/images/login.jpg'

export function dayPhoto(day: Pick<Day, 'day_number' | 'type'>) {
  return DAY_PHOTOS[day.day_number] ?? {
    url: TYPE_FALLBACK[day.type],
    label: day.type === 'city' ? 'Ciutat escocesa' : day.type === 'road' ? 'Carretera escocesa' : 'Paisatge escocès',
    place: 'Scotland',
  }
}

export function heroTint(day: Pick<Day, 'type'>) {
  return DAY_TYPE_HERO[day.type].tint
}
