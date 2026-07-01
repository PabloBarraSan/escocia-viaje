import type { Activity, ActivityKind } from './types'

const STORAGE_KEY = 'escocia_activity_columns'

export type ActivityColumn =
  | 'description'
  | 'maps_url'
  | 'duration_minutes'
  | 'place_name'
  | 'place_address'
  | 'kind'
  | 'votes'

type ActivityColumnFlags = Record<ActivityColumn, boolean>

const DEFAULT_FLAGS: ActivityColumnFlags = {
  description: true,
  maps_url: true,
  duration_minutes: true,
  place_name: true,
  place_address: true,
  kind: true,
  votes: true,
}

function readFlags(): ActivityColumnFlags {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_FLAGS }
    const parsed = JSON.parse(raw) as Partial<ActivityColumnFlags>
    return {
      description: parsed.description !== false,
      maps_url: parsed.maps_url !== false,
      duration_minutes: parsed.duration_minutes !== false,
      place_name: parsed.place_name !== false,
      place_address: parsed.place_address !== false,
      kind: parsed.kind !== false,
      votes: parsed.votes !== false,
    }
  } catch {
    return { ...DEFAULT_FLAGS }
  }
}

function writeFlags(flags: ActivityColumnFlags) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(flags))
}

export function markActivityColumnMissing(column: ActivityColumn) {
  const flags = readFlags()
  if (!flags[column]) return
  writeFlags({ ...flags, [column]: false })
}

export function resetActivityColumnFlags() {
  localStorage.removeItem(STORAGE_KEY)
}

export function missingActivityColumnFromError(
  error: { code?: string; message?: string } | null,
): ActivityColumn | null {
  if (!error?.message) return null
  if (error.code !== 'PGRST204' && !error.message.includes('schema cache')) return null
  const match = error.message.match(/'(\w+)' column/)
  const column = match?.[1]
  if (
    column === 'description'
    || column === 'maps_url'
    || column === 'duration_minutes'
    || column === 'place_name'
    || column === 'place_address'
    || column === 'kind'
    || column === 'votes'
  ) {
    return column
  }
  return null
}

export type ActivityWriteInput = {
  text: string
  kind?: ActivityKind
  votes?: string[]
  place_name?: string | null
  place_address?: string | null
  description?: string
  maps_url?: string | null
  duration_minutes?: number | null
}

export function buildActivityRow(
  base: Record<string, unknown>,
  input: ActivityWriteInput,
): Record<string, unknown> {
  const flags = readFlags()
  const row: Record<string, unknown> = { ...base }
  const noteExtras: string[] = []

  row.text = input.text

  if (flags.kind) {
    row.kind = input.kind ?? 'plan'
  }
  if (flags.votes) {
    row.votes = input.votes ?? []
  }

  if (flags.place_name) {
    row.place_name = input.place_name?.trim() || null
  } else if (input.place_name?.trim()) {
    noteExtras.push(input.place_name.trim())
  }

  if (flags.place_address) {
    row.place_address = input.place_address?.trim() || null
  } else if (input.place_address?.trim()) {
    noteExtras.push(input.place_address.trim())
  }

  if (flags.description) {
    const baseDesc = input.description?.trim() ?? ''
    row.description = noteExtras.length > 0
      ? [baseDesc, ...noteExtras].filter(Boolean).join('\n')
      : baseDesc
  } else if (input.description?.trim() || noteExtras.length > 0) {
    noteExtras.unshift(input.description?.trim() ?? '')
    row.text = [input.text, ...noteExtras.filter(Boolean)].join('\n')
  }

  if (flags.maps_url) {
    if (input.maps_url) row.maps_url = input.maps_url
  } else if (input.maps_url) {
    row.text = `${row.text}\n${input.maps_url}`
  }

  if (flags.duration_minutes) {
    if (input.duration_minutes != null) row.duration_minutes = input.duration_minutes
  }

  return row
}

export function normalizeActivityRow(row: Record<string, unknown>): Activity {
  return {
    id: String(row.id ?? ''),
    day_id: String(row.day_id ?? ''),
    time: row.time == null ? null : String(row.time),
    text: String(row.text ?? ''),
    kind: row.kind === 'idea' ? 'idea' : 'plan',
    votes: Array.isArray(row.votes) ? row.votes.map(String) : [],
    place_name: typeof row.place_name === 'string' ? row.place_name : null,
    place_address: typeof row.place_address === 'string' ? row.place_address : null,
    description: typeof row.description === 'string' ? row.description : '',
    maps_url: typeof row.maps_url === 'string' ? row.maps_url : null,
    duration_minutes:
      typeof row.duration_minutes === 'number' ? row.duration_minutes : null,
    sort_order: typeof row.sort_order === 'number' ? row.sort_order : 0,
    updated_by: row.updated_by == null ? null : String(row.updated_by),
    updated_at: String(row.updated_at ?? ''),
  }
}
