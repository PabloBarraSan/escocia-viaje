import type { Activity } from './types'

const END_OF_DAY = 24 * 60
const DEFAULT_DAY_START = 8 * 60
const DEFAULT_DAY_END = 23 * 60
const DEFAULT_DURATION = 60

export const DURATION_PRESETS = [
  { label: '30 min', value: 30 },
  { label: '1 h', value: 60 },
  { label: '1h 30', value: 90 },
  { label: '2 h', value: 120 },
  { label: '3 h', value: 180 },
] as const

export function activityTimeMinutes(time: string | null | undefined) {
  if (!time) return END_OF_DAY
  const [hours, minutes] = time.split(':').map(Number)
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return END_OF_DAY
  return hours * 60 + minutes
}

export function minutesToTime(totalMinutes: number) {
  const clamped = Math.max(0, Math.min(totalMinutes, END_OF_DAY - 1))
  const hours = Math.floor(clamped / 60)
  const minutes = clamped % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

export function formatDuration(minutes: number | null | undefined) {
  if (!minutes) return null
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (!rest) return `${hours} h`
  return `${hours} h ${rest} min`
}

export function activityEndMinutes(activity: Activity) {
  const start = activityTimeMinutes(activity.time)
  if (!activity.time) return start
  return start + (activity.duration_minutes ?? DEFAULT_DURATION)
}

export function formatTimeRange(activity: Activity) {
  if (!activity.time) return null
  const start = activity.time.slice(0, 5)
  if (!activity.duration_minutes) return start
  return `${start} – ${minutesToTime(activityEndMinutes(activity))}`
}

export function sortActivities(activities: Activity[]) {
  return [...activities].sort((a, b) => {
    const byTime = activityTimeMinutes(a.time) - activityTimeMinutes(b.time)
    if (byTime !== 0) return byTime
    return a.sort_order - b.sort_order
  })
}

export function sortOrderForNewActivity(activities: Activity[], time: string | null) {
  const sorted = sortActivities(activities)
  const target = activityTimeMinutes(time || null)
  const index = sorted.findIndex((activity) => activityTimeMinutes(activity.time) > target)
  const insertAt = index === -1 ? sorted.length : index

  if (insertAt === 0) return Math.max(1, (sorted[0]?.sort_order ?? 1) - 1)
  if (insertAt >= sorted.length) return (sorted.at(-1)?.sort_order ?? 0) + 1

  const prev = sorted[insertAt - 1]!
  const next = sorted[insertAt]!
  const gap = next.sort_order - prev.sort_order
  if (gap > 1) return prev.sort_order + Math.floor(gap / 2)
  return prev.sort_order + 1
}

export function suggestNextActivityTime(activities: Activity[]) {
  const timed = sortActivities(activities).filter((activity) => activity.time)
  if (!timed.length) return '09:00'
  const last = timed.at(-1)!
  return minutesToTime(activityEndMinutes(last))
}

export type TimelineBlock = {
  activity: Activity
  top: number
  height: number
  startMinutes: number
  endMinutes: number
}

export function buildTimelineLayout(activities: Activity[], pixelsPerHour = 52) {
  const timed = sortActivities(activities).filter((activity) => activity.time)
  if (!timed.length) {
    return {
      blocks: [] as TimelineBlock[],
      startMinutes: DEFAULT_DAY_START,
      endMinutes: DEFAULT_DAY_END,
      height: ((DEFAULT_DAY_END - DEFAULT_DAY_START) / 60) * pixelsPerHour,
      untimed: sortActivities(activities).filter((activity) => !activity.time),
    }
  }

  const starts = timed.map((activity) => activityTimeMinutes(activity.time))
  const ends = timed.map((activity) => activityEndMinutes(activity))
  const startMinutes = Math.max(6 * 60, Math.min(DEFAULT_DAY_START, ...starts) - 30)
  const endMinutes = Math.min(END_OF_DAY, Math.max(DEFAULT_DAY_END, ...ends) + 30)
  const span = endMinutes - startMinutes

  const blocks: TimelineBlock[] = timed.map((activity) => {
    const start = activityTimeMinutes(activity.time)
    const end = activityEndMinutes(activity)
    const top = ((start - startMinutes) / 60) * pixelsPerHour
    const height = Math.max(((end - start) / 60) * pixelsPerHour, 36)
    return { activity, top, height, startMinutes: start, endMinutes: end }
  })

  return {
    blocks,
    startMinutes,
    endMinutes,
    height: (span / 60) * pixelsPerHour,
    untimed: sortActivities(activities).filter((activity) => !activity.time),
  }
}

export function hourMarkers(startMinutes: number, endMinutes: number) {
  const markers: number[] = []
  const first = Math.ceil(startMinutes / 60) * 60
  for (let minute = first; minute <= endMinutes; minute += 60) {
    markers.push(minute)
  }
  return markers
}
