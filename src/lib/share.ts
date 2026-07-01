import { dayRoute } from './maps'
import type { Day, Suggestion } from './types'
import { LODGINGS_BY_DAY } from './types'

export function formatDayPlan(
  day: Day,
  options?: { suggestions?: Suggestion[]; tripTitle?: string },
) {
  const lines: string[] = []
  const title = options?.tripTitle ?? 'Nova Ruta Escòcia'

  lines.push(`🏴󠁧󠁢󠁳󠁣󠁴󠁿 *${title}*`)
  lines.push(`*${day.base_city}* — Dia ${day.day_number}`)
  lines.push(day.label)
  lines.push('')

  const activities = day.activities ?? []
  if (activities.length) {
    lines.push('*Pla del dia:*')
    for (const activity of activities) {
      lines.push(`${activity.time || '—'} · ${activity.text}`)
    }
    lines.push('')
  }

  if (day.lodging) {
    lines.push(`🛏️ *Allotjament:* ${day.lodging}`)
    const lodging = LODGINGS_BY_DAY[day.day_number]
    if (lodging?.name) lines.push(lodging.name)
    if (lodging?.address) lines.push(`📍 ${lodging.address}`)
    lines.push('')
  }

  const selected = (options?.suggestions ?? []).filter(
    (item) => item.day_id === day.id && item.status === 'selected',
  )
  if (selected.length) {
    lines.push('*Llocs elegits:*')
    for (const item of selected) {
      lines.push(`• ${item.title}`)
    }
    lines.push('')
  }

  const route = dayRoute(day.day_number)
  if (route) {
    lines.push(`🗺️ *Ruta:* ${route.label}`)
    lines.push(route.url)
  }

  return lines.join('\n')
}

export function whatsAppShareUrl(text: string) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}
