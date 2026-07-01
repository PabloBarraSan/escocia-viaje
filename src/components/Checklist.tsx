import { useState } from 'react'
import { Check, Plus, Trash2 } from 'lucide-react'
import { useTripContext } from '../context/TripContext'
import { useSession } from '../hooks/useSession'

export function Checklist() {
  const { checklist, createChecklistItem, toggleChecklistItem, removeChecklistItem } = useTripContext()
  const { session } = useSession()
  const [newItem, setNewItem] = useState('')
  const [adding, setAdding] = useState(false)

  const sorted = [...checklist].sort((a, b) => a.sort_order - b.sort_order)
  const doneCount = sorted.filter((c) => c.done).length

  const handleAdd = async () => {
    if (!newItem.trim()) return
    await createChecklistItem(newItem.trim(), session!.name)
    setNewItem('')
    setAdding(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Checklist</h3>
        <span className="text-xs text-gray-400">{doneCount}/{sorted.length}</span>
      </div>

      <div className="space-y-1">
        {sorted.map((item) => (
          <div key={item.id} className="group flex items-center gap-3 rounded-xl bg-white px-3 py-2.5 border border-gray-100">
            <button
              onClick={() => toggleChecklistItem(item.id, session!.name)}
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
                item.done ? 'border-highland-500 bg-highland-500 text-white' : 'border-gray-300'
              }`}
            >
              {item.done && <Check size={14} />}
            </button>
            <span className={`flex-1 text-sm ${item.done ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
              {item.text}
            </span>
            <button
              onClick={() => removeChecklistItem(item.id)}
              className="opacity-0 group-hover:opacity-100 rounded p-1 text-gray-300 hover:text-red-400"
              aria-label="Esborrar"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {adding ? (
        <div className="flex gap-2">
          <input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Nou element..."
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button onClick={handleAdd} className="rounded-xl bg-highland-700 px-4 py-2 text-sm text-white">OK</button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-highland-200 py-2.5 text-sm font-medium text-highland-600"
        >
          <Plus size={16} /> Afegir
        </button>
      )}
    </div>
  )
}
