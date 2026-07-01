import { useState } from 'react'
import { Mountain, ThumbsUp, Plus } from 'lucide-react'
import { useTripContext } from '../context/TripContext'
import { useSession } from '../hooks/useSession'

export function IdeasBoard() {
  const { ideas, createIdea, voteIdea } = useTripContext()
  const { session } = useSession()
  const [newIdea, setNewIdea] = useState('')
  const [adding, setAdding] = useState(false)
  const [poppedId, setPoppedId] = useState<string | null>(null)

  const sorted = [...ideas].sort((a, b) => b.votes.length - a.votes.length)

  const handleAdd = async () => {
    if (!newIdea.trim()) return
    await createIdea(newIdea.trim(), session!.name)
    setNewIdea('')
    setAdding(false)
  }

  const handleVote = async (id: string) => {
    await voteIdea(id, session!.name)
    setPoppedId(id)
    window.setTimeout(() => setPoppedId(null), 300)
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-highland-50 shadow-sm">
      <div className="border-b border-emerald-100 bg-white/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <Mountain size={18} className="text-emerald-700" />
          <h3 className="font-display text-base font-bold text-highland-900">Idees per a Skye</h3>
        </div>
        <p className="mt-0.5 text-xs text-gray-500">Vota els llocs que més t’agraden</p>
      </div>

      <div className="space-y-2 p-4">
        {sorted.map((idea) => {
          const voted = idea.votes.includes(session!.name)
          return (
            <div
              key={idea.id}
              className="flex items-center gap-3 rounded-xl border border-white/80 bg-white p-3 shadow-sm transition hover:shadow-md"
            >
              <button
                type="button"
                onClick={() => handleVote(idea.id)}
                className={`flex min-w-10 flex-col items-center rounded-xl px-2 py-1 transition ${
                  voted ? 'bg-highland-700 text-white' : 'bg-gray-100 text-gray-500 hover:bg-highland-50'
                } ${poppedId === idea.id ? 'animate-vote-pop' : ''}`}
              >
                <ThumbsUp size={15} />
                <span className="text-xs font-bold">{idea.votes.length}</span>
              </button>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-highland-900">{idea.text}</p>
                <p className="text-[10px] text-gray-400">per {idea.author}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="border-t border-emerald-100 p-4 pt-0">
        {adding ? (
          <div className="space-y-2">
            <input
              value={newIdea}
              onChange={(e) => setNewIdea(e.target.value)}
              placeholder="Proposa una ruta o lloc..."
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <div className="flex gap-2">
              <button type="button" onClick={handleAdd} className="rounded-lg bg-highland-700 px-4 py-2 text-sm text-white">Afegir</button>
              <button type="button" onClick={() => setAdding(false)} className="rounded-lg bg-gray-200 px-4 py-2 text-sm">Cancel·lar</button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-emerald-300 bg-white/70 py-3 text-sm font-medium text-highland-700 transition hover:border-emerald-400 hover:bg-white"
          >
            <Plus size={16} /> Proposar idea
          </button>
        )}
      </div>
    </section>
  )
}
