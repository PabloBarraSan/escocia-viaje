export type DayWeather = {
  code: number
  min: number
  max: number
  rainProbability: number
  rain: number
  wind: number
}

export type ForecastByDate = Record<string, DayWeather>

const CACHE_TTL = 60 * 60 * 1000
const pendingFetches = new Map<string, Promise<ForecastByDate>>()

export function coordKey(lat: number, lng: number) {
  return `${lat.toFixed(4)},${lng.toFixed(4)}`
}

export function weatherLabel(code: number) {
  if (code === 0) return { icon: '☀️', label: 'Cel clar' }
  if (code <= 3) return { icon: '⛅', label: 'Núvols' }
  if (code <= 48) return { icon: '🌫️', label: 'Boira' }
  if (code <= 67) return { icon: '🌧️', label: 'Pluja' }
  if (code <= 77) return { icon: '🌨️', label: 'Neu' }
  if (code <= 82) return { icon: '🌦️', label: 'Ruixats' }
  return { icon: '⛈️', label: 'Tempesta' }
}

export function weatherAdvice(weather: DayWeather) {
  const notes: string[] = []
  if (weather.rainProbability >= 45 || weather.rain >= 2) notes.push('Agafeu impermeable')
  if (weather.wind >= 35) notes.push('Dia ventós')
  if (weather.max <= 14) notes.push('Porteu una capa d’abric')
  if (!notes.length) notes.push('Bon dia per explorar')
  return notes.join(' · ')
}

function parseForecast(data: {
  daily?: {
    time?: string[]
    weather_code?: number[]
    temperature_2m_min?: number[]
    temperature_2m_max?: number[]
    precipitation_probability_max?: number[]
    precipitation_sum?: number[]
    wind_speed_10m_max?: number[]
  }
}): ForecastByDate {
  const forecast: ForecastByDate = {}
  const times = data.daily?.time ?? []
  times.forEach((date, index) => {
    forecast[date] = {
      code: data.daily!.weather_code![index],
      min: Math.round(data.daily!.temperature_2m_min![index]),
      max: Math.round(data.daily!.temperature_2m_max![index]),
      rainProbability: Math.round(data.daily!.precipitation_probability_max?.[index] ?? 0),
      rain: Number(data.daily!.precipitation_sum?.[index] ?? 0),
      wind: Math.round(data.daily!.wind_speed_10m_max?.[index] ?? 0),
    }
  })
  return forecast
}

export async function fetchForecast(lat: number, lng: number): Promise<ForecastByDate> {
  const key = coordKey(lat, lng)
  const cacheKey = `weather_forecast_${key}`

  try {
    const cached = JSON.parse(localStorage.getItem(cacheKey) ?? '')
    if (Date.now() - cached.savedAt < CACHE_TTL && cached.forecast) {
      return cached.forecast as ForecastByDate
    }
  } catch { /* refresh */ }

  const inflight = pendingFetches.get(key)
  if (inflight) return inflight

  const promise = (async () => {
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lng),
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max',
      timezone: 'Europe/London',
      forecast_days: '16',
    })
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
    if (!response.ok) throw new Error('Weather unavailable')
    const data = await response.json()
    const forecast = parseForecast(data)
    localStorage.setItem(cacheKey, JSON.stringify({ savedAt: Date.now(), forecast }))
    return forecast
  })().finally(() => pendingFetches.delete(key))

  pendingFetches.set(key, promise)
  return promise
}
