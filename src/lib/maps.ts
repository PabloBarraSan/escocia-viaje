export type DayRoute = {
  origin?: string
  destination: string
  waypoints?: string[]
  label: string
  travelMode?: 'walking' | 'driving'
}

export type RoutePoint = {
  name: string
  query: string
  lat: number
  lng: number
  time?: string | null
}

const DAY_ROUTES: Record<number, DayRoute> = {
  1: { origin: 'Edinburgh Airport', destination: '5 Drummond Street, Edinburgh', label: 'Aeroport → Edimburg' },
  2: { origin: '5 Drummond Street, Edinburgh', destination: '5 Drummond Street, Edinburgh', label: 'Ruta a peu per Edimburg', travelMode: 'walking' },
  3: { origin: '5 Drummond Street, Edinburgh', destination: 'Inverness, Scotland', label: 'Edimburg → Inverness' },
  4: { origin: 'Inverness, Scotland', destination: 'Broadford Youth Hostel', label: 'Inverness → Illa de Skye' },
  5: { origin: 'Broadford Youth Hostel', destination: 'Broadford Youth Hostel', label: 'Volta per Skye' },
  6: { origin: 'Broadford Youth Hostel', destination: '13 Ross Place, Fort William', label: 'Skye → Fort William' },
  7: { origin: '13 Ross Place, Fort William', destination: '149 Cowgate, Edinburgh', label: 'Fort William → Edimburg' },
  8: { origin: '149 Cowgate, Edinburgh', destination: 'Edinburgh Airport', label: 'Centre → Aeroport' },
}

const LOGISTICS_POINTS: Record<number, RoutePoint[]> = {
  1: [
    { name: 'Aeroport d’Edimburg', query: 'Edinburgh Airport', lat: 55.9508, lng: -3.3615 },
    { name: 'Drummond Street', query: '5 Drummond Street, Edinburgh', lat: 55.9487, lng: -3.1842 },
  ],
  2: [
    { name: 'Drummond Street', query: '5 Drummond Street, Edinburgh', lat: 55.9487, lng: -3.1842 },
    { name: 'Drummond Street', query: '5 Drummond Street, Edinburgh', lat: 55.9487, lng: -3.1842 },
  ],
  3: [
    { name: 'Edimburg', query: '5 Drummond Street, Edinburgh', lat: 55.9487, lng: -3.1842 },
    { name: 'Inverness', query: 'Inverness, Scotland', lat: 57.4778, lng: -4.2247 },
  ],
  4: [
    { name: 'Inverness', query: 'Inverness, Scotland', lat: 57.4778, lng: -4.2247 },
    { name: 'Broadford', query: 'Broadford Youth Hostel', lat: 57.2419, lng: -5.9117 },
  ],
  5: [
    { name: 'Broadford', query: 'Broadford Youth Hostel', lat: 57.2419, lng: -5.9117 },
    { name: 'Broadford', query: 'Broadford Youth Hostel', lat: 57.2419, lng: -5.9117 },
  ],
  6: [
    { name: 'Broadford', query: 'Broadford Youth Hostel', lat: 57.2419, lng: -5.9117 },
    { name: 'Fort William', query: '13 Ross Place, Fort William', lat: 56.8198, lng: -5.1052 },
  ],
  7: [
    { name: 'Fort William', query: '13 Ross Place, Fort William', lat: 56.8198, lng: -5.1052 },
    { name: 'Edimburg', query: '149 Cowgate, Edinburgh', lat: 55.9533, lng: -3.1883 },
  ],
  8: [
    { name: 'Edimburg', query: '149 Cowgate, Edinburgh', lat: 55.9533, lng: -3.1883 },
    { name: 'Aeroport d’Edimburg', query: 'Edinburgh Airport', lat: 55.9508, lng: -3.3615 },
  ],
}

