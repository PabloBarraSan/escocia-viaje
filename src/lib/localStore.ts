import type { Trip, Day, Activity, DayNote, DayMessage, TripInfo, Idea, ChecklistItem } from './types'
import { sortActivities, sortOrderForNewActivity } from './activities'
import { TRIP_CODE } from './types'

const STORAGE_KEY = 'escocia_local_data'

const SEED: {
  trip: Trip
  days: Day[]
  activities: Activity[]
  notes: DayNote[]
  messages: DayMessage[]
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
    { id: 'a1', day_id: 'd1', time: '12:00', text: 'Arribada a Edimburg a migdia', place_name: null, place_address: null, description: '', kind: 'plan', votes: [], maps_url: null, duration_minutes: 90, sort_order: 1, updated_by: null, updated_at: '' },
    { id: 'a2', day_id: 'd1', time: '20:00', text: "Sopar prompte en un pub d'Edimburg", place_name: null, place_address: null, description: '', kind: 'plan', votes: [], maps_url: null, duration_minutes: 90, sort_order: 2, updated_by: null, updated_at: '' },
    { id: 'a3', day_id: 'd2', time: '10:00', text: "Visitar els llocs d'Edimburg", description: '', place_name: null, place_address: null, kind: 'plan', votes: [], maps_url: null, duration_minutes: 480, sort_order: 1, updated_by: null, updated_at: '' },
    { id: 'a4', day_id: 'd3', time: '09:00', text: 'Agafem el cotxe cap amunt', description: '', place_name: null, place_address: null, kind: 'plan', votes: [], maps_url: null, duration_minutes: 60, sort_order: 1, updated_by: null, updated_at: '' },
    { id: 'a5', day_id: 'd3', time: '10:30', text: 'Parada: The Kelpies, Falkirk', description: '', place_name: null, place_address: null, kind: 'plan', votes: [], maps_url: null, duration_minutes: 45, sort_order: 2, updated_by: null, updated_at: '' },
    { id: 'a6', day_id: 'd3', time: '12:00', text: 'Parada: Stirling Castle', description: '', place_name: null, place_address: null, kind: 'plan', votes: [], maps_url: null, duration_minutes: 90, sort_order: 3, updated_by: null, updated_at: '' },
    { id: 'a7', day_id: 'd3', time: '13:30', text: 'Parada: Perth', description: '', place_name: null, place_address: null, kind: 'plan', votes: [], maps_url: null, duration_minutes: 30, sort_order: 4, updated_by: null, updated_at: '' },
    { id: 'a8', day_id: 'd3', time: '14:00', text: 'Dinar de pícnic de camí', description: '', place_name: null, place_address: null, kind: 'plan', votes: [], maps_url: null, duration_minutes: 60, sort_order: 5, updated_by: null, updated_at: '' },
    { id: 'a9', day_id: 'd3', time: '18:00', text: 'Arribada a Inverness / Loch Ness', description: '', place_name: null, place_address: null, kind: 'plan', votes: [], maps_url: null, duration_minutes: 60, sort_order: 6, updated_by: null, updated_at: '' },
    { id: 'a10', day_id: 'd4', time: '09:00', text: 'De camí cap a la Illa de Skye', description: '', place_name: null, place_address: null, kind: 'plan', votes: [], maps_url: null, duration_minutes: 180, sort_order: 1, updated_by: null, updated_at: '' },
    { id: 'a11', day_id: 'd4', time: '15:00', text: 'Caminata per la vesprada', description: '', place_name: null, place_address: null, kind: 'plan', votes: [], maps_url: null, duration_minutes: 120, sort_order: 2, updated_by: null, updated_at: '' },
    { id: 'a12', day_id: 'd4', time: '20:00', text: 'Sopar i nit a la illa', description: '', place_name: null, place_address: null, kind: 'plan', votes: [], maps_url: null, duration_minutes: 90, sort_order: 3, updated_by: null, updated_at: '' },
    { id: 'a13', day_id: 'd5', time: '10:00', text: 'Dia complet a la Illa de Skye', description: '', place_name: null, place_address: null, kind: 'plan', votes: [], maps_url: null, duration_minutes: 480, sort_order: 1, updated_by: null, updated_at: '' },
    { id: 'a14', day_id: 'd5', time: '10:00', text: 'Rutes a peu o en cotxe — ja elegim algunes', description: '', place_name: null, place_address: null, kind: 'plan', votes: [], maps_url: null, duration_minutes: null, sort_order: 2, updated_by: null, updated_at: '' },
    { id: 'a15', day_id: 'd6', time: '10:00', text: 'Anem cap a Fort William i voltants', description: '', place_name: null, place_address: null, kind: 'plan', votes: [], maps_url: null, duration_minutes: 480, sort_order: 1, updated_by: null, updated_at: '' },
    { id: 'a16', day_id: 'd7', time: '09:00', text: 'Eixida de Fort William cap a Edimburg', description: '', place_name: null, place_address: null, kind: 'plan', votes: [], maps_url: null, duration_minutes: 90, sort_order: 1, updated_by: null, updated_at: '' },
    { id: 'a17', day_id: 'd7', time: '11:00', text: 'Parada: Glencoe', description: '', place_name: null, place_address: null, kind: 'plan', votes: [], maps_url: null, duration_minutes: 90, sort_order: 2, updated_by: null, updated_at: '' },
    { id: 'a18', day_id: 'd7', time: '14:00', text: 'Parada: Glasgow', description: '', place_name: null, place_address: null, kind: 'plan', votes: [], maps_url: null, duration_minutes: 120, sort_order: 3, updated_by: null, updated_at: '' },
    { id: 'a19', day_id: 'd7', time: '19:00', text: 'Sopar a Edimburg i tornar el cotxe', description: '', place_name: null, place_address: null, kind: 'plan', votes: [], maps_url: null, duration_minutes: 90, sort_order: 4, updated_by: null, updated_at: '' },
    { id: 'a20', day_id: 'd8', time: '10:00', text: 'Mig dia a Edimburg', description: '', place_name: null, place_address: null, kind: 'plan', votes: [], maps_url: null, duration_minutes: 120, sort_order: 1, updated_by: null, updated_at: '' },
    { id: 'a21', day_id: 'd8', time: '12:00', text: 'Esmorzar / dinar a Edimburg', description: '', place_name: null, place_address: null, kind: 'plan', votes: [], maps_url: null, duration_minutes: 90, sort_order: 2, updated_by: null, updated_at: '' },
    { id: 'a22', day_id: 'd8', time: '15:00', text: "Cap a l'aeroport", description: '', place_name: null, place_address: null, kind: 'plan', votes: [], maps_url: null, duration_minutes: 60, sort_order: 3, updated_by: null, updated_at: '' },
    { id: 'a23', day_id: 'd8', time: '19:00', text: 'Vol de tornada', description: '', place_name: null, place_address: null, kind: 'plan', votes: [], maps_url: null, duration_minutes: 120, sort_order: 4, updated_by: null, updated_at: '' },
    // Idees de Pablo (valencià)
    { id: 'a24', day_id: 'd1', time: null, text: 'Passeig pel Grassmarket i Victoria Street', place_name: 'Grassmarket', place_address: 'Grassmarket, Edinburgh', description: 'A prop del Old Town, molt xulo per fer fotos sense planificar res', kind: 'idea', votes: [], maps_url: null, duration_minutes: 60, sort_order: 51, updated_by: 'Pablo', updated_at: '' },
    { id: 'a25', day_id: 'd1', time: null, text: 'Sopar al The Bow Bar', place_name: 'The Bow Bar', place_address: '6 Victoria Street, Edinburgh', description: 'Pub amb menjar bo al Old Town, alternativa al sopar genèric', kind: 'idea', votes: [], maps_url: null, duration_minutes: 90, sort_order: 52, updated_by: 'Pablo', updated_at: '' },
    { id: 'a26', day_id: 'd2', time: null, text: "Museu Nacional d'Escòcia", place_name: 'National Museum of Scotland', place_address: 'Chambers Street, Edinburgh', description: 'Entrada de franc i perfecte si plou', kind: 'idea', votes: [], maps_url: null, duration_minutes: 120, sort_order: 51, updated_by: 'Pablo', updated_at: '' },
    { id: 'a27', day_id: 'd2', time: null, text: 'Dinar a Oink', place_name: 'Oink', place_address: '34 Victoria Street, Edinburgh', description: 'Entrepans de porc rostit al Royal Mile, ràpid i barat', kind: 'idea', votes: [], maps_url: null, duration_minutes: 45, sort_order: 52, updated_by: 'Pablo', updated_at: '' },
    { id: 'a28', day_id: 'd3', time: null, text: 'Cafeteria dins del castell de Stirling', place_name: 'Stirling Castle', place_address: 'Castle Esplanade, Stirling', description: 'Alternativa al dinar de pícnic si volem algo calent', kind: 'idea', votes: [], maps_url: null, duration_minutes: 45, sort_order: 51, updated_by: 'Pablo', updated_at: '' },
    { id: 'a29', day_id: 'd3', time: null, text: "Sopar a Fiddler's Highland Restaurant", place_name: "Fiddler's Highland Restaurant", place_address: 'Castle Street, Inverness', description: "Cuina escocesa al centre d'Inverness, bona opció per la nit", kind: 'idea', votes: [], maps_url: null, duration_minutes: 90, sort_order: 52, updated_by: 'Pablo', updated_at: '' },
    { id: 'a30', day_id: 'd4', time: null, text: 'Parada al Eilean Donan Castle', place_name: 'Eilean Donan Castle', place_address: 'Dornie, Kyle of Lochalsh', description: "Parada fotogènica clàssica de camí a l'illa", kind: 'idea', votes: [], maps_url: null, duration_minutes: 45, sort_order: 51, updated_by: 'Pablo', updated_at: '' },
    { id: 'a31', day_id: 'd4', time: null, text: 'Sopar a The Clay Oven', place_name: 'The Clay Oven', place_address: 'The Old Post Office, Broadford', description: "Indi al Broadford, a prop de l'allotjament", kind: 'idea', votes: [], maps_url: null, duration_minutes: 90, sort_order: 52, updated_by: 'Pablo', updated_at: '' },
    { id: 'a32', day_id: 'd5', time: null, text: 'Dinar a Café Arriba', place_name: 'Café Arriba', place_address: 'Bank Street, Portree', description: 'Menjar amb vistes al port de Portree', kind: 'idea', votes: [], maps_url: null, duration_minutes: 60, sort_order: 51, updated_by: 'Pablo', updated_at: '' },
    { id: 'a33', day_id: 'd5', time: null, text: 'Neist Point al cap de vesprada', place_name: 'Neist Point Lighthouse', place_address: 'Glendale, Isle of Skye', description: 'Far i posta de sol si el temps acompanya', kind: 'idea', votes: [], maps_url: null, duration_minutes: 90, sort_order: 52, updated_by: 'Pablo', updated_at: '' },
    { id: 'a34', day_id: 'd6', time: null, text: 'Caminata fins a Steall Falls', place_name: 'Steall Falls', place_address: 'Glen Nevis, Fort William', description: 'Ruta a peu preciosa, uns 90 min anada i tornada', kind: 'idea', votes: [], maps_url: null, duration_minutes: 120, sort_order: 51, updated_by: 'Pablo', updated_at: '' },
    { id: 'a35', day_id: 'd6', time: null, text: 'Sopar a Crannog Seafood Restaurant', place_name: 'Crannog Seafood Restaurant', place_address: 'Town Pier, Fort William', description: 'Marisc al moll, reserva recomanada', kind: 'idea', votes: [], maps_url: null, duration_minutes: 90, sort_order: 52, updated_by: 'Pablo', updated_at: '' },
    { id: 'a36', day_id: 'd7', time: null, text: 'Dinar a Clachaig Inn', place_name: 'Clachaig Inn', place_address: 'Glencoe, Ballachulish', description: 'Pub mític de Glencoe amb vistes a les muntanyes', kind: 'idea', votes: [], maps_url: null, duration_minutes: 75, sort_order: 51, updated_by: 'Pablo', updated_at: '' },
    { id: 'a37', day_id: 'd7', time: null, text: 'Visita ràpida al Kelvingrove Museum', place_name: 'Kelvingrove Art Gallery and Museum', place_address: 'Argyle Street, Glasgow', description: "Si tenim una hora a Glasgow, mereix la pena i és de franc", kind: 'idea', votes: [], maps_url: null, duration_minutes: 60, sort_order: 52, updated_by: 'Pablo', updated_at: '' },
    { id: 'a38', day_id: 'd8', time: null, text: 'Brunch a Loudons Café', place_name: 'Loudons Café', place_address: '94b Fountainbridge, Edinburgh', description: "Esmorzar de fi de viatge abans de l'aeroport", kind: 'idea', votes: [], maps_url: null, duration_minutes: 75, sort_order: 51, updated_by: 'Pablo', updated_at: '' },
    { id: 'a39', day_id: 'd8', time: null, text: 'Darrer passeig per Stockbridge', place_name: 'Stockbridge', place_address: 'Stockbridge, Edinburgh', description: 'Barri tranquil per acabar el viatge sense presses', kind: 'idea', votes: [], maps_url: null, duration_minutes: 60, sort_order: 52, updated_by: 'Pablo', updated_at: '' },
  ],
  messages: [],
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

