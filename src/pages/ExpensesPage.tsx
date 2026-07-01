import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ExpensesPanel } from '../components/ExpensesPanel'

export function ExpensesPage() {
  const navigate = useNavigate()
  return (
    <main className="safe-top p-4">
      <header className="mb-6 flex items-center gap-3">
        <button onClick={() => navigate('/mes')} className="rounded-full bg-white p-3 shadow-sm" aria-label="Tornar">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-highland-900">Despeses</h1>
          <p className="text-sm text-gray-500">Pagaments del grup</p>
        </div>
      </header>
      <ExpensesPanel />
    </main>
  )
}
