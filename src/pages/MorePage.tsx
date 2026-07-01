import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, ClipboardCheck, FileLock2, LogOut, ReceiptText, Text } from 'lucide-react'
import { useSession } from '../hooks/useSession'

const ITEMS = [
  {
    to: '/resum',
    icon: ClipboardCheck,
    title: 'Organització',
    description: 'Allotjaments, cotxe, checklist i decisions',
    color: 'bg-emerald-100 text-emerald-800',
  },
  {
    to: '/despeses',
    icon: ReceiptText,
    title: 'Despeses',
    description: 'Pagaments i comptes del grup',
    color: 'bg-amber-100 text-amber-800',
  },
  {
    to: '/reservas',
    icon: FileLock2,
    title: 'Reserves',
    description: 'Documents privats dels allotjaments',
    color: 'bg-blue-100 text-blue-800',
  },
]

export function MorePage() {
  const { session, logout } = useSession()
  const [largeText, setLargeText] = useState(() => localStorage.getItem('large_text') === 'true')

  useEffect(() => {
    document.documentElement.classList.toggle('large-text', largeText)
    localStorage.setItem('large_text', String(largeText))
  }, [largeText])

  return (
    <main className="safe-top space-y-6 p-4">
      <header>
        <p className="text-sm text-gray-500">Hola, {session?.name}</p>
        <h1 className="text-3xl font-bold text-highland-900">Més opcions</h1>
      </header>

      <div className="space-y-3">
        {ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.to} to={item.to} className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${item.color}`}>
                <Icon size={23} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-lg font-bold text-highland-900">{item.title}</span>
                <span className="block text-sm text-gray-500">{item.description}</span>
              </span>
              <ChevronRight size={21} className="text-gray-300" />
            </Link>
          )
        })}
      </div>

      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
            <Text size={22} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-bold">Lletra gran</p>
            <p className="text-sm text-gray-500">Augmenta la mida dels textos</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={largeText}
            onClick={() => setLargeText((value) => !value)}
            className={`relative h-8 w-14 rounded-full transition ${largeText ? 'bg-highland-700' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition ${largeText ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
      </section>

      <button onClick={logout} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white py-3 font-semibold text-red-600">
        <LogOut size={18} /> Canviar de persona
      </button>
    </main>
  )
}
