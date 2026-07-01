import { CloudRain, Sun, Thermometer, Wind } from 'lucide-react'
import { useWeather } from '../hooks/useWeather'
import type { Day } from '../lib/types'
import { weatherAdvice, weatherLabel } from '../lib/weather'

export function WeatherCard({ day, compact = false }: { day: Day; compact?: boolean }) {
  const weather = useWeather(day)

  if (!weather) return null
  const condition = weatherLabel(weather.code)

  if (compact) {
    return (
      <div className="animate-fade-in rounded-2xl bg-sky-50 p-4 text-sky-950 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold">{condition.icon} {condition.label}</p>
          <p className="font-bold">{weather.min}–{weather.max} °C</p>
        </div>
        <p className="mt-1 text-xs text-sky-800">{weatherAdvice(weather)}</p>
      </div>
    )
  }

  return (
    <section className="animate-fade-in rounded-2xl bg-gradient-to-br from-sky-50 to-blue-100 p-4 text-sky-950 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Previsió del dia</p>
          <h3 className="mt-1 font-display text-xl font-bold">{condition.icon} {condition.label}</h3>
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
        <Sun size={16} /> {weatherAdvice(weather)}
      </p>
    </section>
  )
}

export function WeatherBadge({ day }: { day: Day }) {
  const weather = useWeather(day)

  if (!weather) return null
  const condition = weatherLabel(weather.code)

  return (
    <span className="flex items-center gap-1 whitespace-nowrap rounded-full bg-sky-50 px-2 py-1 text-[10px] font-bold text-sky-800">
      <span aria-hidden="true">{condition.icon}</span>
      {weather.min}–{weather.max}°
    </span>
  )
}
