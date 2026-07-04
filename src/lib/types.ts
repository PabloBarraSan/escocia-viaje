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
  lodging_name?: string | null
  lodging_address?: string | null
  lodging_phone?: string | null
  lat: number | null
  lng: number | null
  sort_order: number
  updated_by: string | null
  updated_at: string
  activities?: Activity[]
  note?: DayNote
}

export type ActivityKind = 'plan' | 'idea'

export interface Activity {
  id: string
  day_id: string
  time: string | null
  text: string
  kind: ActivityKind
  votes: string[]
  place_name: string | null
  place_address: string | null
  description: string
  maps_url: string | null
  duration_minutes: number | null
  sort_order: number
  updated_by: string | null
  updated_at: string
}

export interface DayMessage {
  id: string
  day_id: string
  author: string
  text: string
  created_at: string
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

export type SuggestionCategory = 'comer' | 'cenar' | 'cafe' | 'veure' | 'passeig' | 'compra' | 'parada'
export type SuggestionStatus = 'proposed' | 'selected' | 'discarded'

export interface Suggestion {
  id: string
  trip_id: string
  day_id: string | null
  title: string
  category: SuggestionCategory
  note: string
  maps_url: string | null
  author: string
  votes: string[]
  status: SuggestionStatus
  created_at: string
}

export interface Expense {
  id: string
  trip_id: string
  day_id: string | null
  description: string
  amount: number
  paid_by: string
  participants: string[]
  created_at: string
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
]

export const LODGINGS_BY_DAY: Record<number, {
  name: string
  address: string
  phone: string
  lat: number
  lng: number
}> = {
  1: {
    name: 'Drummond Condo',
    address: '5 Drummond Street, Old Town, Edinburgh, EH8 9TT, United Kingdom',
    phone: '+44 7738 940365',
    lat: 55.9504,
    lng: -3.1836,
  },
  2: {
    name: 'Drummond Condo',
    address: '5 Drummond Street, Old Town, Edinburgh, EH8 9TT, United Kingdom',
    phone: '+44 7738 940365',
    lat: 55.9504,
    lng: -3.1836,
  },
  4: {
    name: 'Bayview Hostel',
    address: 'Broadford Youth Hostel, Broadford, IV49 9AA, United Kingdom',
    phone: '+44 1471 250300',
    lat: 57.2542,
    lng: -5.9097,
  },
  5: {
    name: 'Bayview Hostel',
    address: 'Broadford Youth Hostel, Broadford, IV49 9AA, United Kingdom',
    phone: '+44 1471 250300',
    lat: 57.2542,
    lng: -5.9097,
  },
  6: {
    name: '3 Bedroom Apartment - Loch Linnhe Views',
    address: '13 Ross Place, Fort William, PH33 6JZ, United Kingdom',
    phone: '+44 7708 008880',
    lat: 56.819,
    lng: -5.111,
  },
  7: {
    name: 'JOIVY Royal Mile',
    address: '149 Cowgate, Old Town, Edinburgh, EH1 1JT, United Kingdom',
    phone: '+44 7506 822438',
    lat: 55.9489,
    lng: -3.1962,
  },
}
