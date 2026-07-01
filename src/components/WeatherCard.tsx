import { useEffect, useState } from 'react'
import { CloudRain, Sun, Thermometer, Wind } from 'lucide-react'
import type { Day } from '../lib/types'

type Weather = {
  code: number
  min: number
  max: number
  rainProbability: number
  rain: number
  wind: number
}

function weatherLabel(code: number) {
  if (code === 0) return { icon: '☀️', label: 'Cel clar' }
  if (code <= 3) return { icon: '⛅', label: 'Núvols' }
  if (code <= 48) return { icon: '🌫️', label: 'Boira' }
  if (code <= 67) return { icon: '🌧️', label: 'Pluja' }
  if (code <= 77) return { icon: '🌨️', label: 'Neu' }
  if (code <= 82) return { icon: '🌦️', label: 'Ruixats' }
  return { icon: '⛈️', label: 'Tempesta' }
}

function advice(weather: Weather) {
  const notes: string[] = []
  if (weather.rainProbability >= 45 || weather.rain >= 2) notes.push('Agafeu impermeable')
  if (weather.wind >= 35) notes.push('Dia ventós')
  if (weather.max <= 14) notes.push('Porteu una capa d’abric')
  if (!notes.length) notes.push('Bon dia per explorar')
  return notes.join(' · ')
}

export function WeatherCard({ day, compact = false }: { day: Day; compact?: boolean }) {
  const [weather, setWeather] = useState<Weather | null>(null)

  useEffect(() => {
    if (day.lat == null || day.lng == null) return
    const cacheKey = `weather_${day.date}_${day.lat}_${day.lng}`
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) ?? '')
      if (Date.now() - cached.savedAt < 60 * 60 * 1000) {
        setWeather(cached.weather)
        return
      }
    } catch { /* fetch a fresh forecast */ }

    const params = new URLSearchParams({
      latitude: String(day.lat),
      longitude: String(day.lng),
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max',
      timezone: 'Europe/London',
      forecast_days: '16',
    })
    fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
      .then((response) => {
        if (!response.ok) throw new Error('Weather unavailable')
        return response.json()
      })
      .then((data) => {
        const index = data.daily?.time?.indexOf(day.date) ?? -1
        if (index < 0) return
        const next: Weather = {
          code: data.daily.weather_code[index],
          min: Math.round(data.daily.temperature_2m_min[index]),
          max: Math.round(data.daily.temperature_2m_max[index]),
          rainProbability: Math.round(data.daily.precipitation_probability_max[index] ?? 0),
          rain: Number(data.daily.precipitation_sum[index] ?? 0),
          wind: Math.round(data.daily.wind_speed_10m_max[index] ?? 0),
        }
        setWeather(next)
        localStorage.setItem(cacheKey, JSON.stringify({ savedAt: Date.now(), weather: next }))
      })
      .catch(() => setWeather(null))
  }, [day.date, day.lat, day.lng])

  if (!weather) return null
  const condition = weatherLabel(weather.code)

  if (compact) {
    return (
      <div className="rounded-2xl bg-sky-50 p-4 text-sky-950 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold">{condition.icon} {condition.label}</p>
          <p className="font-bold">{weather.min}–{weather.max} °C</p>
        </div>
        <p className="mt-1 text-xs text-sky-800">{advice(weather)}</p>
      </div>
    )
  }

  return (
    <section className="rounded-2xl bg-gradient-to-br from-sky-50 to-blue-100 p-4 text-sky-950 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Previsió del dia</p>
          <h3 className="mt-1 text-xl font-bold">{condition.icon} {condition.label}</h3>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black">{weather.max}°</p>
          <p className="text-xs text-sky-700">mín. {weather.min}°</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-xl bg-white/60 p-2"><CloudRain size={16} className="mx-auto mb-1" />{weather.rainProbability}%</div>
        <div className="rounded-xl bg-white/60 p-2"><Wind size={16} className="mx-auto mb-1" />{weather.wind} km/h</div>
        <div className="rounded-xl bg-white/60 p-2"><Thermometer size={16} className="mx-auto mb-1" />{weather.min}–{weather.max}°</div>
      </div>
      <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-sky-900">
        <Sun size={16} /> {advice(weather)}
      </p>
    </section>
  )
}

export function WeatherBadge({ day }: { day: Day }) {
  const [weather, setWeather] = useState<Weather | null>(null)

  useEffect(() => {
    if (day.lat == null || day.lng == null) return
    const cacheKey = `weather_${day.date}_${day.lat}_${day.lng}`
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) ?? '')
      if (Date.now() - cached.savedAt < 60 * 60 * 1000 && cached.weather) {
        setWeather(cached.weather)
        return
      }
    } catch { /* the full card will refresh it when opened */ }

    const params = new URLSearchParams({
      latitude: String(day.lat),
      longitude: String(day.lng),
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max',
      timezone: 'Europe/London',
      forecast_days: '16',
    })
    fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
      .then((response) => response.json())
      .then((data) => {
        const index = data.daily?.time?.indexOf(day.date) ?? -1
        if (index < 0) return
        const next: Weather = {
          code: data.daily.weather_code[index],
          min: Math.round(data.daily.temperature_2m_min[index]),
          max: Math.round(data.daily.temperature_2m_max[index]),
          rainProbability: Math.round(data.daily.precipitation_probability_max[index] ?? 0),
          rain: Number(data.daily.precipitation_sum[index] ?? 0),
          wind: Math.round(data.daily.wind_speed_10m_max[index] ?? 0),
        }
        setWeather(next)
        localStorage.setItem(cacheKey, JSON.stringify({ savedAt: Date.now(), weather: next }))
      })
      .catch(() => setWeather(null))
  }, [day.date, day.lat, day.lng])

  if (!weather) return null
  const condition = weatherLabel(weather.code)

  return (
    <span className="flex items-center gap-1 whitespace-nowrap rounded-full bg-sky-50 px-2 py-1 text-[10px] font-bold text-sky-800">
      <span aria-hidden="true">{condition.icon}</span>
      {weather.min}–{weather.max}°
    </span>
  )
}
