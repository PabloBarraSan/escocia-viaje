export type Flight = {
  dayNumber: number
  date: string
  time: string
  number: string
  origin: string
  destination: string
  direction: 'anada' | 'tornada'
}

export const FLIGHTS: Flight[] = [
  {
    dayNumber: 1,
    date: '2026-07-05',
    time: '10:50',
    number: 'FR5578',
    origin: 'Alacant',
    destination: 'Edimburg',
    direction: 'anada',
  },
  {
    dayNumber: 8,
    date: '2026-07-12',
    time: '19:35',
    number: 'EJU5554',
    origin: 'Edimburg',
    destination: 'Alacant',
    direction: 'tornada',
  },
]