function normalize(data: Partial<StoreData> & Pick<StoreData, 'trip' | 'days' | 'activities' | 'notes' | 'tripInfo' | 'ideas' | 'checklist'>): StoreData {
  return {
    ...data,
    messages: data.messages ?? [],
    activities: data.activities.map((activity) => ({
      ...activity,
      kind: activity.kind === 'idea' ? 'idea' : 'plan',
      votes: Array.isArray(activity.votes) ? activity.votes : [],
      place_name: activity.place_name ?? null,
      place_address: activity.place_address ?? null,
      duration_minutes: activity.duration_minutes ?? null,
      description: activity.description ?? '',
      maps_url: activity.maps_url ?? null,
    })),
  } as StoreData
}

function load(): StoreData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return normalize(JSON.parse(raw))
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
    activities: sortActivities(data.activities.filter((a) => a.day_id === day.id)),
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

export async function addLocalActivity(
  dayId: string,
  text: string,
  time: string,
  user: string,
  durationMinutes: number | null = null,
  description = '',
  mapsUrl: string | null = null,
  placeName: string | null = null,
  placeAddress: string | null = null,
  kind: import('./types').ActivityKind = 'plan',
) {
  const data = load()
  const dayActivities = data.activities.filter((a) => a.day_id === dayId)
  const sort_order = sortOrderForNewActivity(dayActivities, time || null)
  data.activities.push({
    id: crypto.randomUUID(),
    day_id: dayId,
    time,
    text,
    kind,
    votes: [],
    place_name: placeName,
    place_address: placeAddress,
    description,
    maps_url: mapsUrl,
    duration_minutes: durationMinutes,
    sort_order,
    updated_by: user,
    updated_at: new Date().toISOString(),
  })
  save(data)
  notify()
}

export async function addLocalDayMessage(dayId: string, text: string, author: string) {
  const data = load()
  data.messages.push({
    id: crypto.randomUUID(),
    day_id: dayId,
    author,
    text: text.trim(),
    created_at: new Date().toISOString(),
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
