export interface Trip {
  id: string
  title: string
  code: string
  car_rental_from: string | null
  car_rental_to: string | null
  updated_at: string
}

export interface Day {
  id: string
  trip_id: string
  day_number: number
  date: string
  label: string
  base_city: string
  type: 'city' | 'road' | 'nature'
  lodging: string | null
  lat: number | null
  lng: number | null
  sort_order: number
  updated_by: string | null
  updated_at: string
  activities?: Activity[]
  note?: DayNote
}

export interface Activity {
  id: string
  day_id: string
  time: string | null
  text: string
  sort_order: number
  updated_by: string | null
  updated_at: string
}

export interface DayNote {
  day_id: string
  text: string
  updated_by: string | null
  updated_at: string
}

export interface TripInfo {
  id: string
  trip_id: string
  key: string
  value: string
  updated_by: string | null
  updated_at: string
}

export interface Idea {
  id: string
  trip_id: string
  text: string
  author: string
  votes: string[]
  created_at: string
}

export interface ChecklistItem {
  id: string
  trip_id: string
  text: string
  done: boolean
  author: string | null
  sort_order: number
  updated_by: string | null
  updated_at: string
}

export interface Session {
  name: string
  code: string
}

export const TRIP_CODE = 'ESCOCIA2026'

export const DAY_TYPE_LABELS: Record<Day['type'], string> = {
  city: 'Ciutat',
  road: 'Carretera',
  nature: 'Natura',
}

export const DAY_TYPE_COLORS: Record<Day['type'], string> = {
  city: 'bg-sky-100 text-sky-800',
  road: 'bg-amber-100 text-amber-800',
  nature: 'bg-emerald-100 text-emerald-800',
}

export const MAP_STOPS = [
  { name: 'Edimburg', lat: 55.9533, lng: -3.1883, day: 1 },
  { name: 'The Kelpies', lat: 56.0194, lng: -3.7548, day: 3 },
  { name: 'Stirling Castle', lat: 56.1239, lng: -3.9483, day: 3 },
  { name: 'Perth', lat: 56.3950, lng: -3.4308, day: 3 },
  { name: 'Inverness', lat: 57.4778, lng: -4.2247, day: 3 },
  { name: 'Illa de Skye', lat: 57.4127, lng: -6.1940, day: 4 },
  { name: 'Fort William', lat: 56.8198, lng: -5.1052, day: 6 },
  { name: 'Glencoe', lat: 56.6828, lng: -5.1025, day: 7 },
  { name: 'Glasgow', lat: 55.8642, lng: -4.2518, day: 7 },
]
