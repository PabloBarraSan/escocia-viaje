import { createContext, useContext, type ReactNode } from 'react'
import { useTrip } from '../hooks/useTrip'
import type { Trip, Day, TripInfo, Idea, ChecklistItem } from '../lib/types'

type TripContextType = ReturnType<typeof useTrip>

const TripContext = createContext<TripContextType | null>(null)

export function TripProvider({ code, children }: { code: string; children: ReactNode }) {
  const trip = useTrip(code)
  return <TripContext.Provider value={trip}>{children}</TripContext.Provider>
}

export function useTripContext() {
  const ctx = useContext(TripContext)
  if (!ctx) throw new Error('useTripContext must be used within TripProvider')
  return ctx
}

export type { Trip, Day, TripInfo, Idea, ChecklistItem }
