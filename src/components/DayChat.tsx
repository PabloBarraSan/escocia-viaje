import { useEffect, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import { useTripContext } from '../context/TripContext'
import { useSession } from '../hooks/useSession'

function formatMessageTime(value: string) {
  return new Date(value).toLocaleString('ca', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function DayChat({ dayId }: { dayId: string }) {
  const { dayMessages, sendDayMessage } = useTripContext()
  const { session } = useSession()
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const messages = dayMessages
    .filter((message) => message.day_id === dayId)
    .sort((a, b) => a.created_at.localeCompare(b.created_at))

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const submit = async () => {
    if (!text.trim() || !session || sending) return
    setError('')
    setSending(true)
    try {
      await sendDayMessage(dayId, text, session.name)
      setText('')
    } catch {
      setError('No s’ha pogut enviar. Executa la migració 004 a Supabase si fas servir el núvol.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col rounded-2xl border border-highland-100 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-4 py-3">
        <p className="font-semibold text-highland-900">Xat del dia</p>
        <p className="text-xs text-gray-500">Missatges només per a aquest dia — coordinació ràpida de la família</p>
      </div>

      <div className="max-h-72 space-y-3 overflow-y-auto px-3 py-4">
        {messages.length === 0 ? (
          <p className="px-2 text-center text-sm text-gray-500">
            Encara no hi ha missatges. Escriu el primer: «Ja som a l’hotel», «Sortim en 10 min»...
          </p>
        ) : (
          messages.map((message) => {
            const mine = session?.name === message.author
            return (
              <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                    mine ? 'rounded-br-md bg-highland-700 text-white' : 'rounded-bl-md bg-gray-100 text-gray-900'
                  }`}
                >
                  {!mine && (
                    <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wide text-highland-600">
                      {message.author}
                    </p>
                  )}
                  <p className="text-sm leading-snug">{message.text}</p>
                  <p className={`mt-1 text-[10px] ${mine ? 'text-white/70' : 'text-gray-400'}`}>
                    {formatMessageTime(message.created_at)}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-gray-100 p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') void submit() }}
            placeholder="Escriu un missatge..."
            className="min-w-0 flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-highland-400"
          />
          <button
            type="button"
            onClick={() => void submit()}
            disabled={!text.trim() || sending}
            className="flex shrink-0 items-center justify-center rounded-xl bg-highland-700 px-3.5 text-white disabled:opacity-40"
            aria-label="Enviar"
          >
            <Send size={18} />
          </button>
        </div>
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </div>
    </div>
  )
}
