import { useState } from 'react'
import type { Session } from '../lib/types'

const STORAGE_KEY = 'escocia_session'

export function useSession() {
  const [session, setSession] = useState<Session | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  const login = (name: string, code: string) => {
    const s = { name: name.trim(), code: code.trim().toUpperCase() }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
    setSession(s)
  }

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY)
    setSession(null)
  }

  return { session, login, logout, isLoggedIn: !!session }
}

export function useUserName() {
  const { session } = useSession()
  return session?.name ?? 'Anònim'
}
