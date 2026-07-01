import type { Trip, Day, Activity, DayNote, TripInfo, Idea, ChecklistItem } from './types'
import { TRIP_CODE } from './types'

const STORAGE_KEY = 'escocia_local_data'

const SEED: {
  trip: Trip
  days: Day[]
  activities: Activity[]
  notes: DayNote[]
  tripInfo: TripInfo[]
  ideas: Idea[]
  checklist: ChecklistItem[]
} = {
  trip: {
    id: 'local-trip',
    title: 'Nova Ruta Escòcia',
    code: TRIP_CODE,
    car_rental_from: '2026-07-07',
    car_rental_to: '2026-07-11',
    updated_at: new Date().toISOString(),
  },
  days: [
    { id: 'd1', trip_id: 'local-trip', day_number: 1, date: '2026-07-05', label: 'Diumenge 5 juliol', base_city: 'Edimburg', type: 'city', lodging: 'Nit a Edimburg', lat: 55.9533, lng: -3.1883, sort_order: 1, updated_by: null, updated_at: '' },
    { id: 'd2', trip_id: 'local-trip', day_number: 2, date: '2026-07-06', label: 'Dilluns 6 juliol', base_city: 'Edimburg', type: 'city', lodging: 'Nit a Edimburg', lat: 55.9533, lng: -3.1883, sort_order: 2, updated_by: null, updated_at: '' },
    { id: 'd3', trip_id: 'local-trip', day_number: 3, date: '2026-07-07', label: 'Dimarts 7 juliol', base_city: 'Inverness', type: 'road', lodging: 'Nit a Inverness / Loch Ness', lat: 57.4778, lng: -4.2247, sort_order: 3, updated_by: null, updated_at: '' },
    { id: 'd4', trip_id: 'local-trip', day_number: 4, date: '2026-07-08', label: 'Dimecres 8 juliol', base_city: 'Illa de Skye', type: 'nature', lodging: 'Nit a la Illa de Skye', lat: 57.4127, lng: -6.1940, sort_order: 4, updated_by: null, updated_at: '' },
    { id: 'd5', trip_id: 'local-trip', day_number: 5, date: '2026-07-09', label: 'Dijous 9 juliol', base_city: 'Illa de Skye', type: 'nature', lodging: 'Nit a la Illa de Skye', lat: 57.4127, lng: -6.1940, sort_order: 5, updated_by: null, updated_at: '' },
    { id: 'd6', trip_id: 'local-trip', day_number: 6, date: '2026-07-10', label: 'Divendres 10 juliol', base_city: 'Fort William', type: 'nature', lodging: 'Nit a Fort William i voltants', lat: 56.8198, lng: -5.1052, sort_order: 6, updated_by: null, updated_at: '' },
    { id: 'd7', trip_id: 'local-trip', day_number: 7, date: '2026-07-11', label: 'Dissabte 11 juliol', base_city: 'Edimburg', type: 'road', lodging: 'Nit a Edimburg', lat: 55.9533, lng: -3.1883, sort_order: 7, updated_by: null, updated_at: '' },
    { id: 'd8', trip_id: 'local-trip', day_number: 8, date: '2026-07-12', label: 'Diumenge 12 juliol', base_city: 'Edimburg', type: 'city', lodging: 'Vol de tornada 19:00h', lat: 55.9533, lng: -3.1883, sort_order: 8, updated_by: null, updated_at: '' },
  ],
  activities: [
    { id: 'a1', day_id: 'd1', time: '12:00', text: 'Arribada a Edimburg a migdia', sort_order: 1, updated_by: null, updated_at: '' },
    { id: 'a2', day_id: 'd1', time: '20:00', text: "Sopar prompte en un pub d'Edimburg", sort_order: 2, updated_by: null, updated_at: '' },
    { id: 'a3', day_id: 'd2', time: '10:00', text: "Visitar els llocs d'Edimburg", sort_order: 1, updated_by: null, updated_at: '' },
    { id: 'a4', day_id: 'd3', time: '09:00', text: 'Agafem el cotxe cap amunt', sort_order: 1, updated_by: null, updated_at: '' },
    { id: 'a5', day_id: 'd3', time: '10:30', text: 'Parada: The Kelpies, Falkirk', sort_order: 2, updated_by: null, updated_at: '' },
    { id: 'a6', day_id: 'd3', time: '12:00', text: 'Parada: Stirling Castle', sort_order: 3, updated_by: null, updated_at: '' },
    { id: 'a7', day_id: 'd3', time: '13:30', text: 'Parada: Perth', sort_order: 4, updated_by: null, updated_at: '' },
    { id: 'a8', day_id: 'd3', time: '14:00', text: 'Dinar de pícnic de camí', sort_order: 5, updated_by: null, updated_at: '' },
    { id: 'a9', day_id: 'd3', time: '18:00', text: 'Arribada a Inverness / Loch Ness', sort_order: 6, updated_by: null, updated_at: '' },
    { id: 'a10', day_id: 'd4', time: '09:00', text: 'De camí cap a la Illa de Skye', sort_order: 1, updated_by: null, updated_at: '' },
    { id: 'a11', day_id: 'd4', time: '15:00', text: 'Caminata per la vesprada', sort_order: 2, updated_by: null, updated_at: '' },
    { id: 'a12', day_id: 'd4', time: '20:00', text: 'Sopar i nit a la illa', sort_order: 3, updated_by: null, updated_at: '' },
    { id: 'a13', day_id: 'd5', time: '10:00', text: 'Dia complet a la Illa de Skye', sort_order: 1, updated_by: null, updated_at: '' },
    { id: 'a14', day_id: 'd5', time: '10:00', text: 'Rutes a peu o en cotxe — ja elegim algunes', sort_order: 2, updated_by: null, updated_at: '' },
    { id: 'a15', day_id: 'd6', time: '10:00', text: 'Anem cap a Fort William i voltants', sort_order: 1, updated_by: null, updated_at: '' },
    { id: 'a16', day_id: 'd7', time: '09:00', text: 'Eixida de Fort William cap a Edimburg', sort_order: 1, updated_by: null, updated_at: '' },
    { id: 'a17', day_id: 'd7', time: '11:00', text: 'Parada: Glencoe', sort_order: 2, updated_by: null, updated_at: '' },
    { id: 'a18', day_id: 'd7', time: '14:00', text: 'Parada: Glasgow', sort_order: 3, updated_by: null, updated_at: '' },
    { id: 'a19', day_id: 'd7', time: '19:00', text: 'Sopar a Edimburg i tornar el cotxe', sort_order: 4, updated_by: null, updated_at: '' },
    { id: 'a20', day_id: 'd8', time: '10:00', text: 'Mig dia a Edimburg', sort_order: 1, updated_by: null, updated_at: '' },
    { id: 'a21', day_id: 'd8', time: '12:00', text: 'Esmorzar / dinar a Edimburg', sort_order: 2, updated_by: null, updated_at: '' },
    { id: 'a22', day_id: 'd8', time: '15:00', text: "Cap a l'aeroport", sort_order: 3, updated_by: null, updated_at: '' },
    { id: 'a23', day_id: 'd8', time: '19:00', text: 'Vol de tornada', sort_order: 4, updated_by: null, updated_at: '' },
  ],
  notes: [
    { day_id: 'd1', text: '', updated_by: null, updated_at: '' },
    { day_id: 'd2', text: '', updated_by: null, updated_at: '' },
    { day_id: 'd3', text: '', updated_by: null, updated_at: '' },
    { day_id: 'd4', text: '', updated_by: null, updated_at: '' },
    { day_id: 'd5', text: '', updated_by: null, updated_at: '' },
    { day_id: 'd6', text: '', updated_by: null, updated_at: '' },
    { day_id: 'd7', text: '', updated_by: null, updated_at: '' },
    { day_id: 'd8', text: '', updated_by: null, updated_at: '' },
  ],
  tripInfo: [
    { id: 'i1', trip_id: 'local-trip', key: 'nits_edimburg', value: '2 nits Edimburg (5 i 6 juliol) + 1 nit (11 juliol)', updated_by: null, updated_at: '' },
    { id: 'i2', trip_id: 'local-trip', key: 'nits_inverness', value: '1 nit Inverness (7 juliol)', updated_by: null, updated_at: '' },
    { id: 'i3', trip_id: 'local-trip', key: 'nits_skye', value: '2 nits Illa de Skye (8 i 9 juliol)', updated_by: null, updated_at: '' },
    { id: 'i4', trip_id: 'local-trip', key: 'nits_fort_william', value: '1 nit Fort William (10 juliol)', updated_by: null, updated_at: '' },
    { id: 'i5', trip_id: 'local-trip', key: 'cotxe', value: 'Lloguer cotxe dies 7, 8, 9, 10 i 11 (5 dies total)', updated_by: null, updated_at: '' },
    { id: 'i6', trip_id: 'local-trip', key: 'ruta_cotxe', value: 'Dia 7: Edimburg → Inverness | Dia 8: Inverness → Skye | Dia 10: Skye → Fort William | Dia 11: Fort William → Edimburg', updated_by: null, updated_at: '' },
  ],
  ideas: [
    { id: 'id1', trip_id: 'local-trip', text: 'Old Man of Storr', author: 'Itinerari', votes: [], created_at: '' },
    { id: 'id2', trip_id: 'local-trip', text: 'Fairy Pools', author: 'Itinerari', votes: [], created_at: '' },
    { id: 'id3', trip_id: 'local-trip', text: 'Neist Point', author: 'Itinerari', votes: [], created_at: '' },
    { id: 'id4', trip_id: 'local-trip', text: 'Quiraing', author: 'Itinerari', votes: [], created_at: '' },
  ],
  checklist: [
    { id: 'c1', trip_id: 'local-trip', text: 'Passaport / DNI', done: false, author: null, sort_order: 1, updated_by: null, updated_at: '' },
    { id: 'c2', trip_id: 'local-trip', text: 'Targetes i efectiu (£)', done: false, author: null, sort_order: 2, updated_by: null, updated_at: '' },
    { id: 'c3', trip_id: 'local-trip', text: 'Adaptador enchufe UK', done: false, author: null, sort_order: 3, updated_by: null, updated_at: '' },
    { id: 'c4', trip_id: 'local-trip', text: 'Impermeable i bambes', done: false, author: null, sort_order: 4, updated_by: null, updated_at: '' },
    { id: 'c5', trip_id: 'local-trip', text: 'Reserva cotxe confirmada', done: false, author: null, sort_order: 5, updated_by: null, updated_at: '' },
    { id: 'c6', trip_id: 'local-trip', text: 'Reserves allotjament', done: false, author: null, sort_order: 6, updated_by: null, updated_at: '' },
    { id: 'c7', trip_id: 'local-trip', text: 'Assegurança de viatge', done: false, author: null, sort_order: 7, updated_by: null, updated_at: '' },
  ],
}

