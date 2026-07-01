import { useEffect, useId, useRef, useState } from 'react'
import { MapPinned } from 'lucide-react'
import {
  fetchPlaceDetails,
  isGooglePlacesConfigured,
  searchPlaces,
  type PlaceOption,
} from '../lib/googlePlaces'

type Props = {
  value: string
  mapsUrl: string
  location: { lat: number; lng: number }
  onChange: (title: string, mapsUrl: string, address?: string) => void
  placeholder?: string
}

export function PlaceAutocomplete({
  value,
  mapsUrl,
  location,
  onChange,
  placeholder = 'Cerca un lloc a Google Maps',
}: Props) {
  const listId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState(value)
  const [options, setOptions] = useState<PlaceOption[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [manualMapsUrl, setManualMapsUrl] = useState(false)

  useEffect(() => {
    setQuery(value)
  }, [value])

  useEffect(() => {
    if (!isGooglePlacesConfigured || !open) return

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      if (query.trim().length < 2) {
        setOptions([])
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const results = await searchPlaces(query, location, controller.signal)
        setOptions(results)
      } catch {
        if (!controller.signal.aborted) setOptions([])
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, 280)

    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [query, location, open])

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const selectOption = async (option: PlaceOption) => {
    setOpen(false)
    setQuery(option.label)
    setLoading(true)
    const details = await fetchPlaceDetails(option.placeId)
    setLoading(false)
    if (details) {
      onChange(details.title, details.mapsUrl, details.address)
      setQuery(details.title)
      return
    }
    onChange(option.label, mapsSearchUrl(option.label, option.secondary), option.secondary)
    setQuery(option.label)
  }

  if (!isGooglePlacesConfigured) {
    return (
      <div className="space-y-2">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value, mapsUrl)}
          placeholder="Nom del lloc"
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
        />
        <input
          value={mapsUrl}
          onChange={(event) => onChange(value, event.target.value)}
          placeholder="Enllaç de Google Maps (opcional)"
          type="url"
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
        />
      </div>
    )
  }

  return (
    <div ref={containerRef} className="space-y-2">
      <div className="relative">
        <MapPinned size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-highland-600" />
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            onChange(event.target.value, mapsUrl)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          aria-expanded={open && options.length > 0}
          aria-controls={listId}
          className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm"
          autoComplete="off"
        />
        {open && (loading || options.length > 0) && query.trim().length >= 2 && (
          <ul
            id={listId}
            className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
          >
            {loading && options.length === 0 && (
              <li className="px-3 py-2 text-xs text-gray-500">Cercant...</li>
            )}
            {options.map((option) => (
              <li key={option.placeId}>
                <button
                  type="button"
                  onClick={() => selectOption(option)}
                  className="w-full px-3 py-2 text-left hover:bg-highland-50"
                >
                  <p className="text-sm font-medium text-highland-900">{option.label}</p>
                  {option.secondary && (
                    <p className="text-xs text-gray-500">{option.secondary}</p>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {mapsUrl && !manualMapsUrl && (
        <p className="text-xs text-gray-500">
          Enllaç Maps afegit automàticament ·{' '}
          <button type="button" onClick={() => setManualMapsUrl(true)} className="font-semibold text-highland-700">
            editar
          </button>
        </p>
      )}

      {(manualMapsUrl || (!mapsUrl && value.trim())) && (
        <input
          value={mapsUrl}
          onChange={(event) => onChange(value, event.target.value)}
          placeholder="Enllaç de Google Maps (opcional)"
          type="url"
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
        />
      )}
    </div>
  )
}

function mapsSearchUrl(title: string, secondary: string) {
  const query = secondary ? `${title}, ${secondary}` : title
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}
