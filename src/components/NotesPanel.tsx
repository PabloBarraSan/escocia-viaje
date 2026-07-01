import { useState, useEffect, useRef } from 'react'
import { Check, Loader2, Save } from 'lucide-react'
import { useTripContext } from '../context/TripContext'
import { useSession } from '../hooks/useSession'
import type { DayNote } from '../lib/types'

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

export function NotesPanel({ dayId, note }: { dayId: string; note?: DayNote }) {
  const { saveNote } = useTripContext()
  const { session } = useSession()
  const [text, setText] = useState(note?.text ?? '')
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setText(note?.text ?? '')
  }, [note?.text])

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
  }, [])

  const persist = async (value: string) => {
    if (!session?.name) {
      setSaveState('error')
      return
    }
    setSaveState('saving')
    try {
      await saveNote(dayId, value, session.name)
      setSaveState('saved')
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
      savedTimerRef.current = setTimeout(() => setSaveState('idle'), 2500)
    } catch {
      setSaveState('error')
    }
  }

  const handleChange = (value: string) => {
    setText(value)
    setSaveState('idle')
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      void persist(value)
    }, 800)
  }

  const handleSave = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    void persist(text)
  }

  const preview = note?.text?.trim()
  const dirty = text !== (note?.text ?? '')

  return (
    <div className="space-y-3">
      <textarea
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Ex.: Reserva sopar a les 20:30 · Portar impermeable · Cotxe aparcat a X..."
        rows={5}
        className="w-full resize-y rounded-xl border border-gray-200 bg-amber-50/50 px-4 py-3 text-sm outline-none focus:border-highland-400 focus:ring-2 focus:ring-highland-100"
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={!session || saveState === 'saving' || (!dirty && !text.trim())}
          className="flex items-center gap-2 rounded-xl bg-highland-700 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saveState === 'saving' ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Desar nota
        </button>

        <p className="text-xs text-gray-500">
          {saveState === 'saving' && 'Desant...'}
          {saveState === 'saved' && (
            <span className="flex items-center gap-1 font-medium text-highland-700">
              <Check size={14} /> Desat per a tot el grup
            </span>
          )}
          {saveState === 'error' && <span className="text-red-600">No s’ha pogut desar. Torna-ho a provar.</span>}
          {saveState === 'idle' && !dirty && preview && 'Es desa sola en escriure'}
          {saveState === 'idle' && dirty && 'Canvis pendents — es desaran sols o prem Desar'}
        </p>
      </div>

      {note?.updated_by && note.updated_at && (
        <p className="text-[10px] text-gray-400">
          Última edició: {note.updated_by} · {new Date(note.updated_at).toLocaleString('ca')}
        </p>
      )}
    </div>
  )
}