type StoreData = typeof SEED

function load(): StoreData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return structuredClone(SEED)
}

function save(data: StoreData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((fn) => fn())
}

export function subscribeLocal(fn: () => void) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export async function fetchLocalTrip(code: string) {
  const data = load()
  if (data.trip.code !== code.toUpperCase()) throw new Error('Codi incorrecte')
  return data
}

export function getLocalDaysWithActivities(data: StoreData): Day[] {
  return data.days.map((day) => ({
    ...day,
    activities: data.activities
      .filter((a) => a.day_id === day.id)
      .sort((a, b) => a.sort_order - b.sort_order),
    note: data.notes.find((n) => n.day_id === day.id),
  }))
}

export async function updateLocalActivity(id: string, updates: Partial<Activity>, user: string) {
  const data = load()
  const act = data.activities.find((a) => a.id === id)
  if (!act) return
  Object.assign(act, updates, { updated_by: user, updated_at: new Date().toISOString() })
  save(data)
  notify()
}

export async function addLocalActivity(dayId: string, text: string, time: string, user: string) {
  const data = load()
  const maxOrder = Math.max(0, ...data.activities.filter((a) => a.day_id === dayId).map((a) => a.sort_order))
  data.activities.push({
    id: crypto.randomUUID(),
    day_id: dayId,
    time,
    text,
    sort_order: maxOrder + 1,
    updated_by: user,
    updated_at: new Date().toISOString(),
  })
  save(data)
  notify()
}

