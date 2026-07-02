export type DayRoute = {
  origin?: string
  destination: string
  waypoints?: string[]
  label: string
  travelMode?: 'walking' | 'driving'
}

const DAY_ROUTES: Record<number, DayRoute> = {
  1: {
    origin: 'Edinburgh Airport',
    destination: '5 Drummond Street, Old Town, Edinburgh, EH8 9TT, United Kingdom',
    label: 'Arribada a l’allotjament',
  },
  2: {
    origin: '5 Drummond Street, Old Town, Edinburgh, EH8 9TT, United Kingdom',
    destination: '5 Drummond Street, Old Town, Edinburgh, EH8 9TT, United Kingdom',
    waypoints: ['Edinburgh Castle', 'Royal Mile Edinburgh', 'Calton Hill Edinburgh'],
    label: 'Ruta a peu per Edimburg',
    travelMode: 'walking',
  },
  3: {
    origin: '5 Drummond Street, Old Town, Edinburgh, EH8 9TT, United Kingdom',
    destination: 'Inverness, Scotland',
    waypoints: ['The Kelpies, Falkirk', 'Stirling Castle', 'Perth, Scotland'],
    label: 'Edimburg → Inverness',
  },
  4: {
    origin: 'Inverness, Scotland',
    destination: 'Broadford Youth Hostel, Broadford, IV49 9AA, United Kingdom',
    label: 'Inverness → Illa de Skye',
  },
  5: {
    origin: 'Broadford Youth Hostel, Broadford, IV49 9AA, United Kingdom',
    destination: 'Broadford Youth Hostel, Broadford, IV49 9AA, United Kingdom',
    waypoints: ['Old Man of Storr', 'Quiraing Isle of Skye', 'Fairy Pools Isle of Skye'],
    label: 'Volta per Skye',
  },
  6: {
    origin: 'Broadford Youth Hostel, Broadford, IV49 9AA, United Kingdom',
    destination: '13 Ross Place, Fort William, PH33 6JZ, United Kingdom',
    label: 'Skye → Fort William',
  },
  7: {
    origin: '13 Ross Place, Fort William, PH33 6JZ, United Kingdom',
    destination: '149 Cowgate, Old Town, Edinburgh, EH1 1JT, United Kingdom',
    waypoints: ['Glencoe, Scotland', 'Glasgow, Scotland'],
    label: 'Fort William → Edimburg',
  },
  8: {
    origin: '149 Cowgate, Old Town, Edinburgh, EH1 1JT, United Kingdom',
    destination: 'Edinburgh Airport',
    label: 'Centre → Aeroport',
  },
}

const ROUTE_POINTS: Record<number, { name: string; lat: number; lng: number }[]> = {
  1: [
    { name: 'Aeroport d’Edimburg', lat: 55.9508, lng: -3.3615 },
    { name: 'Drummond Street', lat: 55.9487, lng: -3.1842 },
  ],
  2: [
    { name: 'Drummond Street', lat: 55.9487, lng: -3.1842 },
    { name: 'Edinburgh Castle', lat: 55.9486, lng: -3.1999 },
    { name: 'Royal Mile', lat: 55.9502, lng: -3.1878 },
    { name: 'Calton Hill', lat: 55.9550, lng: -3.1827 },
  ],
  3: [
    { name: 'Edimburg', lat: 55.9533, lng: -3.1883 },
    { name: 'The Kelpies', lat: 56.0194, lng: -3.7548 },
    { name: 'Stirling Castle', lat: 56.1239, lng: -3.9483 },
    { name: 'Perth', lat: 56.3950, lng: -3.4308 },
    { name: 'Inverness', lat: 57.4778, lng: -4.2247 },
  ],
  4: [
    { name: 'Inverness', lat: 57.4778, lng: -4.2247 },
    { name: 'Broadford', lat: 57.2419, lng: -5.9117 },
  ],
  5: [
    { name: 'Broadford', lat: 57.2419, lng: -5.9117 },
    { name: 'Old Man of Storr', lat: 57.5069, lng: -6.1833 },
    { name: 'Quiraing', lat: 57.6436, lng: -6.2650 },
    { name: 'Fairy Pools', lat: 57.2504, lng: -6.2727 },
  ],
  6: [
    { name: 'Broadford', lat: 57.2419, lng: -5.9117 },
    { name: 'Fort William', lat: 56.8198, lng: -5.1052 },
  ],
  7: [
    { name: 'Fort William', lat: 56.8198, lng: -5.1052 },
    { name: 'Glencoe', lat: 56.6828, lng: -5.1025 },
    { name: 'Glasgow', lat: 55.8642, lng: -4.2518 },
    { name: 'Edimburg', lat: 55.9533, lng: -3.1883 },
  ],
  8: [
    { name: 'Edimburg', lat: 55.9533, lng: -3.1883 },
    { name: 'Aeroport d’Edimburg', lat: 55.9508, lng: -3.3615 },
  ],
}

export function dayRoutePoints(dayNumber: number) {
  return ROUTE_POINTS[dayNumber] ?? []
}

export function dayRoute(dayNumber: number) {
  const route = DAY_ROUTES[dayNumber]
  if (!route) return null
  const params = new URLSearchParams({
    api: '1',
    destination: route.destination,
    travelmode: route.travelMode ?? 'driving',
  })
  if (route.origin) params.set('origin', route.origin)
  if (route.waypoints?.length) params.set('waypoints', route.waypoints.join('|'))
  return {
    url: `https://www.google.com/maps/dir/?${params}`,
    label: route.label,
    travelMode: route.travelMode ?? 'driving',
    stops: [route.origin, ...(route.waypoints ?? []), route.destination].filter(Boolean) as string[],
  }
}
