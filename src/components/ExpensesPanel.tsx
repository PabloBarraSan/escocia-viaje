import { useMemo, useState } from 'react'
import { Plus, ReceiptText, Trash2 } from 'lucide-react'
import { useTripContext } from '../context/TripContext'
import { useSession } from '../hooks/useSession'

export function ExpensesPanel() {
  const { expenses, createExpense, removeExpense } = useTripContext()
  const { session } = useSession()
  const [adding, setAdding] = useState(false)
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [participants, setParticipants] = useState('')
  const [error, setError] = useState('')

  const totals = useMemo(() => {
    const result = new Map<string, number>()
    expenses.forEach((expense) => result.set(expense.paid_by, (result.get(expense.paid_by) ?? 0) + Number(expense.amount)))
    return [...result.entries()].sort((a, b) => b[1] - a[1])
  }, [expenses])

  const save = async () => {
    const parsed = Number(amount.replace(',', '.'))
    if (!session || !description.trim() || !Number.isFinite(parsed) || parsed <= 0) return
    setError('')
    try {
      await createExpense({
        description: description.trim(), amount: parsed, paidBy: session.name,
        participants: participants.split(',').map((name) => name.trim()).filter(Boolean),
      })
      setDescription('')
      setAmount('')
      setParticipants('')
      setAdding(false)
    } catch {
      setError('Falta executar la migració 003 a Supabase.')
    }
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
          <ReceiptText size={16} /> Despeses
        </h2>
        <span className="text-sm font-bold text-highland-800">
          {expenses.reduce((sum, expense) => sum + Number(expense.amount), 0).toFixed(2)} €
        </span>
      </div>
      {totals.length > 0 && (
        <div className="rounded-2xl bg-highland-800 p-4 text-white">
          <p className="text-xs font-bold uppercase text-highland-200">Ha pagat</p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
            {totals.map(([name, total]) => <p key={name}><strong>{name}</strong> · {total.toFixed(2)} €</p>)}
          </div>
        </div>
      )}
      {expenses.map((expense) => (
        <div key={expense.id} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{expense.description}</p>
            <p className="text-xs text-gray-500">Pagat per {expense.paid_by}</p>
          </div>
          <span className="font-bold text-highland-800">{Number(expense.amount).toFixed(2)} €</span>
          <button onClick={() => removeExpense(expense.id)} className="p-1 text-gray-400" aria-label="Esborrar despesa"><Trash2 size={15} /></button>
        </div>
      ))}
      {adding ? (
        <div className="space-y-2 rounded-2xl border-2 border-dashed border-highland-200 p-4">
          <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Sopar, gasolina..." className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
          <input value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Import en €" inputMode="decimal" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
          <input value={participants} onChange={(event) => setParticipants(event.target.value)} placeholder="Per a: Anna, Pau... (opcional)" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
          <div className="flex gap-2">
            <button onClick={save} className="rounded-xl bg-highland-700 px-4 py-2 text-sm font-semibold text-white">Guardar</button>
            <button onClick={() => setAdding(false)} className="rounded-xl bg-gray-200 px-4 py-2 text-sm">Cancel·lar</button>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-highland-200 py-3 text-sm font-medium text-highland-700">
          <Plus size={16} /> Afegir despesa
        </button>
      )}
    </section>
  )
}