export async function deleteLocalActivity(id: string) {
  const data = load()
  data.activities = data.activities.filter((a) => a.id !== id)
  save(data)
  notify()
}

export async function updateLocalDay(id: string, updates: Partial<Day>, user: string) {
  const data = load()
  const day = data.days.find((d) => d.id === id)
  if (!day) return
  Object.assign(day, updates, { updated_by: user, updated_at: new Date().toISOString() })
  save(data)
  notify()
}

export async function updateLocalNote(dayId: string, text: string, user: string) {
  const data = load()
  const note = data.notes.find((n) => n.day_id === dayId)
  if (note) {
    note.text = text
    note.updated_by = user
    note.updated_at = new Date().toISOString()
  }
  save(data)
  notify()
}

export async function updateLocalTripInfo(id: string, value: string, user: string) {
  const data = load()
  const info = data.tripInfo.find((i) => i.id === id)
  if (!info) return
  info.value = value
  info.updated_by = user
  info.updated_at = new Date().toISOString()
  save(data)
  notify()
}

export async function addLocalIdea(text: string, author: string) {
  const data = load()
  data.ideas.push({
    id: crypto.randomUUID(),
    trip_id: data.trip.id,
    text,
    author,
    votes: [],
    created_at: new Date().toISOString(),
  })
  save(data)
  notify()
}

export async function toggleLocalIdeaVote(id: string, user: string) {
  const data = load()
  const idea = data.ideas.find((i) => i.id === id)
  if (!idea) return
  if (idea.votes.includes(user)) {
    idea.votes = idea.votes.filter((v) => v !== user)
  } else {
    idea.votes = [...idea.votes, user]
  }
  save(data)
  notify()
}

export async function addLocalChecklistItem(text: string, user: string) {
  const data = load()
  const maxOrder = Math.max(0, ...data.checklist.map((c) => c.sort_order))
  data.checklist.push({
    id: crypto.randomUUID(),
    trip_id: data.trip.id,
    text,
    done: false,
    author: user,
    sort_order: maxOrder + 1,
    updated_by: user,
    updated_at: new Date().toISOString(),
  })
  save(data)
  notify()
}

export async function toggleLocalChecklist(id: string, user: string) {
  const data = load()
  const item = data.checklist.find((c) => c.id === id)
  if (!item) return
  item.done = !item.done
  item.updated_by = user
  item.updated_at = new Date().toISOString()
  save(data)
  notify()
}

export async function deleteLocalChecklist(id: string) {
  const data = load()
  data.checklist = data.checklist.filter((c) => c.id !== id)
  save(data)
  notify()
}

export type { StoreData }
