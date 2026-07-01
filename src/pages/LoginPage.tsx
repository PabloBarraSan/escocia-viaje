import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '../hooks/useSession'
import { TRIP_CODE } from '../lib/types'
import { LOGIN_PHOTO } from '../lib/dayTheme'

export function LoginPage() {
  const { login } = useSession()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [code, setCode] = useState(TRIP_CODE)
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Introdueix el teu nom')
      return
    }
    if (code.trim().toUpperCase() !== TRIP_CODE) {
      setError('Codi de viatge incorrecte')
      return
    }
    login(name, code)
    navigate('/')
  }

  return (
    <div
      className="relative flex min-h-full flex-col items-center justify-center bg-cover bg-center px-6 safe-top safe-bottom"
      style={{ backgroundImage: `url(${LOGIN_PHOTO})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-highland-950/85 via-highland-900/75 to-highland-950/90" />

      <div className="relative z-10 mb-8 max-w-sm text-center text-white">
        <p className="text-xs font-bold uppercase tracking-wider text-white/70">Juliol 2026</p>
        <h1 className="mt-2 font-display text-3xl font-bold leading-tight">Nova Ruta Escòcia</h1>
        <p className="mt-2 text-sm text-white/80">Glencoe · Skye · Edimburg</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-sm space-y-4 rounded-2xl border border-white/20 bg-white/95 p-6 shadow-2xl backdrop-blur"
      >
        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-gray-500">El teu nom</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Anna, Jordi..."
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base outline-none focus:border-highland-500 focus:ring-2 focus:ring-highland-100"
            autoComplete="name"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-gray-500">Codi del viatge</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base uppercase outline-none focus:border-highland-500 focus:ring-2 focus:ring-highland-100"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-xl bg-highland-700 py-3.5 text-base font-semibold text-white transition active:bg-highland-800"
        >
          Entrar al viatge
        </button>
      </form>
    </div>
  )
}
