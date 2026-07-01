type DayRoute = {
  origin?: string
  destination: string
  waypoints?: string[]
  label: string
}

const DAY_ROUTES: Record<number, DayRoute> = {
  1: {
    destination: '5 Drummond Street, Old Town, Edinburgh, EH8 9TT, United Kingdom',
    label: 'Arribada a l’allotjament',
  },
  2: {
    origin: '5 Drummond Street, Old Town, Edinburgh, EH8 9TT, United Kingdom',
    destination: '5 Drummond Street, Old Town, Edinburgh, EH8 9TT, United Kingdom',
    waypoints: ['Edinburgh Castle', 'Royal Mile Edinburgh', 'Calton Hill Edinburgh'],
    label: 'Ruta a peu per Edimburg',
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

export function dayRoute(dayNumber: number) {
  const route = DAY_ROUTES[dayNumber]
  if (!route) return null
  const params = new URLSearchParams({
    api: '1',
    destination: route.destination,
    travelmode: dayNumber === 2 ? 'walking' : 'driving',
  })
  if (route.origin) params.set('origin', route.origin)
  if (route.waypoints?.length) params.set('waypoints', route.waypoints.join('|'))
  return {
    url: `https://www.google.com/maps/dir/?${params}`,
    label: route.label,
    stops: [route.origin, ...(route.waypoints ?? []), route.destination].filter(Boolean) as string[],
  }
}
