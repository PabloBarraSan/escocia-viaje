import { useState } from 'react'
import { Check, ExternalLink, MapPinned, Plus, ThumbsUp, Utensils, X } from 'lucide-react'
import { useTripContext } from '../context/TripContext'
import { useSession } from '../hooks/useSession'
import type { Day, SuggestionCategory } from '../lib/types'

const CATEGORIES: Array<{ value: SuggestionCategory; label: string; emoji: string }> = [
  { value: 'comer', label: 'Menjar', emoji: '🍽️' },
  { value: 'cenar', label: 'Sopar', emoji: '🌙' },
  { value: 'cafe', label: 'Cafè', emoji: '☕' },
  { value: 'veure', label: 'Veure', emoji: '🏰' },
  { value: 'passeig', label: 'Passeig', emoji: '🥾' },
  { value: 'compra', label: 'Compra', emoji: '🛒' },
  { value: 'parada', label: 'Parada', emoji: '📍' },
]

function mapsSearch(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

export function SuggestionsBoard({ day }: { day: Day }) {
  const {
    suggestions, createSuggestion, voteSuggestion, setSuggestionStatus, addSuggestionToItinerary,
  } = useTripContext()
  const { session } = useSession()
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<SuggestionCategory>('comer')
  const [note, setNote] = useState('')
  const [mapsUrl, setMapsUrl] = useState('')
  const [error, setError] = useState('')

  const items = suggestions
    .filter((item) => item.day_id === day.id && item.status !== 'discarded')
    .sort((a, b) => Number(b.status === 'selected') - Number(a.status === 'selected') || b.votes.length - a.votes.length)

  const save = async () => {
    if (!title.trim() || !session) return
    setError('')
    try {
      await createSuggestion({
        dayId: day.id, title: title.trim(), category, note: note.trim(),
        mapsUrl: mapsUrl.trim(), author: session.name,
      })
      setTitle('')
      setNote('')
      setMapsUrl('')
      setAdding(false)
    } catch {
      setError('Falta executar la migració 003 a Supabase.')
    }
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Suggeriments</h3>
        <a
          href={mapsSearch(`restaurants in ${day.base_city}, Scotland`)}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-xs font-semibold text-highland-700"
        >
          <MapPinned size={14} /> Buscar a Maps
        </a>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <a href={mapsSearch(`restaurants in ${day.base_city}, Scotland`)} target="_blank" rel="noreferrer" className="rounded-xl bg-white p-2 text-center text-xs shadow-sm">
          🍽️ Menjar
        </a>
        <a href={mapsSearch(`things to see in ${day.base_city}, Scotland`)} target="_blank" rel="noreferrer" className="rounded-xl bg-white p-2 text-center text-xs shadow-sm">
          🏰 Què veure
        </a>
        <a href={mapsSearch(`parking in ${day.base_city}, Scotland`)} target="_blank" rel="noreferrer" className="rounded-xl bg-white p-2 text-center text-xs shadow-sm">
          🅿️ Aparcar
        </a>
      </div>

      {items.map((item) => {
        const categoryInfo = CATEGORIES.find((candidate) => candidate.value === item.category)
        const voted = session ? item.votes.includes(session.name) : false
        return (
          <article key={item.id} className={`rounded-2xl border p-4 ${item.status === 'selected' ? 'border-highland-400 bg-highland-50' : 'border-gray-100 bg-white'}`}>
            <div className="flex items-start gap-3">
              <button
                onClick={() => session && voteSuggestion(item.id, session.name)}
                className={`flex min-w-10 flex-col items-center rounded-xl px-2 py-1 ${voted ? 'bg-highland-700 text-white' : 'bg-gray-100 text-gray-500'}`}
              >
                <ThumbsUp size={15} />
                <span className="text-xs font-bold">{item.votes.length}</span>
              </button>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-highland-900">{categoryInfo?.emoji} {item.title}</p>
                {item.note && <p className="mt-1 text-sm text-gray-600">{item.note}</p>}
                <p className="mt-1 text-[10px] text-gray-400">per {item.author}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.maps_url && (
                    <a href={item.maps_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-highland-700">
                      <ExternalLink size={13} /> Maps
                    </a>
                  )}
                  {item.status === 'proposed' ? (
                    <button onClick={() => session && addSuggestionToItinerary(item, session.name)} className="flex items-center gap-1 rounded-lg bg-highland-700 px-2.5 py-1.5 text-xs font-semibold text-white">
                      <Check size={13} /> Afegir al pla
                    </button>
                  ) : (
                    <span className="flex items-center gap-1 rounded-lg bg-highland-100 px-2.5 py-1.5 text-xs font-semibold text-highland-800">
                      <Check size={13} /> Elegit
                    </span>
                  )}
                  <button onClick={() => setSuggestionStatus(item.id, 'discarded')} className="rounded-lg p-1.5 text-gray-400" aria-label="Descartar">
                    <X size={15} />
                  </button>
                </div>
              </div>
            </div>
          </article>
        )
      })}

      {adding ? (
        <div className="space-y-3 rounded-2xl border-2 border-dashed border-highland-200 p-4">
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Nom del lloc" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" autoFocus />
          <select value={category} onChange={(event) => setCategory(event.target.value as SuggestionCategory)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm">
            {CATEGORIES.map((item) => <option key={item.value} value={item.value}>{item.emoji} {item.label}</option>)}
          </select>
          <input value={mapsUrl} onChange={(event) => setMapsUrl(event.target.value)} placeholder="Enllaç de Google Maps (opcional)" type="url" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
          <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Per què val la pena?" rows={2} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
          <div className="flex gap-2">
            <button onClick={save} className="flex items-center gap-1 rounded-xl bg-highland-700 px-4 py-2 text-sm font-semibold text-white"><Utensils size={15} /> Guardar</button>
            <button onClick={() => setAdding(false)} className="rounded-xl bg-gray-200 px-4 py-2 text-sm">Cancel·lar</button>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-highland-200 py-3 text-sm font-medium text-highland-700">
          <Plus size={16} /> Proposar un lloc
        </button>
      )}
    </section>
  )
}