const KNOWN_ACTIVITY_POINTS: { match: RegExp; point: RoutePoint }[] = [
  { match: /kelpies/i, point: { name: 'The Kelpies', query: 'The Kelpies, Falkirk', lat: 56.0194, lng: -3.7548 } },
  { match: /stirling/i, point: { name: 'Stirling Castle', query: 'Stirling Castle', lat: 56.1239, lng: -3.9483 } },
  { match: /\bperth\b/i, point: { name: 'Perth', query: 'Perth, Scotland', lat: 56.3950, lng: -3.4308 } },
  { match: /glencoe/i, point: { name: 'Glencoe', query: 'Glencoe, Scotland', lat: 56.6828, lng: -5.1025 } },
  { match: /eilean donan/i, point: { name: 'Eilean Donan Castle', query: 'Eilean Donan Castle', lat: 57.2740, lng: -5.5160 } },
  { match: /broadford/i, point: { name: 'Broadford', query: 'Broadford Youth Hostel', lat: 57.2419, lng: -5.9117 } },
  { match: /old man of storr|storr/i, point: { name: 'Old Man of Storr', query: 'Old Man of Storr', lat: 57.5073, lng: -6.1831 } },
  { match: /lealt/i, point: { name: 'Lealt Falls', query: 'Lealt Falls Skye', lat: 57.5684, lng: -6.1568 } },
  { match: /kilt rock|mealt/i, point: { name: 'Kilt Rock', query: 'Kilt Rock Skye', lat: 57.6109, lng: -6.1723 } },
  { match: /quiraing/i, point: { name: 'Quiraing', query: 'Quiraing', lat: 57.6433, lng: -6.2653 } },
  { match: /\buig\b/i, point: { name: 'Uig', query: 'Uig Isle of Skye', lat: 57.5864, lng: -6.3573 } },
  { match: /fairy glen/i, point: { name: 'Fairy Glen', query: 'Fairy Glen Skye', lat: 57.5836, lng: -6.3351 } },
  { match: /neist/i, point: { name: 'Neist Point', query: 'Neist Point Lighthouse', lat: 57.4235, lng: -6.7883 } },
  { match: /elgol/i, point: { name: 'Elgol', query: 'Elgol Harbour', lat: 57.1481, lng: -6.1079 } },
  { match: /fairy pools/i, point: { name: 'Fairy Pools', query: 'Fairy Pools Skye', lat: 57.2506, lng: -6.2723 } },
  { match: /carbost/i, point: { name: 'Carbost', query: 'Carbost Isle of Skye', lat: 57.3021, lng: -6.3558 } },
  { match: /talisker/i, point: { name: 'Talisker Distillery', query: 'Talisker Distillery', lat: 57.3027, lng: -6.3568 } },
  { match: /fort william/i, point: { name: 'Fort William', query: '13 Ross Place, Fort William', lat: 56.8198, lng: -5.1052 } },
]

export function dayLogisticsPoints(dayNumber: number) {
  return LOGISTICS_POINTS[dayNumber] ?? []
}

export function knownActivityPoint(text: string) {
  return KNOWN_ACTIVITY_POINTS.find((item) => item.match.test(text))?.point ?? null
}

export function dayRoute(dayNumber: number, stops?: RoutePoint[]) {
  const route = DAY_ROUTES[dayNumber]
  if (!route) return null
  const routeStops = stops?.length ? stops : []
  const origin = routeStops[0]?.query ?? route.origin
  const destination = routeStops.at(-1)?.query ?? route.destination
  const waypoints = routeStops.length > 2
    ? routeStops.slice(1, -1).map((stop) => stop.query)
    : route.waypoints ?? []
  const params = new URLSearchParams({
    api: '1',
    destination,
    travelmode: route.travelMode ?? 'driving',
  })
  if (origin) params.set('origin', origin)
  if (waypoints.length) params.set('waypoints', waypoints.join('|'))
  return {
    url: `https://www.google.com/maps/dir/?${params}`,
    label: route.label,
    travelMode: route.travelMode ?? 'driving',
    stops: [origin, ...waypoints, destination].filter(Boolean) as string[],
  }
}
