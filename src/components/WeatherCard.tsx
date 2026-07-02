import { useMemo, useState } from 'react'
import { ChevronRight, CloudRain, Droplets, Sun, Thermometer, Wind } from 'lucide-react'
import { useWeather } from '../hooks/useWeather'
import type { Day } from '../lib/types'
import { weatherAdvice, weatherLabel } from '../lib/weather'
import { BottomSheet } from './BottomSheet'

export function WeatherCard({ day, compact = false }: { day: Day; compact?: boolean }) {
  const weather = useWeather(day)
  const [open, setOpen] = useState(false)
  const daytimeHours = useMemo(
    () => weather?.hourly.filter((hour) => {
      const value = Number(hour.time.slice(0, 2))
      return value >= 7 && value <= 22
    }) ?? [],
    [weather],
  )
  if (!weather) return null
  const condition = weatherLabel(weather.code)
  const outdoorHours = daytimeHours.filter((hour) => {
    const value = Number(hour.time.slice(0, 2))
    return value >= 9 && value <= 19
  })
  const driestWindow = [...outdoorHours].sort((a, b) => a.rainProbability - b.rainProbability)[0]
  const feelsValues = daytimeHours.map((hour) => hour.feelsLike)

  if (compact) {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="animate-fade-in flex w-full items-center gap-3 rounded-2xl border border-sky-100 bg-sky-50 px-3 py-3 text-left text-sky-950 shadow-sm transition active:scale-[0.99]"
          title={weatherAdvice(weather)}
          aria-label={`${condition.label}, ${weather.min} a ${weather.max} graus, pluja ${weather.rainProbability} per cent. Veure previsió per hores`}
        >
          <div className="min-w-0 flex flex-1 items-center gap-2">
            <span className="text-2xl" aria-hidden="true">{condition.icon}</span>
            <span className="truncate text-sm font-bold">{condition.label}</span>
          </div>
          <span className="whitespace-nowrap text-sm font-black">{weather.min}–{weather.max}°</span>
          <span className="flex items-center gap-1 whitespace-nowrap text-xs font-bold text-sky-800">
            <CloudRain size={15} /> {weather.rainProbability}%
          </span>
          <ChevronRight size={17} className="shrink-0 text-sky-500" />
        </button>

        <BottomSheet open={open} onClose={() => setOpen(false)} title={`Temps · ${day.base_city}`}>
          <div className="rounded-2xl bg-gradient-to-br from-sky-600 to-blue-700 p-4 text-white shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-sky-100">{day.label}</p>
                <p className="mt-1 text-2xl font-black">{condition.icon} {condition.label}</p>
                <p className="mt-2 text-sm text-sky-100">{weatherAdvice(weather)}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black">{weather.max}°</p>
                <p className="text-xs text-sky-100">mín. {weather.min}°</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-semibold">
              <div className="rounded-xl bg-white/15 p-2"><CloudRain size={16} className="mx-auto mb-1" />{weather.rainProbability}% pluja</div>
              <div className="rounded-xl bg-white/15 p-2"><Droplets size={16} className="mx-auto mb-1" />{weather.rain.toFixed(1)} mm</div>
              <div className="rounded-xl bg-white/15 p-2"><Wind size={16} className="mx-auto mb-1" />{weather.wind} km/h</div>
            </div>
          </div>

          {driestWindow && (
            <div className="mt-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-950">
              <p className="font-bold">
                ✨ {driestWindow.rainProbability < 45 ? 'Millor moment per estar fora' : 'Moment amb menys risc de pluja'}
              </p>
              <p className="mt-0.5 text-xs text-emerald-800">
                Cap a les {driestWindow.time}, amb {driestWindow.rainProbability}% de pluja i {driestWindow.temperature}°.
              </p>
            </div>
          )}

          <div className="mt-5">
            <div className="mb-2 flex items-end justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-highland-950">Previsió per hores</h3>
                <p className="text-xs text-gray-500">De matí fins a la nit</p>
              </div>
              <span className="text-[10px] font-semibold text-gray-400">Desplaça →</span>
            </div>
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2">
              {daytimeHours.map((hour) => {
                const hourlyCondition = weatherLabel(hour.code)
                const wet = hour.rainProbability >= 45
                return (
                  <div key={hour.time} className={`w-[82px] shrink-0 rounded-2xl border p-2.5 text-center ${wet ? 'border-blue-200 bg-blue-50' : 'border-gray-100 bg-white'}`}>
                    <p className="text-xs font-bold text-gray-600">{hour.time}</p>
                    <p className="my-1.5 text-2xl" title={hourlyCondition.label}>{hourlyCondition.icon}</p>
                    <p className="text-lg font-black text-highland-950">{hour.temperature}°</p>
                    <p className={`mt-1 flex items-center justify-center gap-1 text-[10px] font-bold ${wet ? 'text-blue-700' : 'text-gray-400'}`}>
                      <CloudRain size={11} /> {hour.rainProbability}%
                    </p>
                    <p className="mt-1 flex items-center justify-center gap-1 text-[10px] text-gray-500">
                      <Wind size={10} /> {hour.wind}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {feelsValues.length > 0 && (
            <div className="mt-4 rounded-2xl bg-gray-50 p-3">
              <h3 className="text-sm font-bold text-highland-950">Detall útil</h3>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600">
                <p className="flex items-center gap-2"><Thermometer size={15} className="shrink-0 text-orange-500" /> Sensació entre {Math.min(...feelsValues)}° i {Math.max(...feelsValues)}°</p>
                <p className="flex items-center gap-2"><Wind size={15} className="shrink-0 text-sky-600" /> Vent màxim de {weather.wind} km/h</p>
              </div>
            </div>
          )}
          <p className="mt-3 text-center text-[10px] text-gray-400">Dades d’Open-Meteo · actualització cada hora</p>
        </BottomSheet>
      </>
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
