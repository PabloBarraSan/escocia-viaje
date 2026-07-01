import { useEffect, useState } from 'react'
import type { Session as SupabaseSession } from '@supabase/supabase-js'
import { FileText, LockKeyhole, LogOut, KeyRound } from 'lucide-react'
import { getSupabase, isSupabaseConfigured } from '../lib/supabase'

const FAMILY_ACCOUNT_EMAIL = 'familia@escocia.local'

type ReservationFile = {
  name: string
  id: string | null
}

export function ReservationsPage() {
  const [authSession, setAuthSession] = useState<SupabaseSession | null>(null)
  const [files, setFiles] = useState<ReservationFile[]>([])
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured) return
    const supabase = getSupabase()
    supabase.auth.getSession().then(({ data }) => {
      setAuthSession(data.session)
      setLoading(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthSession(session)
      setLoading(false)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!authSession) {
      setFiles([])
      return
    }
    getSupabase().storage.from('reservas').list('', {
      sortBy: { column: 'name', order: 'asc' },
    }).then(({ data, error }) => {
      setFiles((data ?? []).filter((file) => file.name.toLowerCase().endsWith('.pdf')))
      if (error) setMessage('No se ha podido acceder a las reservas.')
    })
  }, [authSession])

  const signIn = async (event: React.FormEvent) => {
    event.preventDefault()
    setMessage('')
    const { error } = await getSupabase().auth.signInWithPassword({
      email: FAMILY_ACCOUNT_EMAIL,
      password,
    })
    if (error) {
      setMessage('Contraseña incorrecta.')
    } else {
      setPassword('')
    }
  }

  const openFile = async (name: string) => {
    setMessage('')
    const { data, error } = await getSupabase().storage.from('reservas').download(name)
    if (error || !data) {
      setMessage('No se ha podido abrir el documento.')
      return
    }
    const url = URL.createObjectURL(data)
    window.open(url, '_blank', 'noopener,noreferrer')
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
  }

  if (!isSupabaseConfigured) {
    return (
      <main className="mx-auto w-full max-w-lg flex-1 p-4">
        <h1 className="mb-4 text-2xl font-bold">Reservas</h1>
        <div className="rounded-2xl bg-amber-50 p-5 text-sm text-amber-900">
          Configura Supabase para activar los documentos privados.
        </div>
      </main>
    )
  }

  if (loading) return <main className="p-6 text-center">Cargando…</main>

  if (!authSession) {
    return (
      <main className="mx-auto w-full max-w-lg flex-1 p-4">
        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <LockKeyhole className="mb-3 text-highland-700" size={32} />
          <h1 className="text-2xl font-bold">Reservas privadas</h1>
          <p className="mt-2 text-sm text-gray-600">
            Introduce la contraseña familiar. Solo tendrás que hacerlo una vez en este dispositivo.
          </p>
          <form className="mt-5 space-y-3" onSubmit={signIn}>
            <label className="block text-sm font-medium text-gray-700">Contraseña familiar</label>
            <input
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-highland-500"
              autoComplete="current-password"
            />
            <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-highland-700 py-3 font-semibold text-white">
              <KeyRound size={18} />
              Ver reservas
            </button>
          </form>
          {message && <p className="mt-4 text-sm text-gray-600">{message}</p>}
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-lg flex-1 p-4">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reservas</h1>
          <p className="text-xs text-gray-500">Acceso familiar</p>
        </div>
        <button
          onClick={() => getSupabase().auth.signOut()}
          className="rounded-xl p-3 text-gray-500"
          aria-label="Cerrar acceso privado"
        >
          <LogOut size={20} />
        </button>
      </div>
      <div className="space-y-3">
        {files.map((file) => (
          <button
            key={file.id ?? file.name}
            onClick={() => openFile(file.name)}
            className="flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-sm"
          >
            <FileText className="shrink-0 text-highland-700" />
            <span className="min-w-0 truncate font-medium">{file.name}</span>
          </button>
        ))}
        {!files.length && (
          <div className="rounded-2xl bg-white p-5 text-sm text-gray-600 shadow-sm">
            No hay documentos disponibles para este correo.
          </div>
        )}
      </div>
      {message && <p className="mt-4 text-sm text-red-600">{message}</p>}
    </main>
  )
}
