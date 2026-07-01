import { useState } from 'react'
import { ThumbsUp, Plus } from 'lucide-react'
import { useTripContext } from '../context/TripContext'
import { useSession } from '../hooks/useSession'

export function IdeasBoard() {
  const { ideas, createIdea, voteIdea } = useTripContext()
  const { session } = useSession()
  const [newIdea, setNewIdea] = useState('')
  const [adding, setAdding] = useState(false)

  const sorted = [...ideas].sort((a, b) => b.votes.length - a.votes.length)

  const handleAdd = async () => {
    if (!newIdea.trim()) return
    await createIdea(newIdea.trim(), session!.name)
    setNewIdea('')
    setAdding(false)
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Idees per a Skye</h3>
      <div className="space-y-2">
        {sorted.map((idea) => {
          const voted = idea.votes.includes(session!.name)
          return (
            <div key={idea.id} className="flex items-center gap-3 rounded-xl bg-white p-3 border border-gray-100">
              <button
                onClick={() => voteIdea(idea.id, session!.name)}
                className={`flex flex-col items-center rounded-lg px-2 py-1 transition ${
                  voted ? 'bg-highland-100 text-highland-700' : 'bg-gray-50 text-gray-400 hover:bg-highland-50'
                }`}
              >
                <ThumbsUp size={16} />
                <span className="text-xs font-bold">{idea.votes.length}</span>
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800">{idea.text}</p>
                <p className="text-[10px] text-gray-400">per {idea.author}</p>
              </div>
            </div>
          )
        })}
      </div>

      {adding ? (
        <div className="space-y-2">
          <input
            value={newIdea}
            onChange={(e) => setNewIdea(e.target.value)}
            placeholder="Proposa una ruta o lloc..."
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
            autoFocus
          />
          <div className="flex gap-2">
            <button onClick={handleAdd} className="rounded-lg bg-highland-700 px-4 py-2 text-sm text-white">Afegir</button>
            <button onClick={() => setAdding(false)} className="rounded-lg bg-gray-200 px-4 py-2 text-sm">Cancel·lar</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-highland-200 py-3 text-sm font-medium text-highland-600"
        >
          <Plus size={16} /> Proposar idea
        </button>
      )}
    </div>
  )
}
