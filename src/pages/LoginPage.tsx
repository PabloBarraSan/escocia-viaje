import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '../hooks/useSession'
import { TRIP_CODE } from '../lib/types'
import { Mountain } from 'lucide-react'

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
    <div className="flex min-h-full flex-col items-center justify-center bg-gradient-to-b from-highland-800 to-highland-900 px-6 safe-top safe-bottom">
      <div className="mb-8 text-center text-white">
        <Mountain size={48} className="mx-auto mb-4 text-highland-200" />
        <h1 className="text-3xl font-bold">Nova Ruta Escòcia</h1>
        <p className="mt-2 text-highland-200">5 – 12 juliol 2026</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-6 shadow-xl">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">El teu nom</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Anna, Jordi..."
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base outline-none focus:border-highland-500 focus:ring-2 focus:ring-highland-200"
            autoComplete="name"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Codi del viatge</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base uppercase outline-none focus:border-highland-500 focus:ring-2 focus:ring-highland-200"
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
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
