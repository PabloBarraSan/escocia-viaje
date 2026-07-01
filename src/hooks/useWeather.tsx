import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { useTripContext } from '../context/TripContext'
import type { Day } from '../lib/types'
import { coordKey, fetchForecast, type DayWeather, type ForecastByDate } from '../lib/weather'

type WeatherContextType = {
  getWeather: (day: Day) => DayWeather | null
  loading: boolean
}

const WeatherContext = createContext<WeatherContextType | null>(null)

export function WeatherProvider({ children }: { children: ReactNode }) {
  const { days } = useTripContext()
  const [forecasts, setForecasts] = useState<Record<string, ForecastByDate>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const coords = new Map<string, { lat: number; lng: number }>()
    for (const day of days) {
      if (day.lat != null && day.lng != null) {
        const key = coordKey(day.lat, day.lng)
        coords.set(key, { lat: day.lat, lng: day.lng })
      }
    }
    if (!coords.size) return

    let cancelled = false
    setLoading(true)
    Promise.all(
      [...coords.entries()].map(async ([key, { lat, lng }]) => {
        const forecast = await fetchForecast(lat, lng)
        return [key, forecast] as const
      }),
    )
      .then((entries) => {
        if (cancelled) return
        setForecasts(Object.fromEntries(entries))
      })
      .catch(() => { /* components handle missing data */ })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [days])

  const getWeather = useCallback((day: Day): DayWeather | null => {
    if (day.lat == null || day.lng == null) return null
    return forecasts[coordKey(day.lat, day.lng)]?.[day.date] ?? null
  }, [forecasts])

  return (
    <WeatherContext.Provider value={{ getWeather, loading }}>
      {children}
    </WeatherContext.Provider>
  )
}

export function useWeather(day: Day) {
  const ctx = useContext(WeatherContext)
  if (!ctx) throw new Error('useWeather must be used within WeatherProvider')
  return ctx.getWeather(day)
}
