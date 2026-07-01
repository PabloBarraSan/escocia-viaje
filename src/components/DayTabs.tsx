export type DayTab = 'horari' | 'practic' | 'grup'

const TABS: Array<{ id: DayTab; label: string }> = [
  { id: 'horari', label: 'Horari' },
  { id: 'practic', label: 'Pràctic' },
  { id: 'grup', label: 'Grup' },
]

export function DayTabs({ value, onChange }: { value: DayTab; onChange: (tab: DayTab) => void }) {
  return (
    <div className="px-4 pb-3 pt-2">
      <div className="flex gap-1 rounded-2xl border border-highland-100 bg-white p-1 shadow-sm" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={value === tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${
              value === tab.id
                ? 'bg-highland-700 text-white shadow-sm'
                : 'text-highland-700 hover:bg-highland-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}
