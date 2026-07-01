import type { Activity } from './types'

const END_OF_DAY = 24 * 60

export function activityTimeMinutes(time: string | null | undefined) {
  if (!time) return END_OF_DAY
  const [hours, minutes] = time.split(':').map(Number)
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return END_OF_DAY
  return hours * 60 + minutes
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
