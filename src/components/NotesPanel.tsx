import { useState, useEffect, useRef } from 'react'
import { useTripContext } from '../context/TripContext'
import { useSession } from '../hooks/useSession'
import type { DayNote } from '../lib/types'

export function NotesPanel({ dayId, note }: { dayId: string; note?: DayNote }) {
  const { saveNote } = useTripContext()
  const { session } = useSession()
  const [text, setText] = useState(note?.text ?? '')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setText(note?.text ?? '')
  }, [note?.text])

  const handleChange = (value: string) => {
    setText(value)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      saveNote(dayId, value, session!.name)
    }, 800)
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Notes compartides</h3>
      <textarea
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Escriu notes per al grup... (reserves, idees, recordatoris)"
        rows={4}
        className="w-full resize-none rounded-xl border border-gray-200 bg-amber-50/50 px-4 py-3 text-sm outline-none focus:border-highland-400 focus:ring-2 focus:ring-highland-100"
      />
      {note?.updated_by && note.updated_at && (
        <p className="text-[10px] text-gray-400">
          Última edició: {note.updated_by} · {new Date(note.updated_at).toLocaleString('ca')}
        </p>
      )}
    </div>
  )
}
